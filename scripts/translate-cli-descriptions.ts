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

async function processFile(filePath: string) {
  let content = await fs.readFile(filePath, "utf-8");
  let modified = false;

  const descRegex = /\.description\(\s*(["'])(.*?)\1\s*\)/g;

  content = content.replace(descRegex, (match, quote, text) => {
    if (match.includes("t(") || text.includes("${")) {
      return match;
    }
    modified = true;
    return `.description(t(${quote}${text}${quote}))`;
  });

  if (modified) {
    if (!content.includes("import { t }")) {
      // Find the last import
      const importMatches = Array.from(content.matchAll(/^import .* from ".*";$/gm));
      let depth = filePath.split(path.sep).length - cliDir.split(path.sep).length;
      let relativePath = "../".repeat(depth) + "i18n/index.js";
      if (depth === 0) relativePath = "../i18n/index.js";

      if (importMatches.length > 0) {
        const lastImport = importMatches[importMatches.length - 1];
        const lastImportIndex = lastImport.index! + lastImport[0].length;
        content =
          content.substring(0, lastImportIndex) +
          `\nimport { t } from "${relativePath}";` +
          content.substring(lastImportIndex);
      } else {
        content = `import { t } from "${relativePath}";\n` + content;
      }
    }

    await fs.writeFile(filePath, content, "utf-8");
    console.log(`Updated ${path.relative(process.cwd(), filePath)}`);
  }
}

async function main() {
  const files = await walk(cliDir);
  for (const file of files) {
    await processFile(file);
  }
  console.log("Done");
}

main().catch(console.error);
