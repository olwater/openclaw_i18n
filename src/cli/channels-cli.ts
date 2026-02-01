import type { Command } from "commander";
import {
  channelsAddCommand,
  channelsCapabilitiesCommand,
  channelsListCommand,
  channelsLogsCommand,
  channelsRemoveCommand,
  channelsResolveCommand,
  channelsStatusCommand,
} from "../commands/channels.js";
import { danger } from "../globals.js";
import { t } from "../i18n/index.js";
import { defaultRuntime } from "../runtime.js";
import { formatDocsLink } from "../terminal/links.js";
import { theme } from "../terminal/theme.js";
import { runChannelLogin, runChannelLogout } from "./channel-auth.js";
import { formatCliChannelOptions } from "./channel-options.js";
import { runCommandWithRuntime } from "./cli-utils.js";
import { hasExplicitOptions } from "./command-options.js";

const optionNamesAdd = [
  "channel",
  "account",
  "name",
  "token",
  "tokenFile",
  "botToken",
  "appToken",
  "signalNumber",
  "cliPath",
  "dbPath",
  "service",
  "region",
  "authDir",
  "httpUrl",
  "httpHost",
  "httpPort",
  "webhookPath",
  "webhookUrl",
  "audienceType",
  "audience",
  "useEnv",
  "homeserver",
  "userId",
  "accessToken",
  "password",
  "deviceName",
  "initialSyncLimit",
  "ship",
  "url",
  "code",
  "groupChannels",
  "dmAllowlist",
  "autoDiscoverChannels",
] as const;

const optionNamesRemove = ["channel", "account", "delete"] as const;

function runChannelsCommand(action: () => Promise<void>) {
  return runCommandWithRuntime(defaultRuntime, action);
}

function runChannelsCommandWithDanger(action: () => Promise<void>, label: string) {
  return runCommandWithRuntime(defaultRuntime, action, (err) => {
    defaultRuntime.error(danger(`${label}: ${String(err)}`));
    defaultRuntime.exit(1);
  });
}

export function registerChannelsCli(program: Command) {
  const channelNames = formatCliChannelOptions();
  const channels = program
    .command("channels")
    .description(t("Manage chat channel accounts"))
    .addHelpText(
      "after",
      () =>
        `\n${theme.muted("Docs:")} ${formatDocsLink(
          "/cli/channels",
          "docs.openclaw.ai/cli/channels",
        )}\n`,
    );

  channels
    .command("list")
    .description(t("List configured channels + auth profiles"))
    .option("--no-usage", t("Skip model provider usage/quota snapshots"))
    .option("--json", t("Output JSON"), false)
    .action(async (opts) => {
      await runChannelsCommand(async () => {
        await channelsListCommand(opts, defaultRuntime);
      });
    });

  channels
    .command("status")
    .description(t("Show gateway channel status (use status --deep for local)"))
    .option("--probe", t("Probe channel credentials"), false)
    .option("--timeout <ms>", t("Timeout in ms"), "10000")
    .option("--json", t("Output JSON"), false)
    .action(async (opts) => {
      await runChannelsCommand(async () => {
        await channelsStatusCommand(opts, defaultRuntime);
      });
    });

  channels
    .command("capabilities")
    .description(t("Show provider capabilities (intents/scopes + supported features)"))
    .option("--channel <name>", `Channel (${formatCliChannelOptions(["all"])})`)
    .option("--account <id>", t("Account id (only with --channel)"))
    .option("--target <dest>", t("Channel target for permission audit (Discord channel:<id>)"))
    .option("--timeout <ms>", t("Timeout in ms"), "10000")
    .option("--json", t("Output JSON"), false)
    .action(async (opts) => {
      await runChannelsCommand(async () => {
        await channelsCapabilitiesCommand(opts, defaultRuntime);
      });
    });

  channels
    .command("resolve")
    .description(t("Resolve channel/user names to IDs"))
    .argument("<entries...>", t("Entries to resolve (names or ids)"))
    .option("--channel <name>", `Channel (${channelNames})`)
    .option("--account <id>", t("Account id (accountId)"))
    .option("--kind <kind>", t("Target kind (auto|user|group)"), "auto")
    .option("--json", t("Output JSON"), false)
    .action(async (entries, opts) => {
      await runChannelsCommand(async () => {
        await channelsResolveCommand(
          {
            channel: opts.channel as string | undefined,
            account: opts.account as string | undefined,
            kind: opts.kind as "auto" | "user" | "group",
            json: Boolean(opts.json),
            entries: Array.isArray(entries) ? entries : [String(entries)],
          },
          defaultRuntime,
        );
      });
    });

  channels
    .command("logs")
    .description(t("Show recent channel logs from the gateway log file"))
    .option("--channel <name>", `Channel (${formatCliChannelOptions(["all"])})`, "all")
    .option("--lines <n>", t("Number of lines (default: 200)"), "200")
    .option("--json", t("Output JSON"), false)
    .action(async (opts) => {
      await runChannelsCommand(async () => {
        await channelsLogsCommand(opts, defaultRuntime);
      });
    });

  channels
    .command("add")
    .description(t("Add or update a channel account"))
    .option("--channel <name>", `Channel (${channelNames})`)
    .option("--account <id>", t("Account id (default when omitted)"))
    .option("--name <name>", t("Display name for this account"))
    .option("--token <token>", t("Bot token (Telegram/Discord)"))
    .option("--token-file <path>", t("Bot token file (Telegram)"))
    .option("--bot-token <token>", t("Slack bot token (xoxb-...)"))
    .option("--app-token <token>", t("Slack app token (xapp-...)"))
    .option("--signal-number <e164>", t("Signal account number (E.164)"))
    .option("--cli-path <path>", t("CLI path (signal-cli or imsg)"))
    .option("--db-path <path>", t("iMessage database path"))
    .option("--service <service>", t("iMessage service (imessage|sms|auto)"))
    .option("--region <region>", t("iMessage region (for SMS)"))
    .option("--auth-dir <path>", t("WhatsApp auth directory override"))
    .option("--http-url <url>", t("Signal HTTP daemon base URL"))
    .option("--http-host <host>", t("Signal HTTP host"))
    .option("--http-port <port>", t("Signal HTTP port"))
    .option("--webhook-path <path>", t("Webhook path (Google Chat/BlueBubbles)"))
    .option("--webhook-url <url>", t("Google Chat webhook URL"))
    .option("--audience-type <type>", t("Google Chat audience type (app-url|project-number)"))
    .option("--audience <value>", t("Google Chat audience value (app URL or project number)"))
    .option("--homeserver <url>", t("Matrix homeserver URL"))
    .option("--user-id <id>", t("Matrix user ID"))
    .option("--access-token <token>", t("Matrix access token"))
    .option("--password <password>", t("Matrix password"))
    .option("--device-name <name>", t("Matrix device name"))
    .option("--initial-sync-limit <n>", t("Matrix initial sync limit"))
    .option("--ship <ship>", t("Tlon ship name (~sampel-palnet)"))
    .option("--url <url>", t("Tlon ship URL"))
    .option("--code <code>", t("Tlon login code"))
    .option("--group-channels <list>", t("Tlon group channels (comma-separated)"))
    .option("--dm-allowlist <list>", t("Tlon DM allowlist (comma-separated ships)"))
    .option("--auto-discover-channels", t("Tlon auto-discover group channels"))
    .option("--no-auto-discover-channels", t("Disable Tlon auto-discovery"))
    .option("--use-env", t("Use env token (default account only)"), false)
    .action(async (opts, command) => {
      await runChannelsCommand(async () => {
        const hasFlags = hasExplicitOptions(command, optionNamesAdd);
        await channelsAddCommand(opts, defaultRuntime, { hasFlags });
      });
    });

  channels
    .command("remove")
    .description(t("Disable or delete a channel account"))
    .option("--channel <name>", `Channel (${channelNames})`)
    .option("--account <id>", t("Account id (default when omitted)"))
    .option("--delete", t("Delete config entries (no prompt)"), false)
    .action(async (opts, command) => {
      await runChannelsCommand(async () => {
        const hasFlags = hasExplicitOptions(command, optionNamesRemove);
        await channelsRemoveCommand(opts, defaultRuntime, { hasFlags });
      });
    });

  channels
    .command("login")
    .description(t("Link a channel account (if supported)"))
    .option("--channel <channel>", t("Channel alias (default: whatsapp)"))
    .option("--account <id>", t("Account id (accountId)"))
    .option("--verbose", t("Verbose connection logs"), false)
    .action(async (opts) => {
      await runChannelsCommandWithDanger(async () => {
        await runChannelLogin(
          {
            channel: opts.channel as string | undefined,
            account: opts.account as string | undefined,
            verbose: Boolean(opts.verbose),
          },
          defaultRuntime,
        );
      }, t("Channel login failed"));
    });

  channels
    .command("logout")
    .description(t("Log out of a channel session (if supported)"))
    .option("--channel <channel>", t("Channel alias (default: whatsapp)"))
    .option("--account <id>", t("Account id (accountId)"))
    .action(async (opts) => {
      await runChannelsCommandWithDanger(async () => {
        await runChannelLogout(
          {
            channel: opts.channel as string | undefined,
            account: opts.account as string | undefined,
          },
          defaultRuntime,
        );
      }, t("Channel logout failed"));
    });
}
