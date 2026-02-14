import type { Command } from "commander";
import { runAcpClientInteractive } from "../acp/client.js";
import { serveAcpGateway } from "../acp/server.js";
import { t } from "../i18n/index.js";
import { defaultRuntime } from "../runtime.js";
import { formatDocsLink } from "../terminal/links.js";
import { theme } from "../terminal/theme.js";

export function registerAcpCli(program: Command) {
  const acp = program.command("acp").description(t("Run an ACP bridge backed by the Gateway"));

  acp
    .option(
      "--url <url>",
      t("Gateway WebSocket URL (defaults to gateway.remote.url when configured)"),
    )
    .option("--token <token>", t("Gateway token (if required)"))
    .option("--password <password>", t("Gateway password (if required)"))
    .option("--session <key>", t("Default session key (e.g. agent:main:main)"))
    .option("--session-label <label>", t("Default session label to resolve"))
    .option("--require-existing", t("Fail if the session key/label does not exist"), false)
    .option("--reset-session", t("Reset the session key before first use"), false)
    .option("--no-prefix-cwd", t("Do not prefix prompts with the working directory"), false)
    .option("--verbose, -v", t("Verbose logging to stderr"), false)
    .addHelpText(
      "after",
      () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/acp", "docs.openclaw.ai/cli/acp")}\n`,
    )
    .action(async (opts) => {
      try {
        await serveAcpGateway({
          gatewayUrl: opts.url as string | undefined,
          gatewayToken: opts.token as string | undefined,
          gatewayPassword: opts.password as string | undefined,
          defaultSessionKey: opts.session as string | undefined,
          defaultSessionLabel: opts.sessionLabel as string | undefined,
          requireExistingSession: Boolean(opts.requireExisting),
          resetSession: Boolean(opts.resetSession),
          prefixCwd: !opts.noPrefixCwd,
          verbose: Boolean(opts.verbose),
        });
      } catch (err) {
        defaultRuntime.error(String(err));
        defaultRuntime.exit(1);
      }
    });

  acp
    .command("client")
    .description(t("Run an interactive ACP client against the local ACP bridge"))
    .option("--cwd <dir>", t("Working directory for the ACP session"))
    .option("--server <command>", t("ACP server command (default: openclaw)"))
    .option("--server-args <args...>", t("Extra arguments for the ACP server"))
    .option("--server-verbose", t("Enable verbose logging on the ACP server"), false)
    .option("--verbose, -v", t("Verbose client logging"), false)
    .action(async (opts) => {
      try {
        await runAcpClientInteractive({
          cwd: opts.cwd as string | undefined,
          serverCommand: opts.server as string | undefined,
          serverArgs: opts.serverArgs as string[] | undefined,
          serverVerbose: Boolean(opts.serverVerbose),
          verbose: Boolean(opts.verbose),
        });
      } catch (err) {
        defaultRuntime.error(String(err));
        defaultRuntime.exit(1);
      }
    });
}
