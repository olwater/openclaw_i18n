import type { Command } from "commander";
import type { MessageCliHelpers } from "./helpers.js";
import { t } from "../../../i18n/index.js";

export function registerMessagePinCommands(message: Command, helpers: MessageCliHelpers) {
  const pins = [
    helpers
      .withMessageBase(
        helpers.withRequiredMessageTarget(message.command("pin").description(t("Pin a message"))),
      )
      .requiredOption("--message-id <id>", t("Message id"))
      .action(async (opts) => {
        await helpers.runMessageAction("pin", opts);
      }),
    helpers
      .withMessageBase(
        helpers.withRequiredMessageTarget(
          message.command("unpin").description(t("Unpin a message")),
        ),
      )
      .requiredOption("--message-id <id>", t("Message id"))
      .action(async (opts) => {
        await helpers.runMessageAction("unpin", opts);
      }),
    helpers
      .withMessageBase(
        helpers.withRequiredMessageTarget(
          message.command("pins").description(t("List pinned messages")),
        ),
      )
      .option("--limit <n>", t("Result limit"))
      .action(async (opts) => {
        await helpers.runMessageAction("list-pins", opts);
      }),
  ] as const;

  void pins;
}
