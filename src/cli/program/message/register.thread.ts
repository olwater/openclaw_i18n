import type { Command } from "commander";
import type { MessageCliHelpers } from "./helpers.js";
import { t } from "../../../i18n/index.js";

export function registerMessageThreadCommands(message: Command, helpers: MessageCliHelpers) {
  const thread = message.command("thread").description(t("Thread actions"));

  helpers
    .withMessageBase(
      helpers.withRequiredMessageTarget(
        thread
          .command("create")
          .description(t("Create a thread"))
          .requiredOption("--thread-name <name>", t("Thread name")),
      ),
    )
    .option("--message-id <id>", t("Message id (optional)"))
    .option("-m, --message <text>", t("Initial thread message text"))
    .option("--auto-archive-min <n>", t("Thread auto-archive minutes"))
    .action(async (opts) => {
      await helpers.runMessageAction("thread-create", opts);
    });

  helpers
    .withMessageBase(
      thread
        .command("list")
        .description(t("List threads"))
        .requiredOption("--guild-id <id>", t("Guild id")),
    )
    .option("--channel-id <id>", t("Channel id"))
    .option("--include-archived", t("Include archived threads"), false)
    .option("--before <id>", t("Read/search before id"))
    .option("--limit <n>", t("Result limit"))
    .action(async (opts) => {
      await helpers.runMessageAction("thread-list", opts);
    });

  helpers
    .withMessageBase(
      helpers.withRequiredMessageTarget(
        thread
          .command("reply")
          .description(t("Reply in a thread"))
          .requiredOption("-m, --message <text>", t("Message body")),
      ),
    )
    .option(
      "--media <path-or-url>",
      t("Attach media (image/audio/video/document). Accepts local paths or URLs."),
    )
    .option("--reply-to <id>", t("Reply-to message id"))
    .action(async (opts) => {
      await helpers.runMessageAction("thread-reply", opts);
    });
}
