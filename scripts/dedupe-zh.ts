import * as fs from "fs";

const p = "/Users/water/Documents/Code/Github/openclaw/src/i18n/locales/zh_CN.ts";
const content = fs.readFileSync(p, "utf8");

const lines = content.split("\\n");
const seen = new Set<string>();
const newLines: string[] = [];

for (const line of lines) {
  let stripped = line.trim();
  if (stripped.startsWith('"') || stripped.startsWith("'")) {
    const colonIdx = stripped.indexOf(":");
    if (colonIdx !== -1) {
      const key = stripped.substring(0, colonIdx).trim();
      if (seen.has(key)) {
        console.log("Removing duplicate key:", key);
        continue;
      }
      seen.add(key);
    }
  }
  // We add it to newLines
  newLines.push(line);
}

fs.writeFileSync(p, newLines.join("\\n"), "utf8");
console.log("Dedupe complete!");
