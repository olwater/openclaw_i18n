import type { Command } from "commander";
import type { MessageCliHelpers } from "./helpers.js";
import { t } from "../../../i18n/index.js";

export function registerMessageDiscordAdminCommands(message: Command, helpers: MessageCliHelpers) {
  const role = message.command("role").description(t("Role actions"));
  helpers
    .withMessageBase(
      role
        .command("info")
        .description(t("List roles"))
        .requiredOption("--guild-id <id>", t("Guild id")),
    )
    .action(async (opts) => {
      await helpers.runMessageAction("role-info", opts);
    });

  helpers
    .withMessageBase(
      role
        .command("add")
        .description(t("Add role to a member"))
        .requiredOption("--guild-id <id>", t("Guild id"))
        .requiredOption("--user-id <id>", t("User id"))
        .requiredOption("--role-id <id>", t("Role id")),
    )
    .action(async (opts) => {
      await helpers.runMessageAction("role-add", opts);
    });

  helpers
    .withMessageBase(
      role
        .command("remove")
        .description(t("Remove role from a member"))
        .requiredOption("--guild-id <id>", t("Guild id"))
        .requiredOption("--user-id <id>", t("User id"))
        .requiredOption("--role-id <id>", t("Role id")),
    )
    .action(async (opts) => {
      await helpers.runMessageAction("role-remove", opts);
    });

  const channel = message.command("channel").description(t("Channel actions"));
  helpers
    .withMessageBase(
      helpers.withRequiredMessageTarget(
        channel.command("info").description(t("Fetch channel info")),
      ),
    )
    .action(async (opts) => {
      await helpers.runMessageAction("channel-info", opts);
    });

  helpers
    .withMessageBase(
      channel
        .command("list")
        .description(t("List channels"))
        .requiredOption("--guild-id <id>", t("Guild id")),
    )
    .action(async (opts) => {
      await helpers.runMessageAction("channel-list", opts);
    });

  const member = message.command("member").description(t("Member actions"));
  helpers
    .withMessageBase(
      member
        .command("info")
        .description(t("Fetch member info"))
        .requiredOption("--user-id <id>", t("User id")),
    )
    .option("--guild-id <id>", t("Guild id (Discord)"))
    .action(async (opts) => {
      await helpers.runMessageAction("member-info", opts);
    });

  const voice = message.command("voice").description(t("Voice actions"));
  helpers
    .withMessageBase(
      voice
        .command("status")
        .description(t("Fetch voice status"))
        .requiredOption("--guild-id <id>", t("Guild id"))
        .requiredOption("--user-id <id>", t("User id")),
    )
    .action(async (opts) => {
      await helpers.runMessageAction("voice-status", opts);
    });

  const event = message.command("event").description(t("Event actions"));
  helpers
    .withMessageBase(
      event
        .command("list")
        .description(t("List scheduled events"))
        .requiredOption("--guild-id <id>", t("Guild id")),
    )
    .action(async (opts) => {
      await helpers.runMessageAction("event-list", opts);
    });

  helpers
    .withMessageBase(
      event
        .command("create")
        .description(t("Create a scheduled event"))
        .requiredOption("--guild-id <id>", t("Guild id"))
        .requiredOption("--event-name <name>", t("Event name"))
        .requiredOption("--start-time <iso>", t("Event start time")),
    )
    .option("--end-time <iso>", t("Event end time"))
    .option("--desc <text>", t("Event description"))
    .option("--channel-id <id>", t("Channel id"))
    .option("--location <text>", t("Event location"))
    .option("--event-type <stage|external|voice>", t("Event type"))
    .action(async (opts) => {
      await helpers.runMessageAction("event-create", opts);
    });

  helpers
    .withMessageBase(
      message
        .command("timeout")
        .description(t("Timeout a member"))
        .requiredOption("--guild-id <id>", t("Guild id"))
        .requiredOption("--user-id <id>", t("User id")),
    )
    .option("--duration-min <n>", t("Timeout duration minutes"))
    .option("--until <iso>", t("Timeout until"))
    .option("--reason <text>", t("Moderation reason"))
    .action(async (opts) => {
      await helpers.runMessageAction("timeout", opts);
    });

  helpers
    .withMessageBase(
      message
        .command("kick")
        .description(t("Kick a member"))
        .requiredOption("--guild-id <id>", t("Guild id"))
        .requiredOption("--user-id <id>", t("User id")),
    )
    .option("--reason <text>", t("Moderation reason"))
    .action(async (opts) => {
      await helpers.runMessageAction("kick", opts);
    });

  helpers
    .withMessageBase(
      message
        .command("ban")
        .description(t("Ban a member"))
        .requiredOption("--guild-id <id>", t("Guild id"))
        .requiredOption("--user-id <id>", t("User id")),
    )
    .option("--reason <text>", t("Moderation reason"))
    .option("--delete-days <n>", t("Ban delete message days"))
    .action(async (opts) => {
      await helpers.runMessageAction("ban", opts);
    });
}
