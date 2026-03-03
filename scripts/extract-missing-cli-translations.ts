import { promises as fs } from "node:fs";
import * as path from "node:path";

const cliDir = path.join(process.cwd(), "src/cli");

async function walk(dir: string, fileList: string[] = []): Promise<string[]> {
  const files = await fs.readdir(dir);
  for (const file of files) {
    const stat = await fs.stat(path.join(dir, file));
    if (stat.isDirectory()) {
      await walk(path.join(dir, file), fileList);
    } else if (file.endsWith(".ts")) {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}

async function extractTranslations() {
  const files = await walk(cliDir);
  const foundStrings = new Set<string>();

  for (const file of files) {
    const content = await fs.readFile(file, "utf-8");
    // Match .description(t("...")) or .description(t('...'))
    const matches = Array.from(content.matchAll(/\.description\(t\((["'])(.*?)\1\)\)/g));
    for (const match of matches) {
      foundStrings.add(match[2]);
    }
  }

  // Also check options
  for (const file of files) {
    const content = await fs.readFile(file, "utf-8");
    const matches = Array.from(
      content.matchAll(/\.option\(\s*(["']).*?\1\s*,\s*t\((["'])(.*?)\2\)/g),
    );
    for (const match of matches) {
      foundStrings.add(match[3]);
    }
  }

  const zhCnPath = path.join(process.cwd(), "src/i18n/locales/zh_CN.ts");
  const zhCnContent = await fs.readFile(zhCnPath, "utf-8");

  const missing = [];
  for (const str of foundStrings) {
    // Basic check if the literal string is in the file
    if (!zhCnContent.includes(`"${str}"`)) {
      missing.push(str);
    }
  }

  console.log("Missing translations for CLI descriptions:");
  for (const str of missing) {
    console.log(`    "${str}": "翻译：${str}",`);
  }
}

extractTranslations().catch(console.error);
