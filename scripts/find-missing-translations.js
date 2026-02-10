import fs from "fs";
import path from "path";

// Simple regex to match t("string") or t('string')
const T_REGEX = /t\s*\(\s*(["'])(.*?)(?<!\\)\1\s*[,)]/g;

function getFiles(dir) {
  try {
    const subdirs = fs.readdirSync(dir);
    const files = subdirs.map((subdir) => {
      const res = path.resolve(dir, subdir);
      return fs.statSync(res).isDirectory() ? getFiles(res) : res;
    });
    return files.reduce((a, f) => a.concat(f), []);
  } catch (e) {
    return [];
  }
}

async function main() {
  const srcDir = path.resolve("src");
  const localeFile = path.resolve("src/i18n/locales/zh_CN.ts");

  const localeContent = fs.readFileSync(localeFile, "utf-8");

  // Extract keys from locale file
  const definedKeys = new Set();
  const keyRegex = /^\s*(["'])(.*?)(?<!\\)\1\s*:/gm;
  let match;
  while ((match = keyRegex.exec(localeContent)) !== null) {
    definedKeys.add(match[2]);
  }

  console.log(`Found ${definedKeys.size} defined keys in zh_CN.ts`);

  const files = getFiles(srcDir).filter(
    (f) => f.endsWith(".ts") && !f.endsWith(".d.ts") && !f.endsWith(".test.ts"),
  );

  const foundKeys = new Set();
  const missingKeys = new Set();

  for (const file of files) {
    const content = fs.readFileSync(file, "utf-8");
    while ((match = T_REGEX.exec(content)) !== null) {
      const key = match[2];
      foundKeys.add(key);
      if (!definedKeys.has(key)) {
        missingKeys.add(key);
      }
    }
  }

  console.log(`Found ${foundKeys.size} unique keys in source code.`);
  console.log(`Missing ${missingKeys.size} keys in zh_CN.ts.`);

  if (missingKeys.size > 0) {
    console.log("\n--- Missing Keys (formatted for zh_CN.ts) ---");
    const sortedKeys = Array.from(missingKeys).toSorted();
    sortedKeys.forEach((key) => {
      const escapedKey = key.replace(/"/g, '\\"');
      console.log(`  "${escapedKey}": "${escapedKey}",`);
    });
  }
}

main().catch(console.error);
