import type { Command } from "commander";
import { t } from "../i18n/index.js";
import { defaultRuntime } from "../runtime.js";
import { formatDocsLink } from "../terminal/links.js";
import { theme } from "../terminal/theme.js";
import { formatHelpExamples } from "./help-format.js";
import {
  type UpdateCommandOptions,
  type UpdateStatusOptions,
  type UpdateWizardOptions,
} from "./update-cli/shared.js";
import { updateStatusCommand } from "./update-cli/status.js";
import { updateCommand } from "./update-cli/update-command.js";
import { updateWizardCommand } from "./update-cli/wizard.js";

export { updateCommand, updateStatusCommand, updateWizardCommand };
export type { UpdateCommandOptions, UpdateStatusOptions, UpdateWizardOptions };

export function registerUpdateCli(program: Command) {
  const update = program
    .command("update")
    .description(t("Update OpenClaw to the latest version"))
    .option("--json", t("Output result as JSON"), false)
    .option("--no-restart", t("Skip restarting the gateway service after a successful update"))
    .option("--channel <stable|beta|dev>", t("Persist update channel (git + npm)"))
    .option("--tag <dist-tag|version>", t("Override npm dist-tag or version for this update"))
    .option("--timeout <seconds>", t("Timeout for each update step in seconds (default: 1200)"))
    .option("--yes", t("Skip confirmation prompts (non-interactive)"), false)
    .addHelpText("after", () => {
      const examples = [
        ["openclaw update", t("Update a source checkout (git)")],
        ["openclaw update --channel beta", t("Switch to beta channel (git + npm)")],
        ["openclaw update --channel dev", t("Switch to dev channel (git + npm)")],
        ["openclaw update --tag beta", t("One-off update to a dist-tag or version")],
        ["openclaw update --no-restart", t("Update without restarting the service")],
        ["openclaw update --json", t("Output result as JSON")],
        ["openclaw update --yes", t("Non-interactive (accept downgrade prompts)")],
        ["openclaw update wizard", t("Interactive update wizard")],
        ["openclaw --update", t("Shorthand for openclaw update")],
      ] as const;
      const fmtExamples = examples
        .map(([cmd, desc]) => `  ${theme.command(cmd)} ${theme.muted(`# ${desc}`)}`)
        .join("\n");
      return `
${theme.heading(t("What this does:"))}
  - ${t("Git checkouts: fetches, rebases, installs deps, builds, and runs doctor")}
  - ${t("npm installs: updates via detected package manager")}

${theme.heading(t("Switch channels:"))}
  - ${t("Use --channel stable|beta|dev to persist the update channel in config")}
  - ${t("Run openclaw update status to see the active channel and source")}
  - ${t("Use --tag <dist-tag|version> for a one-off npm update without persisting")}

${theme.heading(t("Non-interactive:"))}
  - ${t("Use --yes to accept downgrade prompts")}
  - ${t("Combine with --channel/--tag/--restart/--json/--timeout as needed")}

${theme.heading(t("Examples:"))}
${fmtExamples}

${theme.heading(t("Notes:"))}
  - ${t("Switch channels with --channel stable|beta|dev")}
  - ${t("For global installs: auto-updates via detected package manager when possible (see docs/install/updating.md)")}
  - ${t("Downgrades require confirmation (can break configuration)")}
  - ${t("Skips update if the working directory has uncommitted changes")}

${theme.muted(t("Docs:"))} ${formatDocsLink("/cli/update", "docs.openclaw.ai/cli/update")}`;
    })
    .action(async (opts) => {
      try {
        await updateCommand({
          json: Boolean(opts.json),
          restart: Boolean(opts.restart),
          channel: opts.channel as string | undefined,
          tag: opts.tag as string | undefined,
          timeout: opts.timeout as string | undefined,
          yes: Boolean(opts.yes),
        });
      } catch (err) {
        defaultRuntime.error(String(err));
        defaultRuntime.exit(1);
      }
    });

  update
    .command("wizard")
    .description(t("Interactive update wizard"))
    .option("--timeout <seconds>", t("Timeout for each update step in seconds (default: 1200)"))
    .addHelpText(
      "after",
      `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/update", "docs.openclaw.ai/cli/update")}\n`,
    )
    .action(async (opts) => {
      try {
        await updateWizardCommand({
          timeout: opts.timeout as string | undefined,
        });
      } catch (err) {
        defaultRuntime.error(String(err));
        defaultRuntime.exit(1);
      }
    });

  update
    .command("status")
    .description(t("Show update channel and version status"))
    .option("--json", t("Output result as JSON"), false)
    .option("--timeout <seconds>", t("Timeout for update checks in seconds (default: 3)"))
    .addHelpText(
      "after",
      () =>
        `\n${theme.heading(t("Examples:"))}\n${formatHelpExamples([
          ["openclaw update status", t("Show channel + version status.")],
          ["openclaw update status --json", t("JSON output.")],
          ["openclaw update status --timeout 10", t("Custom timeout.")],
        ])}\n\n${theme.heading(t("Notes:"))}\n${theme.muted(
          t("- Shows current update channel (stable/beta/dev) and source"),
        )}\n${theme.muted(t("- Includes git tag/branch/SHA for source checkouts"))}\n\n${theme.muted(
          t("Docs:"),
        )} ${formatDocsLink("/cli/update", "docs.openclaw.ai/cli/update")}`,
    )
    .action(async (opts) => {
      try {
        await updateStatusCommand({
          json: Boolean(opts.json),
          timeout: opts.timeout as string | undefined,
        });
      } catch (err) {
        defaultRuntime.error(String(err));
        defaultRuntime.exit(1);
      }
    });
}
