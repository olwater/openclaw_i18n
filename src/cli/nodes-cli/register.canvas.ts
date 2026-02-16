import type { Command } from "commander";
import fs from "node:fs/promises";
import type { NodesRpcOpts } from "./types.js";
<<<<<<< HEAD
import { randomIdempotencyKey } from "../../gateway/call.js";
import { t } from "../../i18n/index.js";
=======
>>>>>>> origin/main
import { defaultRuntime } from "../../runtime.js";
import { shortenHomePath } from "../../utils.js";
import { writeBase64ToFile } from "../nodes-camera.js";
import { canvasSnapshotTempPath, parseCanvasSnapshotPayload } from "../nodes-canvas.js";
import { parseTimeoutMs } from "../nodes-run.js";
import { buildA2UITextJsonl, validateA2UIJsonl } from "./a2ui-jsonl.js";
import { getNodesTheme, runNodesCommand } from "./cli-utils.js";
import { buildNodeInvokeParams, callGatewayCli, nodesCallOpts, resolveNodeId } from "./rpc.js";

async function invokeCanvas(opts: NodesRpcOpts, command: string, params?: Record<string, unknown>) {
  const nodeId = await resolveNodeId(opts, String(opts.node ?? ""));
  const timeoutMs = parseTimeoutMs(opts.invokeTimeout);
  return await callGatewayCli(
    "node.invoke",
    opts,
    buildNodeInvokeParams({
      nodeId,
      command,
      params,
      timeoutMs: typeof timeoutMs === "number" ? timeoutMs : undefined,
    }),
  );
}

export function registerNodesCanvasCommands(nodes: Command) {
  const canvas = nodes
    .command("canvas")
    .description(t("Capture or render canvas content from a paired node"));

  nodesCallOpts(
    canvas
      .command("snapshot")
      .description(t("Capture a canvas snapshot (prints MEDIA:<path>)"))
      .requiredOption("--node <idOrNameOrIp>", t("Node id, name, or IP"))
      .option("--format <png|jpg|jpeg>", t("Image format"), "jpg")
      .option("--max-width <px>", t("Max width in px (optional)"))
      .option("--quality <0-1>", t("JPEG quality (optional)"))
      .option("--invoke-timeout <ms>", t("Node invoke timeout in ms (default 20000)"), "20000")
      .action(async (opts: NodesRpcOpts) => {
<<<<<<< HEAD
        await runNodesCommand(t("canvas snapshot"), async () => {
          const nodeId = await resolveNodeId(opts, String(opts.node ?? ""));
=======
        await runNodesCommand("canvas snapshot", async () => {
>>>>>>> origin/main
          const formatOpt = String(opts.format ?? "jpg")
            .trim()
            .toLowerCase();
          const formatForParams =
            formatOpt === "jpg" ? "jpeg" : formatOpt === "jpeg" ? "jpeg" : "png";
          if (formatForParams !== "png" && formatForParams !== "jpeg") {
            throw new Error(`invalid format: ${String(opts.format)} (expected png|jpg|jpeg)`);
          }

          const maxWidth = opts.maxWidth ? Number.parseInt(String(opts.maxWidth), 10) : undefined;
          const quality = opts.quality ? Number.parseFloat(String(opts.quality)) : undefined;
          const raw = await invokeCanvas(opts, "canvas.snapshot", {
            format: formatForParams,
            maxWidth: Number.isFinite(maxWidth) ? maxWidth : undefined,
            quality: Number.isFinite(quality) ? quality : undefined,
          });
          const res = typeof raw === "object" && raw !== null ? (raw as { payload?: unknown }) : {};
          const payload = parseCanvasSnapshotPayload(res.payload);
          const filePath = canvasSnapshotTempPath({
            ext: payload.format === "jpeg" ? "jpg" : payload.format,
          });
          await writeBase64ToFile(filePath, payload.base64);

          if (opts.json) {
            defaultRuntime.log(
              JSON.stringify({ file: { path: filePath, format: payload.format } }, null, 2),
            );
            return;
          }
          defaultRuntime.log(`MEDIA:${shortenHomePath(filePath)}`);
        });
      }),
    { timeoutMs: 60_000 },
  );

  nodesCallOpts(
    canvas
      .command("present")
      .description(t("Show the canvas (optionally with a target URL/path)"))
      .requiredOption("--node <idOrNameOrIp>", t("Node id, name, or IP"))
      .option("--target <urlOrPath>", t("Target URL/path (optional)"))
      .option("--x <px>", t("Placement x coordinate"))
      .option("--y <px>", t("Placement y coordinate"))
      .option("--width <px>", t("Placement width"))
      .option("--height <px>", t("Placement height"))
      .option("--invoke-timeout <ms>", t("Node invoke timeout in ms"))
      .action(async (opts: NodesRpcOpts) => {
        await runNodesCommand(t("canvas present"), async () => {
          const placement = {
            x: opts.x ? Number.parseFloat(opts.x) : undefined,
            y: opts.y ? Number.parseFloat(opts.y) : undefined,
            width: opts.width ? Number.parseFloat(opts.width) : undefined,
            height: opts.height ? Number.parseFloat(opts.height) : undefined,
          };
          const params: Record<string, unknown> = {};
          if (opts.target) {
            params.url = String(opts.target);
          }
          if (
            Number.isFinite(placement.x) ||
            Number.isFinite(placement.y) ||
            Number.isFinite(placement.width) ||
            Number.isFinite(placement.height)
          ) {
            params.placement = placement;
          }
          await invokeCanvas(opts, "canvas.present", params);
          if (!opts.json) {
            const { ok } = getNodesTheme();
            defaultRuntime.log(ok(t("canvas present ok")));
          }
        });
      }),
  );

  nodesCallOpts(
    canvas
      .command("hide")
      .description(t("Hide the canvas"))
      .requiredOption("--node <idOrNameOrIp>", t("Node id, name, or IP"))
      .option("--invoke-timeout <ms>", t("Node invoke timeout in ms"))
      .action(async (opts: NodesRpcOpts) => {
        await runNodesCommand(t("canvas hide"), async () => {
          await invokeCanvas(opts, "canvas.hide", undefined);
          if (!opts.json) {
            const { ok } = getNodesTheme();
            defaultRuntime.log(ok(t("canvas hide ok")));
          }
        });
      }),
  );

  nodesCallOpts(
    canvas
      .command("navigate")
      .description(t("Navigate the canvas to a URL"))
      .argument("<url>", t("Target URL/path"))
      .requiredOption("--node <idOrNameOrIp>", t("Node id, name, or IP"))
      .option("--invoke-timeout <ms>", t("Node invoke timeout in ms"))
      .action(async (url: string, opts: NodesRpcOpts) => {
        await runNodesCommand(t("canvas navigate"), async () => {
          await invokeCanvas(opts, "canvas.navigate", { url });
          if (!opts.json) {
            const { ok } = getNodesTheme();
            defaultRuntime.log(ok(t("canvas navigate ok")));
          }
        });
      }),
  );

  nodesCallOpts(
    canvas
      .command("eval")
      .description(t("Evaluate JavaScript in the canvas"))
      .argument("[js]", t("JavaScript to evaluate"))
      .option("--js <code>", t("JavaScript to evaluate"))
      .requiredOption("--node <idOrNameOrIp>", t("Node id, name, or IP"))
      .option("--invoke-timeout <ms>", t("Node invoke timeout in ms"))
      .action(async (jsArg: string | undefined, opts: NodesRpcOpts) => {
        await runNodesCommand(t("canvas eval"), async () => {
          const js = opts.js ?? jsArg;
          if (!js) {
            throw new Error(t("missing --js or <js>"));
          }
          const raw = await invokeCanvas(opts, "canvas.eval", {
            javaScript: js,
          });
          if (opts.json) {
            defaultRuntime.log(JSON.stringify(raw, null, 2));
            return;
          }
          const payload =
            typeof raw === "object" && raw !== null
              ? (raw as { payload?: { result?: string } }).payload
              : undefined;
          if (payload?.result) {
            defaultRuntime.log(payload.result);
          } else {
            const { ok } = getNodesTheme();
            defaultRuntime.log(ok(t("canvas eval ok")));
          }
        });
      }),
  );

  const a2ui = canvas.command("a2ui").description(t("Render A2UI content on the canvas"));

  nodesCallOpts(
    a2ui
      .command("push")
      .description(t("Push A2UI JSONL to the canvas"))
      .option("--jsonl <path>", t("Path to JSONL payload"))
      .option("--text <text>", t("Render a quick A2UI text payload"))
      .requiredOption("--node <idOrNameOrIp>", t("Node id, name, or IP"))
      .option("--invoke-timeout <ms>", t("Node invoke timeout in ms"))
      .action(async (opts: NodesRpcOpts) => {
        await runNodesCommand(t("canvas a2ui push"), async () => {
          const hasJsonl = Boolean(opts.jsonl);
          const hasText = typeof opts.text === "string";
          if (hasJsonl === hasText) {
            throw new Error(t("provide exactly one of --jsonl or --text"));
          }

          const jsonl = hasText
            ? buildA2UITextJsonl(String(opts.text ?? ""))
            : await fs.readFile(String(opts.jsonl), "utf8");
          const { version, messageCount } = validateA2UIJsonl(jsonl);
          if (version === "v0.9") {
            throw new Error(
              t("Detected A2UI v0.9 JSONL (createSurface). OpenClaw currently supports v0.8 only."),
            );
          }
          await invokeCanvas(opts, "canvas.a2ui.pushJSONL", { jsonl });
          if (!opts.json) {
            const { ok } = getNodesTheme();
            defaultRuntime.log(
              ok(
                `canvas a2ui push ok (v0.8, ${messageCount} message${messageCount === 1 ? "" : "s"})`,
              ),
            );
          }
        });
      }),
  );

  nodesCallOpts(
    a2ui
      .command("reset")
      .description(t("Reset A2UI renderer state"))
      .requiredOption("--node <idOrNameOrIp>", t("Node id, name, or IP"))
      .option("--invoke-timeout <ms>", t("Node invoke timeout in ms"))
      .action(async (opts: NodesRpcOpts) => {
        await runNodesCommand(t("canvas a2ui reset"), async () => {
          await invokeCanvas(opts, "canvas.a2ui.reset", undefined);
          if (!opts.json) {
            const { ok } = getNodesTheme();
            defaultRuntime.log(ok(t("canvas a2ui reset ok")));
          }
        });
      }),
  );
}
