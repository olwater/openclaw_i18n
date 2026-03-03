import * as fs from "fs";
import * as path from "path";

function findFiles(dir: string, fileList: string[] = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    try {
      if (fs.statSync(filePath).isDirectory()) {
        findFiles(filePath, fileList);
      } else if (filePath.endsWith(".ts") || filePath.endsWith(".tsx")) {
        fileList.push(filePath);
      }
    } catch (e) {}
  }
  return fileList;
}

const allTsFiles = findFiles("/Users/water/Documents/Code/Github/openclaw/src");

// Load zh_CN translation keys
const zhCnPath = "/Users/water/Documents/Code/Github/openclaw/src/i18n/locales/zh_CN.ts";
const zhCnContent = fs.readFileSync(zhCnPath, "utf8");

// Use string split matching
const zhKeys = new Set<string>();

const lines = zhCnContent.split("\\n");
for (const line of lines) {
  const quoteIndex = line.indexOf(': "');
  if (quoteIndex !== -1) {
    let keyPart = line.substring(0, quoteIndex).trim();
    if (keyPart.startsWith('"') && keyPart.endsWith('"')) {
      zhKeys.add(keyPart.substring(1, keyPart.length - 1));
    } else if (keyPart.startsWith("'") && keyPart.endsWith("'")) {
      zhKeys.add(keyPart.substring(1, keyPart.length - 1));
    }
  }
}

const missingKeys = new Set<string>();

function checkText(tStr: string, quoteChar: string) {
  const p = tStr.split(quoteChar);
  if (p.length > 1) {
    let after = p[1];
    let endIdx = after.indexOf(quoteChar);
    if (endIdx !== -1) {
      let key = after.substring(0, endIdx);
      if (!key.includes("${") && !zhKeys.has(key)) {
        missingKeys.add(key);
      }
    }
  }
}

for (const file of allTsFiles) {
  const content = fs.readFileSync(file, "utf8");

  const chunks1 = content.split('t("');
  for (let i = 1; i < chunks1.length; i++) {
    let after = chunks1[i];
    let endIdx = after.indexOf('")');
    if (endIdx !== -1) {
      let key = after.substring(0, endIdx);
      if (!zhKeys.has(key)) missingKeys.add(key);
    }
  }

  const chunks2 = content.split("t('");
  for (let i = 1; i < chunks2.length; i++) {
    let after = chunks2[i];
    let endIdx = after.indexOf("')");
    if (endIdx !== -1) {
      let key = after.substring(0, endIdx);
      if (!zhKeys.has(key)) missingKeys.add(key);
    }
  }

  const chunks3 = content.split("t(`");
  for (let i = 1; i < chunks3.length; i++) {
    let after = chunks3[i];
    let endIdx = after.indexOf("`)");
    if (endIdx !== -1) {
      let key = after.substring(0, endIdx);
      if (!key.includes("${") && !zhKeys.has(key)) missingKeys.add(key);
    }
  }
}

let res = Array.from(missingKeys).filter(
  (k) => k.length > 2 && /[a-zA-Z]/.test(k) && !/[\\u4e00-\\u9fa5]/.test(k),
);

if (res.length > 0) {
  console.log("Missing keys:");
  for (const key of res) {
    console.log(`  "${key}": "",`);
  }
} else {
  console.log("No missing keys in zh_CN.ts!");
}
