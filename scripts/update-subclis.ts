import { promises as fs } from "node:fs";
import * as path from "node:path";

async function main() {
  const targetFile = path.join(process.cwd(), "src/cli/program/register.subclis.ts");
  let content = await fs.readFile(targetFile, "utf-8");

  if (!content.includes("import { t }")) {
    const importMatches = Array.from(content.matchAll(/^import .* from ".*";$/gm));
    if (importMatches.length > 0) {
      const lastImport = importMatches[importMatches.length - 1];
      const lastImportIndex = lastImport.index! + lastImport[0].length;
      content =
        content.substring(0, lastImportIndex) +
        `\nimport { t } from "../../i18n/index.js";` +
        content.substring(lastImportIndex);
    } else {
      content = `import { t } from "../../i18n/index.js";\n` + content;
    }
  }

  const descRegex = /description:\s*(["'])(.*?)\1/g;
  content = content.replace(descRegex, (match, quote, text) => {
    if (text.includes("${") || match.includes("t(")) {
      return match;
    }
    return `description: t(${quote}${text}${quote})`;
  });

  await fs.writeFile(targetFile, content, "utf-8");
  console.log("Updated register.subclis.ts");
}

main().catch(console.error);
