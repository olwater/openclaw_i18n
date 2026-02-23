import type { Command } from "commander";
import { t } from "../../i18n/index.js";
import type { ProgramContext } from "./context.js";
import { formatDocsLink } from "../../terminal/links.js";
import { isRich, theme } from "../../terminal/theme.js";
import { escapeRegExp } from "../../utils.js";
import { formatCliBannerLine, hasEmittedCliBanner } from "../banner.js";
import { replaceCliName, resolveCliName } from "../cli-name.js";
import { getCoreCliCommandsWithSubcommands } from "./command-registry.js";
import { getSubCliCommandsWithSubcommands } from "./register.subclis.js";

const CLI_NAME = resolveCliName();
const CLI_NAME_PATTERN = escapeRegExp(CLI_NAME);
const ROOT_COMMANDS_WITH_SUBCOMMANDS = new Set([
  ...getCoreCliCommandsWithSubcommands(),
  ...getSubCliCommandsWithSubcommands(),
]);
const ROOT_COMMANDS_HINT =
  "Hint: commands suffixed with * have subcommands. Run <command> --help for details.";

const EXAMPLES = [
  ["openclaw models --help", "Show detailed help for the models command."],
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
    subcommandTerm: (cmd) => {
      const isRootCommand = cmd.parent === program;
      const hasSubcommands = isRootCommand && ROOT_COMMANDS_WITH_SUBCOMMANDS.has(cmd.name());
      return theme.command(hasSubcommands ? `${cmd.name()} *` : cmd.name());
    },
  });

  const formatHelpOutput = (str: string) => {
    let output = str;
    const isRootHelp = new RegExp(
      `^Usage:\\s+${CLI_NAME_PATTERN}\\s+\\[options\\]\\s+\\[command\\]\\s*$`,
      "m",
    ).test(output);
    if (isRootHelp && /^Commands:/m.test(output)) {
      output = output.replace(/^Commands:/m, `Commands:\n  ${theme.muted(ROOT_COMMANDS_HINT)}`);
    }

    return output
      .replace(/^Usage:/gm, theme.heading("Usage:"))
      .replace(/^Options:/gm, theme.heading("Options:"))
      .replace(/^Commands:/gm, theme.heading("Commands:"));
  };

  program.configureOutput({
    writeOut: (str) => {
      process.stdout.write(formatHelpOutput(str));
    },
    writeErr: (str) => {
      process.stderr.write(formatHelpOutput(str));
    },
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
