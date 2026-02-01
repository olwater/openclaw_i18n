import type { Command } from "commander";
import { t } from "../../i18n/index.js";
import { loadNodeHostConfig } from "../../node-host/config.js";
import { runNodeHost } from "../../node-host/runner.js";
import { formatDocsLink } from "../../terminal/links.js";
import { theme } from "../../terminal/theme.js";
import { parsePort } from "../daemon-cli/shared.js";
import {
  runNodeDaemonInstall,
  runNodeDaemonRestart,
  runNodeDaemonStatus,
  runNodeDaemonStop,
  runNodeDaemonUninstall,
} from "./daemon.js";

function parsePortWithFallback(value: unknown, fallback: number): number {
  const parsed = parsePort(value);
  return parsed ?? fallback;
}

export function registerNodeCli(program: Command) {
  const node = program
    .command("node")
    .description(t("Run a headless node host (system.run/system.which)"))
    .addHelpText(
      "after",
      () =>
        `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/node", "docs.openclaw.ai/cli/node")}\n`,
    );

  node
    .command("run")
    .description(t("Run the headless node host (foreground)"))
    .option("--host <host>", t("Gateway host"))
    .option("--port <port>", t("Gateway port"))
    .option("--tls", t("Use TLS for the gateway connection"), false)
    .option("--tls-fingerprint <sha256>", t("Expected TLS certificate fingerprint (sha256)"))
    .option("--node-id <id>", t("Override node id (clears pairing token)"))
    .option("--display-name <name>", t("Override node display name"))
    .action(async (opts) => {
      const existing = await loadNodeHostConfig();
      const host =
        (opts.host as string | undefined)?.trim() || existing?.gateway?.host || "127.0.0.1";
      const port = parsePortWithFallback(opts.port, existing?.gateway?.port ?? 18789);
      await runNodeHost({
        gatewayHost: host,
        gatewayPort: port,
        gatewayTls: Boolean(opts.tls) || Boolean(opts.tlsFingerprint),
        gatewayTlsFingerprint: opts.tlsFingerprint,
        nodeId: opts.nodeId,
        displayName: opts.displayName,
      });
    });

  node
    .command("status")
    .description(t("Show node host status"))
    .option("--json", t("Output JSON"), false)
    .action(async (opts) => {
      await runNodeDaemonStatus(opts);
    });

  node
    .command("install")
    .description(t("Install the node host service (launchd/systemd/schtasks)"))
    .option("--host <host>", t("Gateway host"))
    .option("--port <port>", t("Gateway port"))
    .option("--tls", t("Use TLS for the gateway connection"), false)
    .option("--tls-fingerprint <sha256>", t("Expected TLS certificate fingerprint (sha256)"))
    .option("--node-id <id>", t("Override node id (clears pairing token)"))
    .option("--display-name <name>", t("Override node display name"))
    .option("--runtime <runtime>", t("Service runtime (node|bun). Default: node"))
    .option("--force", t("Reinstall/overwrite if already installed"), false)
    .option("--json", t("Output JSON"), false)
    .action(async (opts) => {
      await runNodeDaemonInstall(opts);
    });

  node
    .command("uninstall")
    .description(t("Uninstall the node host service (launchd/systemd/schtasks)"))
    .option("--json", t("Output JSON"), false)
    .action(async (opts) => {
      await runNodeDaemonUninstall(opts);
    });

  node
    .command("stop")
    .description(t("Stop the node host service (launchd/systemd/schtasks)"))
    .option("--json", t("Output JSON"), false)
    .action(async (opts) => {
      await runNodeDaemonStop(opts);
    });

  node
    .command("restart")
    .description(t("Restart the node host service (launchd/systemd/schtasks)"))
    .option("--json", t("Output JSON"), false)
    .action(async (opts) => {
      await runNodeDaemonRestart(opts);
    });
}
