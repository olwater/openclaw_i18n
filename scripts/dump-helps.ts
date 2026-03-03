import { execSync } from "child_process";
import * as fs from "fs";

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

let allOutput = "";
for (const cmd of commands) {
  try {
    const output = execSync("LANG=zh_CN.UTF-8 node dist/index.js " + cmd + " --help", {
      env: { ...process.env, LANG: "zh_CN.UTF-8" },
    }).toString();
    allOutput += "\\n\\n========== " + cmd + " ==========\\n\\n";
    allOutput += output;
  } catch (e) {}
}

fs.writeFileSync("clean_helps.txt", allOutput);
console.log("Saved all helps to clean_helps.txt");
