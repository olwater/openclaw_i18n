import type { Command } from "commander";
import { sandboxExplainCommand } from "../commands/sandbox-explain.js";
import { sandboxListCommand, sandboxRecreateCommand } from "../commands/sandbox.js";
import { t } from "../i18n/index.js";
import { defaultRuntime } from "../runtime.js";
import { formatDocsLink } from "../terminal/links.js";
import { theme } from "../terminal/theme.js";
import { formatHelpExamples } from "./help-format.js";

// --- Types ---

type CommandOptions = Record<string, unknown>;

// --- Helpers ---

const SANDBOX_EXAMPLES = {
  main: [
    [t("openclaw sandbox list"), t("List all sandbox containers.")],
    [t("openclaw sandbox list --browser"), t("List only browser containers.")],
    [t("openclaw sandbox recreate --all"), t("Recreate all containers.")],
    [t("openclaw sandbox recreate --session main"), t("Recreate a specific session.")],
    [t("openclaw sandbox recreate --agent mybot"), t("Recreate agent containers.")],
    [t("openclaw sandbox explain"), t("Explain effective sandbox config.")],
  ],
  list: [
    [t("openclaw sandbox list"), t("List all sandbox containers.")],
    [t("openclaw sandbox list --browser"), t("List only browser containers.")],
    [t("openclaw sandbox list --json"), t("JSON output.")],
  ],
  recreate: [
    [t("openclaw sandbox recreate --all"), t("Recreate all containers.")],
    [t("openclaw sandbox recreate --session main"), t("Recreate a specific session.")],
    [
      t("openclaw sandbox recreate --agent mybot"),
      t("Recreate a specific agent (includes sub-agents)."),
    ],
    [t("openclaw sandbox recreate --browser --all"), t("Recreate only browser containers.")],
    [t("openclaw sandbox recreate --all --force"), t("Skip confirmation.")],
  ],
  explain: [
    [t("openclaw sandbox explain"), t("Show effective sandbox config.")],
    [t("openclaw sandbox explain --session agent:main:main"), t("Explain a specific session.")],
    [t("openclaw sandbox explain --agent work"), t("Explain an agent sandbox.")],
    [t("openclaw sandbox explain --json"), t("JSON output.")],
  ],
} as const;

function createRunner(
  commandFn: (opts: CommandOptions, runtime: typeof defaultRuntime) => Promise<void>,
) {
  return async (opts: CommandOptions) => {
    try {
      await commandFn(opts, defaultRuntime);
    } catch (err) {
      defaultRuntime.error(String(err));
      defaultRuntime.exit(1);
    }
  };
}

// --- Registration ---

export function registerSandboxCli(program: Command) {
  const sandbox = program
    .command("sandbox")
    .description(t("Manage sandbox containers (Docker-based agent isolation)"))
    .addHelpText(
      "after",
      () => `\n${theme.heading("Examples:")}\n${formatHelpExamples(SANDBOX_EXAMPLES.main)}\n`,
    )
    .addHelpText(
      "after",
      () =>
        `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/sandbox", "docs.openclaw.ai/cli/sandbox")}\n`,
    )
    .action(() => {
      sandbox.help({ error: true });
    });

  // --- List Command ---

  sandbox
    .command("list")
    .description(t("List sandbox containers and their status"))
    .option("--json", t("Output result as JSON"), false)
    .option("--browser", t("List browser containers only"), false)
    .addHelpText(
      "after",
      () =>
        `\n${theme.heading("Examples:")}\n${formatHelpExamples(SANDBOX_EXAMPLES.list)}\n\n${theme.heading(
          t("Output includes:"),
        )}\n${theme.muted("- Container name and status (running/stopped)")}\n${theme.muted(
          "- Docker image and whether it matches current config",
        )}\n${theme.muted("- Age (time since creation)")}\n${theme.muted(
          "- Idle time (time since last use)",
        )}\n${theme.muted("- Associated session/agent ID")}`,
    )
    .action(
      createRunner((opts) =>
        sandboxListCommand(
          {
            browser: Boolean(opts.browser),
            json: Boolean(opts.json),
          },
          defaultRuntime,
        ),
      ),
    );

  // --- Recreate Command ---

  sandbox
    .command("recreate")
    .description(t("Remove containers to force recreation with updated config"))
    .option("--all", t("Recreate all sandbox containers"), false)
    .option("--session <key>", t("Recreate container for specific session"))
    .option("--agent <id>", t("Recreate containers for specific agent"))
    .option("--browser", t("Only recreate browser containers"), false)
    .option("--force", t("Skip confirmation prompt"), false)
    .addHelpText(
      "after",
      () =>
        `\n${theme.heading("Examples:")}\n${formatHelpExamples(SANDBOX_EXAMPLES.recreate)}\n\n${theme.heading(
          t("Why use this?"),
        )}\n${theme.muted(
          t(
            "After updating Docker images or sandbox configuration, existing containers continue running with old settings.",
          ),
        )}\n${theme.muted(
          t(
            "This command removes them so they'll be recreated automatically with current config when next needed.",
          ),
        )}\n\n${theme.heading(t("Filter options:"))}\n${theme.muted(
          t("  --all          Remove all sandbox containers"),
        )}\n${theme.muted(
          t("  --session      Remove container for specific session key"),
        )}\n${theme.muted(
          t("  --agent        Remove containers for agent (includes agent:id:* variants)"),
        )}\n\n${theme.heading("Modifiers:")}\n${theme.muted(
          t("  --browser      Only affect browser containers (not regular sandbox)"),
        )}\n${theme.muted(t("  --force        Skip confirmation prompt"))}`,
    )
    .action(
      createRunner((opts) =>
        sandboxRecreateCommand(
          {
            all: Boolean(opts.all),
            session: opts.session as string | undefined,
            agent: opts.agent as string | undefined,
            browser: Boolean(opts.browser),
            force: Boolean(opts.force),
          },
          defaultRuntime,
        ),
      ),
    );

  // --- Explain Command ---

  sandbox
    .command("explain")
    .description(t("Explain effective sandbox/tool policy for a session/agent"))
    .option("--session <key>", t("Session key to inspect (defaults to agent main)"))
    .option("--agent <id>", t("Agent id to inspect (defaults to derived agent)"))
    .option("--json", t("Output result as JSON"), false)
    .addHelpText(
      "after",
      () => `\n${theme.heading("Examples:")}\n${formatHelpExamples(SANDBOX_EXAMPLES.explain)}\n`,
    )
    .action(
      createRunner((opts) =>
        sandboxExplainCommand(
          {
            session: opts.session as string | undefined,
            agent: opts.agent as string | undefined,
            json: Boolean(opts.json),
          },
          defaultRuntime,
        ),
      ),
    );
}
