import type { Command } from "commander";
import type { NodeListNode, NodesRpcOpts } from "./types.js";
import { callGateway } from "../../gateway/call.js";
import { t } from "../../i18n/index.js";
import { GATEWAY_CLIENT_MODES, GATEWAY_CLIENT_NAMES } from "../../utils/message-channel.js";
import { withProgress } from "../progress.js";
import { parseNodeList, parsePairingList } from "./format.js";

export const nodesCallOpts = (cmd: Command, defaults?: { timeoutMs?: number }) =>
  cmd
    .option(
      "--url <url>",
      t("Gateway WebSocket URL (defaults to gateway.remote.url when configured)"),
    )
    .option("--token <token>", t("Gateway token (if required)"))
    .option("--timeout <ms>", t("Timeout in ms"), String(defaults?.timeoutMs ?? 10_000))
    .option("--json", t("Output JSON"), false);

export const callGatewayCli = async (method: string, opts: NodesRpcOpts, params?: unknown) =>
  withProgress(
    {
      label: `Nodes ${method}`,
      indeterminate: true,
      enabled: opts.json !== true,
    },
    async () =>
      await callGateway({
        url: opts.url,
        token: opts.token,
        method,
        params,
        timeoutMs: Number(opts.timeout ?? 10_000),
        clientName: GATEWAY_CLIENT_NAMES.CLI,
        mode: GATEWAY_CLIENT_MODES.CLI,
      }),
  );

export function unauthorizedHintForMessage(message: string): string | null {
  const haystack = message.toLowerCase();
  if (
    haystack.includes("unauthorizedclient") ||
    haystack.includes(t("bridge client is not authorized")) ||
    haystack.includes(t("unsigned bridge clients are not allowed"))
  ) {
    return [
      t("peekaboo bridge rejected the client."),
      t("sign the peekaboo CLI (TeamID Y5PE65HELJ) or launch the host with"),
      t("PEEKABOO_ALLOW_UNSIGNED_SOCKET_CLIENTS=1 for local dev."),
    ].join(" ");
  }
  return null;
}

function normalizeNodeKey(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export async function resolveNodeId(opts: NodesRpcOpts, query: string) {
  const q = String(query ?? "").trim();
  if (!q) {
    throw new Error(t("node required"));
  }

  let nodes: NodeListNode[] = [];
  try {
    const res = await callGatewayCli("node.list", opts, {});
    nodes = parseNodeList(res);
  } catch {
    const res = await callGatewayCli("node.pair.list", opts, {});
    const { paired } = parsePairingList(res);
    nodes = paired.map((n) => ({
      nodeId: n.nodeId,
      displayName: n.displayName,
      platform: n.platform,
      version: n.version,
      remoteIp: n.remoteIp,
    }));
  }

  const qNorm = normalizeNodeKey(q);
  const matches = nodes.filter((n) => {
    if (n.nodeId === q) {
      return true;
    }
    if (typeof n.remoteIp === "string" && n.remoteIp === q) {
      return true;
    }
    const name = typeof n.displayName === "string" ? n.displayName : "";
    if (name && normalizeNodeKey(name) === qNorm) {
      return true;
    }
    if (q.length >= 6 && n.nodeId.startsWith(q)) {
      return true;
    }
    return false;
  });

  if (matches.length === 1) {
    return matches[0].nodeId;
  }
  if (matches.length === 0) {
    const known = nodes
      .map((n) => n.displayName || n.remoteIp || n.nodeId)
      .filter(Boolean)
      .join(t(", "));
    throw new Error(`unknown node: ${q}${known ? ` (known: ${known})` : ""}`);
  }
  throw new Error(
    `ambiguous node: ${q} (matches: ${matches
      .map((n) => n.displayName || n.remoteIp || n.nodeId)
      .join(t(", "))})`,
  );
}
