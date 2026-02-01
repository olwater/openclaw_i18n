import type { Command } from "commander";
import { healthCommand } from "../../commands/health.js";
import { sessionsCommand } from "../../commands/sessions.js";
import { statusCommand } from "../../commands/status.js";
import { setVerbose } from "../../globals.js";
import { t } from "../../i18n/index.js";
import { defaultRuntime } from "../../runtime.js";
import { formatDocsLink } from "../../terminal/links.js";
import { theme } from "../../terminal/theme.js";
import { runCommandWithRuntime } from "../cli-utils.js";
import { formatHelpExamples } from "../help-format.js";
import { parsePositiveIntOrUndefined } from "./helpers.js";

function resolveVerbose(opts: { verbose?: boolean; debug?: boolean }): boolean {
  return Boolean(opts.verbose || opts.debug);
}

function parseTimeoutMs(timeout: unknown): number | null | undefined {
  const parsed = parsePositiveIntOrUndefined(timeout);
  if (timeout !== undefined && parsed === undefined) {
    defaultRuntime.error(t("--timeout must be a positive integer (milliseconds)"));
    defaultRuntime.exit(1);
    return null;
  }
  return parsed;
}

export function registerStatusHealthSessionsCommands(program: Command) {
  program
    .command("status")
    .description(t("Show channel health and recent session recipients"))
    .option("--json", t("Output JSON instead of text"), false)
    .option("--all", t("Full diagnosis (read-only, pasteable)"), false)
    .option("--usage", t("Show model provider usage/quota snapshots"), false)
    .option(
      "--deep",
      t("Probe channels (WhatsApp Web + Telegram + Discord + Slack + Signal)"),
      false,
    )
    .option("--timeout <ms>", t("Probe timeout in milliseconds"), "10000")
    .option("--verbose", t("Verbose logging"), false)
    .option("--debug", t("Alias for --verbose"), false)
    .addHelpText(
      "after",
      () =>
        `\n${theme.heading("Examples:")}\n${formatHelpExamples([
          [t("openclaw status"), t("Show channel health + session summary.")],
          [t("openclaw status --all"), t("Full diagnosis (read-only).")],
          [t("openclaw status --json"), t("Machine-readable output.")],
          [t("openclaw status --usage"), t("Show model provider usage/quota snapshots.")],
          [
            t("openclaw status --deep"),
            t("Run channel probes (WA + Telegram + Discord + Slack + Signal)."),
          ],
          [t("openclaw status --deep --timeout 5000"), t("Tighten probe timeout.")],
        ])}`,
    )
    .addHelpText(
      "after",
      () =>
        `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/status", "docs.openclaw.ai/cli/status")}\n`,
    )
    .action(async (opts) => {
      const verbose = resolveVerbose(opts);
      setVerbose(verbose);
      const timeout = parseTimeoutMs(opts.timeout);
      if (timeout === null) {
        return;
      }
      await runCommandWithRuntime(defaultRuntime, async () => {
        await statusCommand(
          {
            json: Boolean(opts.json),
            all: Boolean(opts.all),
            deep: Boolean(opts.deep),
            usage: Boolean(opts.usage),
            timeoutMs: timeout,
            verbose,
          },
          defaultRuntime,
        );
      });
    });

  program
    .command("health")
    .description(t("Fetch health from the running gateway"))
    .option("--json", t("Output JSON instead of text"), false)
    .option("--timeout <ms>", t("Connection timeout in milliseconds"), "10000")
    .option("--verbose", t("Verbose logging"), false)
    .option("--debug", t("Alias for --verbose"), false)
    .addHelpText(
      "after",
      () =>
        `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/health", "docs.openclaw.ai/cli/health")}\n`,
    )
    .action(async (opts) => {
      const verbose = resolveVerbose(opts);
      setVerbose(verbose);
      const timeout = parseTimeoutMs(opts.timeout);
      if (timeout === null) {
        return;
      }
      await runCommandWithRuntime(defaultRuntime, async () => {
        await healthCommand(
          {
            json: Boolean(opts.json),
            timeoutMs: timeout,
            verbose,
          },
          defaultRuntime,
        );
      });
    });

  program
    .command("sessions")
    .description(t("List stored conversation sessions"))
    .option("--json", t("Output as JSON"), false)
    .option("--verbose", t("Verbose logging"), false)
    .option("--store <path>", t("Path to session store (default: resolved from config)"))
    .option("--active <minutes>", t("Only show sessions updated within the past N minutes"))
    .addHelpText(
      "after",
      () =>
        `\n${theme.heading("Examples:")}\n${formatHelpExamples([
          [t("openclaw sessions"), t("List all sessions.")],
          [t("openclaw sessions --active 120"), t("Only last 2 hours.")],
          [t("openclaw sessions --json"), t("Machine-readable output.")],
          [t("openclaw sessions --store ./tmp/sessions.json"), t("Use a specific session store.")],
        ])}\n\n${theme.muted(
          t(
            "Shows token usage per session when the agent reports it; set agents.defaults.contextTokens to see % of your model window.",
          ),
        )}`,
    )
    .addHelpText(
      "after",
      () =>
        `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/sessions", "docs.openclaw.ai/cli/sessions")}\n`,
    )
    .action(async (opts) => {
      setVerbose(Boolean(opts.verbose));
      await sessionsCommand(
        {
          json: Boolean(opts.json),
          store: opts.store as string | undefined,
          active: opts.active as string | undefined,
        },
        defaultRuntime,
      );
    });
}
