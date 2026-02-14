import type { OpenClawConfig } from "../config/config.js";
import type { RuntimeEnv } from "../runtime.js";
import type { WizardPrompter } from "../wizard/prompts.js";
import { resolveAgentWorkspaceDir, resolveDefaultAgentId } from "../agents/agent-scope.js";
import { formatCliCommand } from "../cli/command-format.js";
import { buildWorkspaceHookStatus } from "../hooks/hooks-status.js";
import { t } from "../i18n/index.js";

export async function setupInternalHooks(
  cfg: OpenClawConfig,
  runtime: RuntimeEnv,
  prompter: WizardPrompter,
): Promise<OpenClawConfig> {
  await prompter.note(
    [
      t("Hooks let you automate actions when agent commands are issued."),
      t("Example: Save session context to memory when you issue /new."),
      "",
      t("Learn more: https://docs.openclaw.ai/automation/hooks"),
    ].join("\n"),
    t("Hooks"),
  );

  // Discover available hooks using the hook discovery system
  const workspaceDir = resolveAgentWorkspaceDir(cfg, resolveDefaultAgentId(cfg));
  const report = buildWorkspaceHookStatus(workspaceDir, { config: cfg });

  // Show every eligible hook so users can opt in during onboarding.
  const eligibleHooks = report.hooks.filter((h) => h.eligible);

  if (eligibleHooks.length === 0) {
    await prompter.note(
      t("No eligible hooks found. You can configure hooks later in your config."),
      t("No Hooks Available"),
    );
    return cfg;
  }

  const toEnable = await prompter.multiselect({
    message: t("Enable hooks?"),
    options: [
      { value: "__skip__", label: t("Skip for now") },
      ...eligibleHooks.map((hook) => ({
        value: hook.name,
        label: `${hook.emoji ?? "🔗"} ${hook.name}`,
        hint: hook.description,
      })),
    ],
  });

  const selected = toEnable.filter((name) => name !== "__skip__");
  if (selected.length === 0) {
    return cfg;
  }

  // Enable selected hooks using the new entries config format
  const entries = { ...cfg.hooks?.internal?.entries };
  for (const name of selected) {
    entries[name] = { enabled: true };
  }

  const next: OpenClawConfig = {
    ...cfg,
    hooks: {
      ...cfg.hooks,
      internal: {
        enabled: true,
        entries,
      },
    },
  };

  await prompter.note(
    [
      selected.length === 1
        ? t("Enabled 1 hook: {hooks}").replace("{hooks}", selected[0])
        : t("Enabled {count} hooks: {hooks}")
            .replace("{count}", String(selected.length))
            .replace("{hooks}", selected.join(t(", "))),
      "",
      t("You can manage hooks later with:"),
      `  ${formatCliCommand(t("openclaw hooks list"))}`,
      `  ${formatCliCommand(t("openclaw hooks enable <name>"))}`,
      `  ${formatCliCommand(t("openclaw hooks disable <name>"))}`,
    ].join("\n"),
    t("Hooks Configured"),
  );

  return next;
}
