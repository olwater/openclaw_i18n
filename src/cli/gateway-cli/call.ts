import type { Command } from "commander";
import { callGateway } from "../../gateway/call.js";
import { t } from "../../i18n/index.js";
import { GATEWAY_CLIENT_MODES, GATEWAY_CLIENT_NAMES } from "../../utils/message-channel.js";
import { withProgress } from "../progress.js";

export type GatewayRpcOpts = {
  url?: string;
  token?: string;
  password?: string;
  timeout?: string;
  expectFinal?: boolean;
  json?: boolean;
};

export const gatewayCallOpts = (cmd: Command) =>
  cmd
    .option(
      "--url <url>",
      t("Gateway WebSocket URL (defaults to gateway.remote.url when configured)"),
    )
    .option("--token <token>", t("Gateway token (if required)"))
    .option("--password <password>", t("Gateway password (password auth)"))
    .option("--timeout <ms>", t("Timeout in ms"), "10000")
    .option("--expect-final", t("Wait for final response (agent)"), false)
    .option("--json", t("Output JSON"), false);

export const callGatewayCli = async (method: string, opts: GatewayRpcOpts, params?: unknown) =>
  withProgress(
    {
      label: `Gateway ${method}`,
      indeterminate: true,
      enabled: opts.json !== true,
    },
    async () =>
      await callGateway({
        url: opts.url,
        token: opts.token,
        password: opts.password,
        method,
        params,
        expectFinal: Boolean(opts.expectFinal),
        timeoutMs: Number(opts.timeout ?? 10_000),
        clientName: GATEWAY_CLIENT_NAMES.CLI,
        mode: GATEWAY_CLIENT_MODES.CLI,
      }),
  );
