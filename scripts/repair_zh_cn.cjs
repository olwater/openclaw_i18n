const fs = require("fs");

const zhPath = "/Users/water/Documents/Code/Github/openclaw/src/i18n/locales/zh_CN.ts";
const enPath = "/Users/water/Documents/Code/Github/openclaw/src/i18n/locales/en_US.ts";

const zhContent = fs.readFileSync(zhPath, "utf-8");
const enContent = fs.readFileSync(enPath, "utf-8");

const enKeys = new Set();
const enLines = enContent.split("\n");
for (const line of enLines) {
  const match = line.trim().match(/^"(.+?)":/);
  if (match) {
    enKeys.add(match[1].replace(/\\\\/g, "\\").replace(/\\"/g, '"'));
  }
}

const zhPairs = {};
const zhLines = zhContent.split("\n");

function cleanCorruptedString(s) {
  if (!s) {
    return "";
  }
  // 移除开头和结尾可能存在的多次转义的引号和反斜杠
  let current = s.trim();

  // 循环移除开头的 \ 和 " 以及 :
  while (true) {
    let prev = current;
    current = current.replace(/^[\\":\s]+/, "");
    if (current === prev) {
      break;
    }
  }

  // 循环移除结尾的 \
  while (true) {
    let prev = current;
    current = current.replace(/[\\:\s]+$/, "");
    if (current === prev) {
      break;
    }
  }

  return current;
}

for (const line of zhLines) {
  const trimmed = line.trim();
  // 匹配 "key": "value"
  const match = trimmed.match(/^"([\s\S]+?)":\s*"([\s\S]*?)",?$/);
  if (match) {
    let rawKey = match[1];
    let rawValue = match[2];

    // 处理 Key：移除转义并清理结尾损坏
    let key = rawKey.replace(/\\\\/g, "\\").replace(/\\"/g, '"');
    key = key.replace(/[\\:\s]+$/, ""); // 移除结尾的反斜杠和冒号

    // 处理 Value：深度清理
    let value = rawValue.replace(/\\\\/g, "\\").replace(/\\"/g, '"').replace(/\\n/g, "\n");
    value = cleanCorruptedString(value);

    if (key && value && value !== key) {
      // 如果 key 在 enKeys 中，或者经过清理后在 enKeys 中
      if (enKeys.has(key)) {
        zhPairs[key] = value;
      } else {
        // 尝试进一步清理 key
        const furtherCleanedKey = cleanCorruptedString(key);
        if (enKeys.has(furtherCleanedKey)) {
          zhPairs[furtherCleanedKey] = value;
        }
      }
    }
  }
}

// 重新构建输出
let output = 'import { TranslationMap } from "../translations";\n\n';
output += "const zh_CN: TranslationMap = {\n";

const sortedKeys = Object.keys(zhPairs).toSorted();
for (const key of sortedKeys) {
  const escapedKey = key.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const value = zhPairs[key];
  const escapedValue = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
  output += `  "${escapedKey}": "${escapedValue}",\n`;
}

output += "};\n\nexport default zh_CN;\n";

fs.writeFileSync(zhPath, output);
console.log(`Cleaned up zh_CN.ts. Total keys: ${sortedKeys.length}`);
