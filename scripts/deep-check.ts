import { execSync } from "child_process";
import * as fs from "fs";

const execCommand = "pnpm openclaw";

function getHelpOutput(cmd: string) {
  try {
    const out = execSync(`${execCommand} ${cmd} --help --no-color`, {
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, LANG: "zh_CN.UTF-8" },
    }).toString();
    // remove ansi codes just in case
    let cleanOut = out.replace(/\\x1b\\[[0-9;]*m/g, "");
    // strip tsdown log lines
    const lines = cleanOut.split("\\n");
    let actualLines = [];
    let inCliOutput = false;
    for (const line of lines) {
      if (!inCliOutput && line.includes("OpenClaw") && line.includes("af76b5b")) {
        inCliOutput = true;
      }
      if (inCliOutput) {
        actualLines.push(line);
      }
    }
    // if for some reason we didn't find the header, fallback to full logic
    if (actualLines.length === 0) actualLines = lines;

    return actualLines.join("\\n");
  } catch (e) {
    return "";
  }
}

function parseCommands(output: string) {
  const lines = output.split("\\n");
  let inCommands = false;
  const cmds: string[] = [];
  for (const line of lines) {
    if (line.trim() === "Commands:") {
      inCommands = true;
      continue;
    }
    if (inCommands && line.startsWith("  ") && !line.includes("Hint:")) {
      const match = line.match(/^ {2}([a-zA-Z0-9-]+)(?:\\s+\\*)?\\s+(.*)/);
      if (match) {
        if (match[1] !== "help") {
          cmds.push(match[1]);
        }
      }
    }
    if (
      inCommands &&
      (line.trim() === "" || (!line.startsWith("  ") && line.trim() !== "Commands:"))
    ) {
      inCommands = false;
    }
  }
  return cmds;
}

const rootCommands = parseCommands(getHelpOutput(""));
const allCommands: string[] = [];

console.log("--- Collecting all commands recursively ---");
console.log("Root commands found:", rootCommands.length);

for (const cmd of rootCommands) {
  allCommands.push(cmd);
  const subOutput = getHelpOutput(cmd);
  const subCommands = parseCommands(subOutput);
  for (const sub of subCommands) {
    const fullSub = `${cmd} ${sub}`;
    allCommands.push(fullSub);
    const subSubOutput = getHelpOutput(fullSub);
    const subSubCommands = parseCommands(subSubOutput);
    for (const subSub of subSubCommands) {
      allCommands.push(`${fullSub} ${subSub}`);
    }
  }
}

console.log(`Found ${allCommands.length} command paths. Now checking translations...`);

let untranslatedLines: string[] = [];

function isEnglishSentence(text: string) {
  if (/[\\u4e00-\\u9fa5]/.test(text)) return false;
  if (/^\\[.*\\]$/.test(text)) return false;
  if (text.startsWith("http")) return false;
  if (text.startsWith("(") && text.endsWith(")")) return false;
  return text.length > 4 && /[a-zA-Z]/.test(text);
}

for (const cmd of allCommands) {
  const output = getHelpOutput(cmd);
  const lines = output.split("\\n");

  let inHelpOptionsSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (
      line.trim().startsWith("Options:") ||
      line.trim().startsWith("Commands:") ||
      line.trim().startsWith("Global Options:")
    ) {
      inHelpOptionsSection = true;
      continue;
    }

    if (inHelpOptionsSection && line.trim() === "") {
      inHelpOptionsSection = false;
    }

    if (inHelpOptionsSection) {
      // commands or options format
      const match = line.match(/^ {2,}[^\\s].*?\\s{2,}(.+)$/);
      if (match) {
        const desc = match[1].trim();
        // ignore explicit values like "(default: false)"
        if (isEnglishSentence(desc) && !desc.toLowerCase().includes("default:")) {
          if (desc !== "显示命令帮助" && desc !== "display help for command") {
            untranslatedLines.push(`[openclaw ${cmd}] FLAG/CMD DESC: ${line.trim()}`);
          }
        }
      }
    } else {
      if (
        line.trim().length > 0 &&
        !line.startsWith(" ") &&
        !line.includes("openclaw ") &&
        !line.includes("Usage:") &&
        !line.includes("Docs:") &&
        !line.includes("Options:") &&
        !line.includes("Commands:") &&
        !line.includes("Examples:")
      ) {
        if (isEnglishSentence(line.trim()) && !line.includes("🦞") && !line.includes("@olwater")) {
          untranslatedLines.push(`[openclaw ${cmd}] TOP DESC: ${line.trim()}`);
        }
      }
    }
  }
}

if (untranslatedLines.length > 0) {
  console.log("\\n--- Untranslated Lines Found ---");
  console.log(untranslatedLines.join("\\n"));
} else {
  console.log("\\nAll clear! No untranslated English strings detected.");
}
