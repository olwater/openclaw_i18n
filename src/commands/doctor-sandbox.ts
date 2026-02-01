import fs from "node:fs";
import path from "node:path";
import type { OpenClawConfig } from "../config/config.js";
import type { RuntimeEnv } from "../runtime.js";
import type { DoctorPrompter } from "./doctor-prompter.js";
import {
  DEFAULT_SANDBOX_BROWSER_IMAGE,
  DEFAULT_SANDBOX_COMMON_IMAGE,
  DEFAULT_SANDBOX_IMAGE,
  resolveSandboxScope,
} from "../agents/sandbox.js";
import { t } from "../i18n/index.js";
import { runCommandWithTimeout, runExec } from "../process/exec.js";
import { note } from "../terminal/note.js";

type SandboxScriptInfo = {
  scriptPath: string;
  cwd: string;
};

function resolveSandboxScript(scriptRel: string): SandboxScriptInfo | null {
  const candidates = new Set<string>();
  candidates.add(process.cwd());
  const argv1 = process.argv[1];
  if (argv1) {
    const normalized = path.resolve(argv1);
    candidates.add(path.resolve(path.dirname(normalized), ".."));
    candidates.add(path.resolve(path.dirname(normalized)));
  }

  for (const root of candidates) {
    const scriptPath = path.join(root, scriptRel);
    if (fs.existsSync(scriptPath)) {
      return { scriptPath, cwd: root };
    }
  }

  return null;
}

async function runSandboxScript(scriptRel: string, runtime: RuntimeEnv): Promise<boolean> {
  const script = resolveSandboxScript(scriptRel);
  if (!script) {
    note(`Unable to locate ${scriptRel}. Run it from the repo root.`, "Sandbox");
    return false;
  }

  runtime.log(`Running ${scriptRel}...`);
  const result = await runCommandWithTimeout(["bash", script.scriptPath], {
    timeoutMs: 20 * 60 * 1000,
    cwd: script.cwd,
  });
  if (result.code !== 0) {
    runtime.error(
      `Failed running ${scriptRel}: ${
        result.stderr.trim() || result.stdout.trim() || t("unknown error")
      }`,
    );
    return false;
  }

  runtime.log(`Completed ${scriptRel}.`);
  return true;
}

async function isDockerAvailable(): Promise<boolean> {
  try {
    await runExec("docker", ["version", "--format", "{{.Server.Version}}"], {
      timeoutMs: 5_000,
    });
    return true;
  } catch {
    return false;
  }
}

async function dockerImageExists(image: string): Promise<boolean> {
  try {
    await runExec("docker", ["image", "inspect", image], { timeoutMs: 5_000 });
    return true;
  } catch (error: any) {
    const stderr = error?.stderr || error?.message || "";
    if (String(stderr).includes(t("No such image"))) {
      return false;
    }
    throw error;
  }
}

function resolveSandboxDockerImage(cfg: OpenClawConfig): string {
  const image = cfg.agents?.defaults?.sandbox?.docker?.image?.trim();
  return image ? image : DEFAULT_SANDBOX_IMAGE;
}

function resolveSandboxBrowserImage(cfg: OpenClawConfig): string {
  const image = cfg.agents?.defaults?.sandbox?.browser?.image?.trim();
  return image ? image : DEFAULT_SANDBOX_BROWSER_IMAGE;
}

function updateSandboxDockerImage(cfg: OpenClawConfig, image: string): OpenClawConfig {
  return {
    ...cfg,
    agents: {
      ...cfg.agents,
      defaults: {
        ...cfg.agents?.defaults,
        sandbox: {
          ...cfg.agents?.defaults?.sandbox,
          docker: {
            ...cfg.agents?.defaults?.sandbox?.docker,
            image,
          },
        },
      },
    },
  };
}

function updateSandboxBrowserImage(cfg: OpenClawConfig, image: string): OpenClawConfig {
  return {
    ...cfg,
    agents: {
      ...cfg.agents,
      defaults: {
        ...cfg.agents?.defaults,
        sandbox: {
          ...cfg.agents?.defaults?.sandbox,
          browser: {
            ...cfg.agents?.defaults?.sandbox?.browser,
            image,
          },
        },
      },
    },
  };
}

type SandboxImageCheck = {
  kind: string;
  image: string;
  buildScript?: string;
  updateConfig: (image: string) => void;
};

async function handleMissingSandboxImage(
  params: SandboxImageCheck,
  runtime: RuntimeEnv,
  prompter: DoctorPrompter,
) {
  const exists = await dockerImageExists(params.image);
  if (exists) {
    return;
  }

  const buildHint = params.buildScript
    ? `Build it with ${params.buildScript}.`
    : t("Build or pull it first.");
  note(`Sandbox ${params.kind} image missing: ${params.image}. ${buildHint}`, "Sandbox");

  let built = false;
  if (params.buildScript) {
    const build = await prompter.confirmSkipInNonInteractive({
      message: `Build ${params.kind} sandbox image now?`,
      initialValue: true,
    });
    if (build) {
      built = await runSandboxScript(params.buildScript, runtime);
    }
  }

  if (built) {
    return;
  }
}

export async function maybeRepairSandboxImages(
  cfg: OpenClawConfig,
  runtime: RuntimeEnv,
  prompter: DoctorPrompter,
): Promise<OpenClawConfig> {
  const sandbox = cfg.agents?.defaults?.sandbox;
  const mode = sandbox?.mode ?? "off";
  if (!sandbox || mode === "off") {
    return cfg;
  }

  const dockerAvailable = await isDockerAvailable();
  if (!dockerAvailable) {
    note(t("Docker not available; skipping sandbox image checks."), "Sandbox");
    return cfg;
  }

  const images: SandboxImageCheck[] = [];
  const scope = resolveSandboxScope(cfg);

  if (scope.docker) {
    images.push({
      kind: "Docker",
      image: resolveSandboxDockerImage(cfg),
      buildScript: "scripts/build-sandbox-docker.sh",
      updateConfig: (image) => (cfg = updateSandboxDockerImage(cfg, image)),
    });
  }

  if (scope.browser) {
    images.push({
      kind: "Browser",
      image: resolveSandboxBrowserImage(cfg),
      buildScript: "scripts/build-sandbox-browser.sh",
      updateConfig: (image) => (cfg = updateSandboxBrowserImage(cfg, image)),
    });
  }

  for (const img of images) {
    await handleMissingSandboxImage(img, runtime, prompter);
  }

  return cfg;
}
