import type { Command } from "commander";
import type { MessageCliHelpers } from "./helpers.js";
import { t } from "../../../i18n/index.js";
import { collectOption } from "../helpers.js";

export function registerMessageEmojiCommands(message: Command, helpers: MessageCliHelpers) {
  const emoji = message.command("emoji").description(t("Emoji actions"));

  helpers
    .withMessageBase(emoji.command("list").description(t("List emojis")))
    .option("--guild-id <id>", t("Guild id (Discord)"))
    .action(async (opts) => {
      await helpers.runMessageAction("emoji-list", opts);
    });

  helpers
    .withMessageBase(
      emoji
        .command("upload")
        .description(t("Upload an emoji"))
        .requiredOption("--guild-id <id>", t("Guild id")),
    )
    .requiredOption("--emoji-name <name>", t("Emoji name"))
    .requiredOption("--media <path-or-url>", t("Emoji media (path or URL)"))
    .option("--role-ids <id>", t("Role id (repeat)"), collectOption, [] as string[])
    .action(async (opts) => {
      await helpers.runMessageAction("emoji-upload", opts);
    });
}

export function registerMessageStickerCommands(message: Command, helpers: MessageCliHelpers) {
  const sticker = message.command("sticker").description(t("Sticker actions"));

  helpers
    .withMessageBase(
      helpers.withRequiredMessageTarget(sticker.command("send").description(t("Send stickers"))),
    )
    .requiredOption("--sticker-id <id>", t("Sticker id (repeat)"), collectOption)
    .option("-m, --message <text>", t("Optional message body"))
    .action(async (opts) => {
      await helpers.runMessageAction("sticker", opts);
    });

  helpers
    .withMessageBase(
      sticker
        .command("upload")
        .description(t("Upload a sticker"))
        .requiredOption("--guild-id <id>", t("Guild id")),
    )
    .requiredOption("--sticker-name <name>", t("Sticker name"))
    .requiredOption("--sticker-desc <text>", t("Sticker description"))
    .requiredOption("--sticker-tags <tags>", t("Sticker tags"))
    .requiredOption("--media <path-or-url>", t("Sticker media (path or URL)"))
    .action(async (opts) => {
      await helpers.runMessageAction("sticker-upload", opts);
    });
}
