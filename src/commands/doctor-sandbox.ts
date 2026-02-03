import fs from "node:fs";
import path from "node:path";
import type { OpenClawConfig } from "../config/config.js";
import type { RuntimeEnv } from "../runtime.js";
import type { DoctorPrompter } from "./doctor-prompter.js";
import { resolveSandboxConfigForAgent } from "../agents/sandbox.js";
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
    note(
      t("Unable to locate {{script}}. Run it from the repo root.", { script: scriptRel }),
      "Sandbox",
    );
    return false;
  }

  runtime.log(t("Running {{script}}...", { script: scriptRel }));
  const result = await runCommandWithTimeout(["bash", script.scriptPath], {
    timeoutMs: 20 * 60 * 1000,
    cwd: script.cwd,
  });
  if (result.code !== 0) {
    runtime.error(
      t("Failed running {{script}}: {{error}}", {
        script: scriptRel,
        error: result.stderr.trim() || result.stdout.trim() || t("unknown error"),
      }),
    );
    return false;
  }

  runtime.log(t("Completed {{script}}.", { script: scriptRel }));
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
  } catch (error: unknown) {
    const err = error as { stderr?: string; message?: string };
    const stderr = err?.stderr || err?.message || "";
    if (String(stderr).includes(t("No such image"))) {
      return false;
    }
    throw error;
  }
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
    ? t("Build it with {{script}}.", { script: params.buildScript })
    : t("Build or pull it first.");
  note(
    t("Sandbox {{kind}} image missing: {{image}}. {{hint}}", {
      kind: params.kind,
      image: params.image,
      hint: buildHint,
    }),
    "Sandbox",
  );

  let built = false;
  if (params.buildScript) {
    const build = await prompter.confirmSkipInNonInteractive({
      message: t("Build {{kind}} sandbox image now?", { kind: params.kind }),
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
  const sandboxConfig = resolveSandboxConfigForAgent(cfg);

  images.push({
    kind: "Docker",
    image: sandboxConfig.docker.image,
    buildScript: "scripts/build-sandbox-docker.sh",
    updateConfig: (image) => (cfg = updateSandboxDockerImage(cfg, image)),
  });

  if (sandboxConfig.browser.enabled) {
    images.push({
      kind: "Browser",
      image: sandboxConfig.browser.image,
      buildScript: "scripts/build-sandbox-browser.sh",
      updateConfig: (image) => (cfg = updateSandboxBrowserImage(cfg, image)),
    });
  }

  for (const img of images) {
    await handleMissingSandboxImage(img, runtime, prompter);
  }

  return cfg;
}

export function noteSandboxScopeWarnings(cfg: OpenClawConfig) {
  const globalSandbox = cfg.agents?.defaults?.sandbox;
  if (!globalSandbox || globalSandbox.mode === "off") {
    return;
  }

  const globalSandboxConfig = resolveSandboxConfigForAgent(cfg);
  if (globalSandboxConfig.scope === "shared") {
    note(
      t(
        "Sandbox scope is set to 'shared'. This means all agents and sessions share the same container and workspace. This is less secure and can lead to side effects between tasks.",
      ),
      "Sandbox",
    );
  }

  const agents = cfg.agents?.list;
  if (!Array.isArray(agents)) {
    return;
  }

  for (const agent of agents) {
    if (!agent?.id || !agent.sandbox) {
      continue;
    }

    const agentSandboxConfig = resolveSandboxConfigForAgent(cfg, agent.id);
    if (agentSandboxConfig.scope !== "shared") {
      continue;
    }

    const overrides: string[] = [];
    if (agent.sandbox.docker) {
      overrides.push("docker");
    }
    if (agent.sandbox.browser) {
      overrides.push("browser");
    }
    if (agent.sandbox.prune) {
      overrides.push("prune");
    }

    if (overrides.length > 0) {
      note(
        t(
          'Sandbox overrides for agents.list (id "{{agentId}}") sandbox {{overrides}} are ignored because the scope resolves to "shared". Shared sandboxes always use the global configuration for these settings.',
          { agentId: agent.id, overrides: overrides.join(", ") },
        ),
        "Sandbox",
      );
    }
  }
}
