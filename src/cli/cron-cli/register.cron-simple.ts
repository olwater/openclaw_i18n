import type { Command } from "commander";
import { danger } from "../../globals.js";
import { t } from "../../i18n/index.js";
import { defaultRuntime } from "../../runtime.js";
import { addGatewayClientOptions, callGatewayFromCli } from "../gateway-rpc.js";
import { warnIfCronSchedulerDisabled } from "./shared.js";

export function registerCronSimpleCommands(cron: Command) {
  addGatewayClientOptions(
    cron
      .command("rm")
      .alias("remove")
      .alias("delete")
      .description(t("Remove a cron job"))
      .argument("<id>", t("Job id"))
      .option("--json", t("Output JSON"), false)
      .action(async (id, opts) => {
        try {
          const res = await callGatewayFromCli("cron.remove", opts, { id });
          defaultRuntime.log(JSON.stringify(res, null, 2));
        } catch (err) {
          defaultRuntime.error(danger(String(err)));
          defaultRuntime.exit(1);
        }
      }),
  );

  addGatewayClientOptions(
    cron
      .command("enable")
      .description(t("Enable a cron job"))
      .argument("<id>", t("Job id"))
      .action(async (id, opts) => {
        try {
          const res = await callGatewayFromCli("cron.update", opts, {
            id,
            patch: { enabled: true },
          });
          defaultRuntime.log(JSON.stringify(res, null, 2));
          await warnIfCronSchedulerDisabled(opts);
        } catch (err) {
          defaultRuntime.error(danger(String(err)));
          defaultRuntime.exit(1);
        }
      }),
  );

  addGatewayClientOptions(
    cron
      .command("disable")
      .description(t("Disable a cron job"))
      .argument("<id>", t("Job id"))
      .action(async (id, opts) => {
        try {
          const res = await callGatewayFromCli("cron.update", opts, {
            id,
            patch: { enabled: false },
          });
          defaultRuntime.log(JSON.stringify(res, null, 2));
          await warnIfCronSchedulerDisabled(opts);
        } catch (err) {
          defaultRuntime.error(danger(String(err)));
          defaultRuntime.exit(1);
        }
      }),
  );

  addGatewayClientOptions(
    cron
      .command("runs")
      .description(t("Show cron run history (JSONL-backed)"))
      .requiredOption("--id <id>", t("Job id"))
      .option("--limit <n>", t("Max entries (default 50)"), "50")
      .action(async (opts) => {
        try {
          const limitRaw = Number.parseInt(String(opts.limit ?? "50"), 10);
          const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : 50;
          const id = String(opts.id);
          const res = await callGatewayFromCli("cron.runs", opts, {
            id,
            limit,
          });
          defaultRuntime.log(JSON.stringify(res, null, 2));
        } catch (err) {
          defaultRuntime.error(danger(String(err)));
          defaultRuntime.exit(1);
        }
      }),
  );

  addGatewayClientOptions(
    cron
      .command("run")
      .description(t("Run a cron job now (debug)"))
      .argument("<id>", t("Job id"))
      .option("--force", t("Run even if not due"), false)
      .action(async (id, opts) => {
        try {
          const res = await callGatewayFromCli("cron.run", opts, {
            id,
            mode: opts.force ? "force" : "due",
          });
          defaultRuntime.log(JSON.stringify(res, null, 2));
        } catch (err) {
          defaultRuntime.error(danger(String(err)));
          defaultRuntime.exit(1);
        }
      }),
  );
}
