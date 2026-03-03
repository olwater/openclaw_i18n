import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const localePath = "src/i18n/locales/zh_CN.ts";

function main() {
  console.log("Reading locale file...");
  const localeContent = fs.readFileSync(localePath, "utf8");

  // Regex to extract keys from the locale file
  // Matches "key": "value" or 'key': 'value' or key: 'value' (with some simplifications)
  const keyRegex = /^(?:\s*)(?:"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)')\s*:/gm;

  const allKeys: string[] = [];
  let match;
  while ((match = keyRegex.exec(localeContent)) !== null) {
    if (match[1]) allKeys.push(match[1]);
    else if (match[2]) allKeys.push(match[2]);
  }

  console.log(`Found ${allKeys.length} keys in ${localePath}`);

  // Create a temporary file containing all keys to search for using ripgrep
  const tmpKeysFile = "tmp-keys-to-search.txt";
  fs.writeFileSync(tmpKeysFile, allKeys.join("\\n"));

  console.log("Searching for key usage in src/ directory using rg...");

  const unusedKeys: string[] = [];
  let i = 0;
  for (const key of allKeys) {
    i++;
    if (i % 500 === 0) console.log(`Processed ${i}/${allKeys.length} keys...`);

    // Escape key for ripgrep literal search, need to handle quotes, parens, brackets, etc.
    // Easiest is to use rg -F (fixed strings) search

    try {
      // Redirect output to null, we just care if it exits with 0 (found) or 1 (not found)
      // Search in src/ but exclude the i18n/locales directory itself
      execSync(`rg -F -q -g '!src/i18n/locales/*' -- "${key.replace(/"/g, '\\\\"')}" src/`, {
        stdio: "ignore",
      });
    } catch (e: any) {
      // rg exits with code 1 if no matches are found
      if (e.status === 1) {
        unusedKeys.push(key);
      } else {
        console.error(`Error searching for key: ${key}`, e.message);
      }
    }
  }

  console.log(`\\nFound ${unusedKeys.length} potentially unused keys.`);

  // Write unused keys to a file for review instead of auto-deleting to be safe
  fs.writeFileSync("unused-keys-report.json", JSON.stringify(unusedKeys, null, 2));
  console.log("Wrote unused keys to unused-keys-report.json for review.");

  // Clean up
  if (fs.existsSync(tmpKeysFile)) fs.unlinkSync(tmpKeysFile);
}

main();
