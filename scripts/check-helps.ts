import { execSync } from "child_process";

const commands = [
  "acp",
  "agent",
  "agents",
  "approvals",
  "browser",
  "channels",
  "clawbot",
  "completion",
  "config",
  "configure",
  "cron",
  "daemon",
  "dashboard",
  "devices",
  "directory",
  "dns",
  "docs",
  "doctor",
  "gateway",
  "health",
  "hooks",
  "logs",
  "memory",
  "message",
  "models",
  "node",
  "nodes",
  "onboard",
  "pairing",
  "plugins",
  "qr",
  "reset",
  "sandbox",
  "security",
  "sessions",
  "setup",
  "skills",
  "status",
  "system",
  "tui",
  "uninstall",
  "update",
  "webhooks",
];

function isEnglishSentence(text: string) {
  // Check if string contains mostly english words and no chinese
  if (/[\\u4e00-\\u9fa5]/.test(text)) return false;
  return text.length > 5 && /[a-zA-Z]/.test(text);
}

console.log("--- Scanning subcommands for untranslated text ---");

for (const cmd of commands) {
  try {
    const output = execSync("LANG=zh_CN.UTF-8 pnpm openclaw " + cmd + " --help", {
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, LANG: "zh_CN.UTF-8" },
    }).toString();

    // Parse output for commands/options
    const lines = output.split("\\n");
    let section = "";

    for (const line of lines) {
      if (line.trim().endsWith(":")) {
        section = line.trim();
        continue;
      }

      if (section === "Commands:" || section === "Options:") {
        // Typically "  cmd-name   Description text here"
        const match = line.match(
          /^ {2}[a-zA-Z0-9<>\\[\\]*=,-]+(?:\\s+[a-zA-Z0-9<>\\[\\]*=,-]+)*\\s+(.+)$/,
        );
        if (match) {
          const desc = match[1].trim();
          // Ignore if it's just [default: false] etc
          if (desc.startsWith("[") && desc.endsWith("]")) continue;

          if (isEnglishSentence(desc)) {
            console.log("[" + cmd + "] " + section + " -> " + line.trim());
          }
        }
      }
    }
  } catch (e: any) {
    // Ignore errors for commands that might not have --help
  }
}
console.log("--- Done scanning ---");
