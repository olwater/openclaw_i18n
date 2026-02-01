import type { Command } from "commander";
import type { MessageCliHelpers } from "./helpers.js";
import { t } from "../../../i18n/index.js";

export function registerMessageReadEditDeleteCommands(
  message: Command,
  helpers: MessageCliHelpers,
) {
  helpers
    .withMessageBase(
      helpers.withRequiredMessageTarget(
        message.command("read").description(t("Read recent messages")),
      ),
    )
    .option("--limit <n>", t("Result limit"))
    .option("--before <id>", t("Read/search before id"))
    .option("--after <id>", t("Read/search after id"))
    .option("--around <id>", t("Read around id"))
    .option("--include-thread", t("Include thread replies (Discord)"), false)
    .action(async (opts) => {
      await helpers.runMessageAction("read", opts);
    });

  helpers
    .withMessageBase(
      helpers.withRequiredMessageTarget(
        message
          .command("edit")
          .description(t("Edit a message"))
          .requiredOption("--message-id <id>", t("Message id"))
          .requiredOption("-m, --message <text>", t("Message body")),
      ),
    )
    .option("--thread-id <id>", t("Thread id (Telegram forum thread)"))
    .action(async (opts) => {
      await helpers.runMessageAction("edit", opts);
    });

  helpers
    .withMessageBase(
      helpers.withRequiredMessageTarget(
        message
          .command("delete")
          .description(t("Delete a message"))
          .requiredOption("--message-id <id>", t("Message id")),
      ),
    )
    .action(async (opts) => {
      await helpers.runMessageAction("delete", opts);
    });
}
