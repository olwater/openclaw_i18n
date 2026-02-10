import fs from "fs";
import path from "path";

function deduplicateI18n(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const header = [];
  const footer = [];
  const entries = [];

  let inObject = false;
  for (const line of lines) {
    if (line.includes("const zh_CN: TranslationMap = {")) {
      inObject = true;
      header.push(line);
      continue;
    }
    if (line.includes("};")) {
      inObject = false;
      footer.push(line);
      continue;
    }

    if (inObject) {
      entries.push(line);
    } else {
      if (header.length > 0 && footer.length === 0) {
        header.push(line);
      } else if (footer.length > 0) {
        footer.push(line);
      } else {
        header.push(line);
      }
    }
  }

  const seenKeys = new Set();
  const uniqueEntries = [];
  const keyRegex = /^\s*(["'])(.*?)(?<!\\)\1\s*:/;

  for (const entry of entries) {
    const match = entry.match(keyRegex);
    if (match) {
      const key = match[2];
      if (seenKeys.has(key)) {
        console.log(`Removing duplicate key: ${key}`);
        continue;
      }
      seenKeys.add(key);
    }
    uniqueEntries.push(entry);
  }

  const newContent = [...header, ...uniqueEntries, ...footer].join("\n");
  fs.writeFileSync(filePath, newContent, "utf-8");
  console.log(`Deduplication complete. Kept ${seenKeys.size} unique keys.`);
}

const localeFile = path.resolve("src/i18n/locales/zh_CN.ts");
deduplicateI18n(localeFile);
