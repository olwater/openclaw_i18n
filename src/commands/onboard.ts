import type { RuntimeEnv } from "../runtime.js";
import type { OnboardOptions } from "./onboard-types.js";
import { formatCliCommand } from "../cli/command-format.js";
import { readConfigFileSnapshot } from "../config/config.js";
import { t } from "../i18n/index.js";
import { assertSupportedRuntime } from "../infra/runtime-guard.js";
import { defaultRuntime } from "../runtime.js";
import { resolveUserPath } from "../utils.js";
import { isDeprecatedAuthChoice, normalizeLegacyOnboardAuthChoice } from "./auth-choice-legacy.js";
import { DEFAULT_WORKSPACE, handleReset } from "./onboard-helpers.js";
import { runInteractiveOnboarding } from "./onboard-interactive.js";
import { runNonInteractiveOnboarding } from "./onboard-non-interactive.js";

export async function onboardCommand(opts: OnboardOptions, runtime: RuntimeEnv = defaultRuntime) {
  assertSupportedRuntime(runtime);
  const originalAuthChoice = opts.authChoice;
  const normalizedAuthChoice = normalizeLegacyOnboardAuthChoice(originalAuthChoice);
  if (opts.nonInteractive && isDeprecatedAuthChoice(originalAuthChoice)) {
    runtime.error(
      [
<<<<<<< HEAD
        t('Auth choice "{authChoice}" is deprecated.').replace("{authChoice}", authChoice),
        t('Use "--auth-choice token" (Anthropic setup-token) or "--auth-choice openai-codex".'),
=======
        `Auth choice "${String(originalAuthChoice)}" is deprecated.`,
        'Use "--auth-choice token" (Anthropic setup-token) or "--auth-choice openai-codex".',
>>>>>>> origin/main
      ].join("\n"),
    );
    runtime.exit(1);
    return;
  }
<<<<<<< HEAD
  if (authChoice === "claude-cli") {
    runtime.log(t('Auth choice "claude-cli" is deprecated; using setup-token flow instead.'));
  }
  if (authChoice === "codex-cli") {
    runtime.log(t('Auth choice "codex-cli" is deprecated; using OpenAI Codex OAuth instead.'));
=======
  if (originalAuthChoice === "claude-cli") {
    runtime.log('Auth choice "claude-cli" is deprecated; using setup-token flow instead.');
  }
  if (originalAuthChoice === "codex-cli") {
    runtime.log('Auth choice "codex-cli" is deprecated; using OpenAI Codex OAuth instead.');
>>>>>>> origin/main
  }
  const flow = opts.flow === "manual" ? ("advanced" as const) : opts.flow;
  const normalizedOpts =
    normalizedAuthChoice === opts.authChoice && flow === opts.flow
      ? opts
      : { ...opts, authChoice: normalizedAuthChoice, flow };

  if (normalizedOpts.nonInteractive && normalizedOpts.acceptRisk !== true) {
    runtime.error(
      [
        t("Non-interactive onboarding requires explicit risk acknowledgement."),
        t("Read: https://docs.openclaw.ai/security"),
        `${t("Re-run with:")} ${formatCliCommand(t("openclaw onboard --non-interactive --accept-risk ..."))}`,
      ].join("\n"),
    );
    runtime.exit(1);
    return;
  }

  if (normalizedOpts.reset) {
    const snapshot = await readConfigFileSnapshot();
    const baseConfig = snapshot.valid ? snapshot.config : {};
    const workspaceDefault =
      normalizedOpts.workspace ?? baseConfig.agents?.defaults?.workspace ?? DEFAULT_WORKSPACE;
    await handleReset("full", resolveUserPath(workspaceDefault), runtime);
  }

  if (process.platform === "win32") {
    runtime.log(
      [
        t("Windows detected."),
        t("WSL2 is strongly recommended; native Windows is untested and more problematic."),
        t("Guide: https://docs.openclaw.ai/windows"),
      ].join("\n"),
    );
  }

  if (normalizedOpts.nonInteractive) {
    await runNonInteractiveOnboarding(normalizedOpts, runtime);
    return;
  }

  await runInteractiveOnboarding(normalizedOpts, runtime);
}

export type { OnboardOptions } from "./onboard-types.js";
