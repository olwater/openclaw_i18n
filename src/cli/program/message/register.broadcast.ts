import type { Command } from "commander";
import { t } from "../../../i18n/index.js";
import { collectOption } from "../helpers.js";
import { CHANNEL_TARGETS_DESCRIPTION } from "../../../infra/outbound/channel-target.js";
import type { MessageCliHelpers } from "./helpers.js";

export function registerMessageBroadcastCommand(message: Command, helpers: MessageCliHelpers) {
  helpers
    .withMessageBase(
      message.command("broadcast").description(t("Broadcast a message to multiple targets")),
    )
    .requiredOption("--targets <target...>", CHANNEL_TARGETS_DESCRIPTION)
    .option("--message <text>", t("Message to send"))
    .option("--media <url>", t("Media URL"))
    .action(async (options: Record<string, unknown>) => {
      await helpers.runMessageAction("broadcast", options);
    });
}
