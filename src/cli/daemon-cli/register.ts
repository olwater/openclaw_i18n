import type { Command } from "commander";
import { t } from "../../i18n/index.js";
import { formatDocsLink } from "../../terminal/links.js";
import { theme } from "../../terminal/theme.js";
import { addGatewayServiceCommands } from "./register-service-commands.js";

export function registerDaemonCli(program: Command) {
  const daemon = program
    .command("daemon")
    .description(t("Manage the Gateway service (launchd/systemd/schtasks)"))
    .addHelpText(
      "after",
      () =>
        `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/gateway", "docs.openclaw.ai/cli/gateway")}\n`,
    );

<<<<<<< HEAD
  daemon
    .command("status")
    .description(t("Show service install status + probe the Gateway"))
    .option("--url <url>", t("Gateway WebSocket URL (defaults to config/remote/local)"))
    .option("--token <token>", t("Gateway token (if required)"))
    .option("--password <password>", t("Gateway password (password auth)"))
    .option("--timeout <ms>", t("Timeout in ms"), "10000")
    .option("--no-probe", t("Skip RPC probe"))
    .option("--deep", t("Scan system-level services"), false)
    .option("--json", t("Output JSON"), false)
    .action(async (opts) => {
      await runDaemonStatus({
        rpc: opts,
        probe: Boolean(opts.probe),
        deep: Boolean(opts.deep),
        json: Boolean(opts.json),
      });
    });

  daemon
    .command("install")
    .description(t("Install the Gateway service (launchd/systemd/schtasks)"))
    .option("--port <port>", t("Gateway port"))
    .option("--runtime <runtime>", t("Daemon runtime (node|bun). Default: node"))
    .option("--token <token>", t("Gateway token (token auth)"))
    .option("--force", t("Reinstall/overwrite if already installed"), false)
    .option("--json", t("Output JSON"), false)
    .action(async (opts) => {
      await runDaemonInstall(opts);
    });

  daemon
    .command("uninstall")
    .description(t("Uninstall the Gateway service (launchd/systemd/schtasks)"))
    .option("--json", t("Output JSON"), false)
    .action(async (opts) => {
      await runDaemonUninstall(opts);
    });

  daemon
    .command("start")
    .description(t("Start the Gateway service (launchd/systemd/schtasks)"))
    .option("--json", t("Output JSON"), false)
    .action(async (opts) => {
      await runDaemonStart(opts);
    });

  daemon
    .command("stop")
    .description(t("Stop the Gateway service (launchd/systemd/schtasks)"))
    .option("--json", t("Output JSON"), false)
    .action(async (opts) => {
      await runDaemonStop(opts);
    });

  daemon
    .command("restart")
    .description(t("Restart the Gateway service (launchd/systemd/schtasks)"))
    .option("--json", t("Output JSON"), false)
    .action(async (opts) => {
      await runDaemonRestart(opts);
    });
=======
  addGatewayServiceCommands(daemon, {
    statusDescription: "Show service install status + probe the Gateway",
  });
>>>>>>> origin/main
}
