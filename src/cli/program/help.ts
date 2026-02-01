import type { Command } from "commander";
import type { ProgramContext } from "./context.js";
import { t } from "../../i18n/index.js";
import { formatDocsLink } from "../../terminal/links.js";
import { isRich, theme } from "../../terminal/theme.js";
import { formatCliBannerLine, hasEmittedCliBanner } from "../banner.js";
import { replaceCliName, resolveCliName } from "../cli-name.js";

const CLI_NAME = resolveCliName();

const EXAMPLES = [
  [
    t("openclaw channels login --verbose"),
    t("Link personal WhatsApp Web and show QR + connection logs."),
  ],
  [
    t('openclaw message send --target +15555550123 --message "Hi" --json'),
    t("Send via your web session and print JSON result."),
  ],
  [t("openclaw gateway --port 18789"), t("Run the WebSocket Gateway locally.")],
  [
    t("openclaw --dev gateway"),
    t("Run a dev Gateway (isolated state/config) on ws://127.0.0.1:19001."),
  ],
  [
    t("openclaw gateway --force"),
    t("Kill anything bound to the default gateway port, then start it."),
  ],
  [t("openclaw gateway ..."), t("Gateway control via WebSocket.")],
  [
    t('openclaw agent --to +15555550123 --message "Run summary" --deliver'),
    t("Talk directly to the agent using the Gateway; optionally send the WhatsApp reply."),
  ],
  [
    t('openclaw message send --channel telegram --target @mychat --message "Hi"'),
    t("Send via your Telegram bot."),
  ],
] as const;

export function configureProgramHelp(program: Command, ctx: ProgramContext) {
  program
    .name(CLI_NAME)
    .description("")
    .version(ctx.programVersion, "-V, --version", t("output the version number"))
    .helpOption("-h, --help", t("display help for command"))
    .helpCommand("help [command]", t("display help for command"))
    .option(
      "--dev",
      t(
        "Dev profile: isolate state under ~/.openclaw-dev, default gateway port 19001, and shift derived ports (browser/canvas)",
      ),
    )
    .option(
      "--profile <name>",
      t(
        "Use a named profile (isolates OPENCLAW_STATE_DIR/OPENCLAW_CONFIG_PATH under ~/.openclaw-<name>)",
      ),
    );

  program.option("--no-color", t("Disable ANSI colors"), false);

  program.configureHelp({
    // sort options and subcommands alphabetically
    sortSubcommands: true,
    sortOptions: true,
    optionTerm: (option) => theme.option(option.flags),
    subcommandTerm: (cmd) => theme.command(cmd.name()),
  });

  program.configureOutput({
    writeOut: (str) => {
      const colored = str
        .replace(/^Usage:/gm, theme.heading(t("Usage:")))
        .replace(/^Options:/gm, theme.heading(t("Options:")))
        .replace(/^Commands:/gm, theme.heading(t("Commands:")));
      process.stdout.write(colored);
    },
    writeErr: (str) => process.stderr.write(str),
    outputError: (str, write) => write(theme.error(str)),
  });

  if (
    process.argv.includes("-V") ||
    process.argv.includes("--version") ||
    process.argv.includes("-v")
  ) {
    console.log(ctx.programVersion);
    process.exit(0);
  }

  program.addHelpText("beforeAll", () => {
    if (hasEmittedCliBanner()) {
      return "";
    }
    const rich = isRich();
    const line = formatCliBannerLine(ctx.programVersion, { richTty: rich });
    return `\n${line}\n`;
  });

  const fmtExamples = EXAMPLES.map(
    ([cmd, desc]) => `  ${theme.command(replaceCliName(cmd, CLI_NAME))}\n    ${theme.muted(desc)}`,
  ).join("\n");

  program.addHelpText("afterAll", ({ command }) => {
    if (command !== program) {
      return "";
    }
    const docs = formatDocsLink("/cli", "docs.openclaw.ai/cli");
    return `\n${theme.heading("Examples:")}\n${fmtExamples}\n\n${theme.muted("Docs:")} ${docs}\n`;
  });
}
