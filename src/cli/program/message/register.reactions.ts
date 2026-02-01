import type { Command } from "commander";
import type { MessageCliHelpers } from "./helpers.js";
import { t } from "../../../i18n/index.js";

export function registerMessageReactionsCommands(message: Command, helpers: MessageCliHelpers) {
  helpers
    .withMessageBase(
      helpers.withRequiredMessageTarget(
        message.command("react").description(t("Add or remove a reaction")),
      ),
    )
    .requiredOption("--message-id <id>", t("Message id"))
    .option("--emoji <emoji>", t("Emoji for reactions"))
    .option("--remove", t("Remove reaction"), false)
    .option("--participant <id>", t("WhatsApp reaction participant"))
    .option("--from-me", t("WhatsApp reaction fromMe"), false)
    .option("--target-author <id>", t("Signal reaction target author (uuid or phone)"))
    .option("--target-author-uuid <uuid>", t("Signal reaction target author uuid"))
    .action(async (opts) => {
      await helpers.runMessageAction("react", opts);
    });

  helpers
    .withMessageBase(
      helpers.withRequiredMessageTarget(
        message.command("reactions").description(t("List reactions on a message")),
      ),
    )
    .requiredOption("--message-id <id>", t("Message id"))
    .option("--limit <n>", t("Result limit"))
    .action(async (opts) => {
      await helpers.runMessageAction("reactions", opts);
    });
}
