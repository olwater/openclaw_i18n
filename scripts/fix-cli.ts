import * as fs from "fs";
import * as path from "path";

function findFiles(dir: string, fileList: string[] = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findFiles(filePath, fileList);
    } else if (filePath.endsWith(".ts") && !filePath.endsWith(".test.ts")) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const cliFiles = findFiles("/Users/water/Documents/Code/Github/openclaw/src/cli");

let totalFixed = 0;

function isEnglish(text: string) {
  if (/[\\u4e00-\\u9fa5]/.test(text)) return false;
  if (/[🦞]/.test(text)) return false;
  if (text.length <= 3) return false;
  return /[a-zA-Z]/.test(text);
}

for (const file of cliFiles) {
  let content = fs.readFileSync(file, "utf8");
  const originalContent = content;

  const lines = content.split(/\\r?\\n/);
  let changed = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Handle double quotes
    if (line.includes('.description("') && !line.includes('.description(t("')) {
      const parts = line.split('.description("');
      const after = parts[1];
      const endIdx = after.indexOf('")');
      if (endIdx !== -1) {
        const str = after.substring(0, endIdx);
        if (isEnglish(str)) {
          lines[i] = parts[0] + '.description(t("' + str + '")' + after.substring(endIdx + 2);
          changed = true;
        }
      }
    }
    // Handle single quotes
    if (line.includes(".description('") && !line.includes(".description(t('")) {
      const parts = line.split(".description('");
      const after = parts[1];
      const endIdx = after.indexOf("')");
      if (endIdx !== -1) {
        const str = after.substring(0, endIdx);
        if (isEnglish(str)) {
          lines[i] = parts[0] + ".description(t('" + str + "')" + after.substring(endIdx + 2);
          changed = true;
        }
      }
    }

    // .option("--foo", "Bar")
    if (line.includes(".option(") && !line.includes(", t(") && !line.includes(",t(")) {
      let p = line.split(".option(");
      if (p.length > 1) {
        let afterOption = p[1];
        // we match inside the parenthesis
        // format is usually: "--flag", "desc"
        // check for quote, comma, quote
        let strQuote = '"';
        let commaIdx = afterOption.indexOf(', "');
        if (commaIdx === -1) {
          commaIdx = afterOption.indexOf(", '");
          strQuote = "'";
        }
        if (commaIdx !== -1) {
          let afterComma = afterOption.substring(commaIdx + 3); // skips `, "` or `, '`
          let endQuoteIdx = afterComma.indexOf(strQuote);
          if (endQuoteIdx !== -1) {
            let desc = afterComma.substring(0, endQuoteIdx);
            if (isEnglish(desc)) {
              let toReplace = strQuote + desc + strQuote;
              let replacement = "t(" + strQuote + desc + strQuote + ")";
              lines[i] = line.replace(toReplace, replacement);
              changed = true;
            }
          }
        }
      }
    }
  }

  if (changed) {
    content = lines.join(String.fromCharCode(10));
    if (
      !content.includes("import { t }") &&
      !content.includes(", t }") &&
      !content.includes("{ t,")
    ) {
      const depth =
        file.substring("/Users/water/Documents/Code/Github/openclaw/src/".length).split("/")
          .length - 1;
      const relativePath = depth === 0 ? "./i18n" : "../".repeat(depth) + "i18n";

      let lastImportIdx = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("import ")) {
          lastImportIdx = i;
        }
      }

      const importLine = 'import { t } from "' + relativePath + '";';
      if (lastImportIdx !== -1) {
        lines.splice(lastImportIdx + 1, 0, importLine);
      } else {
        lines.unshift(importLine);
      }
      content = lines.join(String.fromCharCode(10));
    }

    fs.writeFileSync(file, content, "utf8");
    console.log(`Fixed translations in ${file}`);
    totalFixed++;
  }
}

console.log(`Fixed files: ${totalFixed}`);
