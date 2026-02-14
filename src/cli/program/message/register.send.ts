import type { Command } from "commander";
import type { MessageCliHelpers } from "./helpers.js";
import { t } from "../../../i18n/index.js";

export function registerMessageSendCommand(message: Command, helpers: MessageCliHelpers) {
  helpers
    .withMessageBase(
      helpers
        .withRequiredMessageTarget(
          message
            .command("send")
            .description(t("Send a message"))
            .option("-m, --message <text>", t("Message body (required unless --media is set)")),
        )
        .option(
          "--media <path-or-url>",
          t("Attach media (image/audio/video/document). Accepts local paths or URLs."),
        )
        .option(
          "--buttons <json>",
          t("Telegram inline keyboard buttons as JSON (array of button rows)"),
        )
<<<<<<< HEAD
        .option("--card <json>", t("Adaptive Card JSON object (when supported by the channel)"))
        .option("--reply-to <id>", t("Reply-to message id"))
        .option("--thread-id <id>", t("Thread id (Telegram forum thread)"))
        .option("--gif-playback", t("Treat video media as GIF playback (WhatsApp only)."), false)
        .option("--silent", t("Send message silently without notification (Telegram only)"), false),
=======
        .option("--card <json>", "Adaptive Card JSON object (when supported by the channel)")
        .option("--reply-to <id>", "Reply-to message id")
        .option("--thread-id <id>", "Thread id (Telegram forum thread)")
        .option("--gif-playback", "Treat video media as GIF playback (WhatsApp only).", false)
        .option(
          "--silent",
          "Send message silently without notification (Telegram + Discord)",
          false,
        ),
>>>>>>> origin/main
    )
    .action(async (opts) => {
      await helpers.runMessageAction("send", opts);
    });
}
