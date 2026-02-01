import type { Command } from "commander";
import type { MessageCliHelpers } from "./helpers.js";
import { t } from "../../../i18n/index.js";
import { collectOption } from "../helpers.js";

export function registerMessagePermissionsCommand(message: Command, helpers: MessageCliHelpers) {
  helpers
    .withMessageBase(
      helpers.withRequiredMessageTarget(
        message.command("permissions").description(t("Fetch channel permissions")),
      ),
    )
    .action(async (opts) => {
      await helpers.runMessageAction("permissions", opts);
    });
}

export function registerMessageSearchCommand(message: Command, helpers: MessageCliHelpers) {
  helpers
    .withMessageBase(message.command("search").description(t("Search Discord messages")))
    .requiredOption("--guild-id <id>", t("Guild id"))
    .requiredOption("--query <text>", t("Search query"))
    .option("--channel-id <id>", t("Channel id"))
    .option("--channel-ids <id>", t("Channel id (repeat)"), collectOption, [] as string[])
    .option("--author-id <id>", t("Author id"))
    .option("--author-ids <id>", t("Author id (repeat)"), collectOption, [] as string[])
    .option("--limit <n>", t("Result limit"))
    .action(async (opts) => {
      await helpers.runMessageAction("search", opts);
    });
}
