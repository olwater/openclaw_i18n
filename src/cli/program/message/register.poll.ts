import type { Command } from "commander";
import type { MessageCliHelpers } from "./helpers.js";
import { t } from "../../../i18n/index.js";
import { collectOption } from "../helpers.js";

export function registerMessagePollCommand(message: Command, helpers: MessageCliHelpers) {
  helpers
    .withMessageBase(
      helpers.withRequiredMessageTarget(message.command("poll").description(t("Send a poll"))),
    )
    .requiredOption("--poll-question <text>", t("Poll question"))
    .option(
      "--poll-option <choice>",
      t("Poll option (repeat 2-12 times)"),
      collectOption,
      [] as string[],
    )
    .option("--poll-multi", t("Allow multiple selections"), false)
    .option("--poll-duration-hours <n>", t("Poll duration (Discord)"))
    .option("-m, --message <text>", t("Optional message body"))
    .action(async (opts) => {
      await helpers.runMessageAction("poll", opts);
    });
}
