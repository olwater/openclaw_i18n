import * as fs from "fs";
import * as path from "path";
import { Project, Node, QuoteKind } from "ts-morph";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, "..");
const I18N_INDEX_PATH = path.resolve(PROJECT_ROOT, "src/i18n/index.ts");
const LOCALE_ZH_PATH = path.resolve(PROJECT_ROOT, "src/i18n/locales/zh_CN.ts");
const LOCALE_EN_PATH = path.resolve(PROJECT_ROOT, "src/i18n/locales/en_US.ts");

// Target directories relative to src
const TARGET_DIRS = ["src/wizard", "src/tui", "src/cli", "src/commands"];

// Keys to ignore (common technical strings)
const IGNORED_STRINGS = new Set(["", " ", "\n", "\t", "utf-8", "utf8", "global", "main"]);

const MODULE_DESCRIPTIONS: Record<string, { en: string; zh: string }> = {
  "src/wizard/onboarding.ts": { en: "User onboarding wizard flow", zh: "用户首次安装引导流程" },
  "src/wizard/onboarding.finalize.ts": {
    en: "Onboarding finalization steps",
    zh: "引导流程结束步骤",
  },
  "src/wizard/onboarding.gateway-config.ts": {
    en: "Gateway configuration in onboarding",
    zh: "引导流程中的网关配置",
  },
  "src/wizard/session.ts": { en: "Wizard session management", zh: "向导会话管理" },
  "src/cli/config-cli.ts": { en: "CLI configuration commands", zh: "CLI 配置命令" },
  "src/cli/cron-cli/register.cron-add.ts": {
    en: "Register cron job command",
    zh: "注册定时任务命令",
  },
  "src/cli/cron-cli/register.cron-edit.ts": { en: "Edit cron job command", zh: "编辑定时任务命令" },
  "src/cli/gateway-cli/discover.ts": { en: "Gateway discovery", zh: "网关发现" },
  "src/cli/nodes-cli/register.canvas.ts": { en: "Canvas node registration", zh: "Canvas 节点注册" },
  "src/cli/nodes-cli/register.invoke.ts": { en: "Node invocation command", zh: "节点调用命令" },
  "src/cli/nodes-cli/register.notify.ts": {
    en: "Notification node registration",
    zh: "通知节点注册",
  },
  "src/cli/nodes-cli/rpc.ts": { en: "RPC node utilities", zh: "RPC 节点工具" },
  "src/tui/theme/theme.ts": { en: "TUI Theme definitions", zh: "TUI 主题定义" },
  "src/cli/browser-cli-actions-input/shared.ts": {
    en: "Browser CLI input actions shared utils",
    zh: "浏览器 CLI 输入动作共享工具",
  },
  "src/cli/browser-cli-extension.ts": {
    en: "Browser CLI extension management",
    zh: "浏览器 CLI 扩展管理",
  },
  "src/cli/browser-cli-shared.ts": {
    en: "Browser CLI shared utilities",
    zh: "浏览器 CLI 共享工具",
  },
  "src/cli/browser-cli-state.ts": { en: "Browser CLI state management", zh: "浏览器 CLI 状态管理" },
  "src/cli/directory-cli.ts": { en: "Directory CLI commands", zh: "目录 CLI 命令" },
  "src/cli/dns-cli.ts": { en: "DNS CLI commands", zh: "DNS CLI 命令" },
  "src/cli/logs-cli.ts": { en: "Logs CLI commands", zh: "日志 CLI 命令" },
  "src/cli/nodes-camera.ts": { en: "Camera node implementation", zh: "摄像头节点实现" },
  "src/cli/nodes-canvas.ts": { en: "Canvas node implementation", zh: "Canvas 节点实现" },
  "src/cli/nodes-screen.ts": { en: "Screen recording node implementation", zh: "屏幕录制节点实现" },
  "src/cli/pairing-cli.ts": { en: "Pairing CLI commands", zh: "配对 CLI 命令" },
  "src/cli/parse-duration.ts": { en: "Duration parsing utility", zh: "持续时间解析工具" },
  "src/cli/ports.ts": { en: "Port management utilities", zh: "端口管理工具" },
  "src/cli/run-main.ts": { en: "Main CLI entry point", zh: "主 CLI 入口点" },
  "src/cli/system-cli.ts": { en: "System CLI commands", zh: "系统 CLI 命令" },
  "src/cli/update-cli.ts": { en: "Update CLI commands", zh: "更新 CLI 命令" },
  "src/cli/webhooks-cli.ts": { en: "Webhooks CLI commands", zh: "Webhooks CLI 命令" },
};

function isConsoleCall(node: Node): boolean {
  if (!Node.isCallExpression(node)) {
    return false;
  }
  const expr = node.getExpression();
  if (!Node.isPropertyAccessExpression(expr)) {
    return false;
  }
  const obj = expr.getExpression();
  return Node.isIdentifier(obj) && obj.getText() === "console";
}

function isErrorNew(node: Node): boolean {
  if (!Node.isNewExpression(node)) {
    return false;
  }
  const expr = node.getExpression();
  return Node.isIdentifier(expr) && expr.getText() === "Error";
}

function isTCallArgument(node: Node): boolean {
  const parent = node.getParent();
  if (!parent) {
    return false;
  }
  if (Node.isCallExpression(parent)) {
    const expr = parent.getExpression();
    return Node.isIdentifier(expr) && expr.getText() === "t";
  }
  return false;
}

// Helper to determine if a string should be translated
function shouldTranslate(node: Node): boolean {
  if (!Node.isStringLiteral(node) && !Node.isNoSubstitutionTemplateLiteral(node)) {
    return false;
  }
  const text = node.getLiteralText();
  if (IGNORED_STRINGS.has(text)) {
    return false;
  }

  const parent = node.getParent();
  if (!parent) {
    return false;
  }

  // Skip imports/exports
  if (Node.isImportDeclaration(parent) || Node.isExportDeclaration(parent)) {
    return false;
  }
  if (Node.isLiteralTypeNode(parent)) {
    return false;
  } // type T = "literal"

  // 1. Check for specific function calls
  if (Node.isCallExpression(parent)) {
    if (isConsoleCall(parent)) {
      return true;
    }
    if (isTCallArgument(node)) {
      return false;
    } // Already handled

    const expr = parent.getExpression();
    if (Node.isPropertyAccessExpression(expr)) {
      const name = expr.getName();
      const args = parent.getArguments();
      const argIndex = args.indexOf(node as unknown as Node);

      // commander: .description("...") -> arg 0
      if (name === "description" && argIndex === 0) {
        return true;
      }
      // commander: .option("-f", "desc") -> arg 1
      if (name === "option" && argIndex === 1) {
        return true;
      }

      // clack/prompts: .note("msg", "title")
      if (name === "note") {
        return true;
      }
      // clack: .intro, .outro, .text
      if (
        ["intro", "outro", "text", "confirm", "select", "multiselect"].includes(name) &&
        argIndex === 0
      ) {
        return true;
      }

      // TUI methods
      if (["setText", "setMessage", "setActivityStatus", "setConnectionStatus"].includes(name)) {
        return true;
      }

      // Theme
      if (["header", "dim", "bold", "accent", "accentSoft"].includes(name)) {
        return true;
      }

      // General error handling
      if (name === "error" || name === "warn") {
        return true;
      }
    }
  }

  // 2. new Error("...")
  if (Node.isNewExpression(parent)) {
    if (isErrorNew(parent)) {
      return true;
    }
  }

  // 3. Object properties
  if (Node.isPropertyAssignment(parent)) {
    const name = parent.getName();
    // Common UI properties
    // DANGER: initialValue is often a literal type!
    // We skip it here to avoid logic breakage.
    if (["message", "placeholder", "text", "title", "desc", "label", "hint"].includes(name)) {
      return true;
    }
  }

  // 4. Heuristic: Natural Language
  // If it contains spaces and doesn't look like a flag or path
  if (text.includes(" ")) {
    // Exclude CLI flags like "-m, --message <text>"
    if (text.startsWith("-")) {
      return false;
    }
    // Exclude paths starting with / or ./
    if (text.startsWith("/") || text.startsWith("./") || text.startsWith("../")) {
      return false;
    }

    // Check for code-like patterns
    if (text.includes("import ") || text.includes("export ") || text.includes("from ")) {
      return false;
    }

    return true;
  }

  return false;
}

// Global Map: Key -> Set of FilePaths where it appears
const globalTranslations = new Map<string, Set<string>>();

async function main() {
  const project = new Project({
    tsConfigFilePath: path.resolve(PROJECT_ROOT, "tsconfig.json"),
    manipulationSettings: {
      quoteKind: QuoteKind.Double,
    },
  });

  const files = project.getSourceFiles().filter((f) => {
    const filePath = f.getFilePath();
    return TARGET_DIRS.some((dir) => filePath.includes(path.resolve(PROJECT_ROOT, dir)));
  });

  console.log(`Found ${files.length} files to scan.`);

  for (const file of files) {
    try {
      let modified = false;
      const filePath = file.getFilePath();
      const relativePath = path.relative(PROJECT_ROOT, filePath);

      const replacements: { node: Node; text: string }[] = [];

      file.forEachDescendant((node) => {
        if (Node.isStringLiteral(node) || Node.isNoSubstitutionTemplateLiteral(node)) {
          const text = node.getLiteralText();
          if (shouldTranslate(node)) {
            replacements.push({ node, text });
            if (!globalTranslations.has(text)) {
              globalTranslations.set(text, new Set());
            }
            globalTranslations.get(text)!.add(relativePath);
          } else if (isTCallArgument(node)) {
            if (!globalTranslations.has(text)) {
              globalTranslations.set(text, new Set());
            }
            globalTranslations.get(text)!.add(relativePath);
          }
        }
      });

      if (replacements.length > 0) {
        const imports = file.getImportDeclarations();
        let hasTImport = false;

        for (const imp of imports) {
          const moduleSpecifier = imp.getModuleSpecifierValue();
          if (moduleSpecifier.includes("/i18n") || moduleSpecifier.includes("translations")) {
            const namedImports = imp.getNamedImports();
            if (namedImports.some((ni) => ni.getName() === "t")) {
              hasTImport = true;
              break;
            }
          }
        }

        if (!hasTImport) {
          const fileDir = path.dirname(filePath);
          const i18nDir = path.dirname(I18N_INDEX_PATH);
          let relativeImportPath = path.relative(fileDir, i18nDir);
          if (!relativeImportPath.startsWith(".")) {
            relativeImportPath = "./" + relativeImportPath;
          }
          file.addImportDeclaration({
            namedImports: ["t"],
            moduleSpecifier: `${relativeImportPath}/index.js`,
          });
        }

        for (const { node, text } of replacements) {
          if (text.includes("${")) {
            continue;
          }

          // Use as any to prevent literal type mismatches
          node.replaceWithText(`t(${JSON.stringify(text)}) as any`);
          modified = true;
        }
      }

      if (modified) {
        await file.save();
        console.log(`Updated ${relativePath}`);
      }
    } catch (e) {
      console.error(`Error processing file ${file.getFilePath()}:`, e);
    }
  }

  // Generate locale files
  const existingZh = await loadExistingTranslations(LOCALE_ZH_PATH);
  const existingEn = await loadExistingTranslations(LOCALE_EN_PATH);

  generateLocaleFile(LOCALE_ZH_PATH, globalTranslations, true, existingZh);
  generateLocaleFile(LOCALE_EN_PATH, globalTranslations, false, existingEn);
}

async function loadExistingTranslations(path: string): Promise<Record<string, string>> {
  if (!fs.existsSync(path)) {
    return {};
  }
  try {
    const content = fs.readFileSync(path, "utf8");
    // Simple regex to extract keys and values from the TS file
    // This is safer than importing if the file has syntax errors
    const matches = content.matchAll(/"((?:\\.|[^"])*)":\s*"((?:\\.|[^"])*)"/g);
    const result: Record<string, string> = {};
    for (const match of matches) {
      const key = match[1].replace(/\\"/g, '"').replace(/\\n/g, "\n").replace(/\\\\/g, "\\");
      const val = match[2].replace(/\\"/g, '"').replace(/\\n/g, "\n").replace(/\\\\/g, "\\");
      result[key] = val;
    }
    return result;
  } catch (e) {
    console.warn(`Failed to parse existing translations from ${path}:`, e);
    return {};
  }
}

function generateLocaleFile(
  outputPath: string,
  data: Map<string, Set<string>>,
  isZh: boolean,
  existing: Record<string, string>,
) {
  let content = `// =====================================================================================\n`;
  content += `// Auto-generated by scripts/auto-i18n.ts\n`;
  content += `// =====================================================================================\n\n`;
  content += `export default {\n`;

  // Group keys by their primary file for better organization
  const fileToKeys = new Map<string, string[]>();
  for (const [key, files] of data.entries()) {
    const primaryFile = Array.from(files)[0];
    if (!fileToKeys.has(primaryFile)) {
      fileToKeys.set(primaryFile, []);
    }
    fileToKeys.get(primaryFile)!.push(key);
  }

  const sortedFiles = Array.from(fileToKeys.keys()).toSorted();

  for (const file of sortedFiles) {
    const keys = fileToKeys.get(file)!.toSorted();
    if (keys.length === 0) {
      continue;
    }

    const moduleLabel = isZh ? "模块" : "Module";
    const descLabel = isZh ? "功能" : "Description";

    content += `  // =====================================================================================\n`;
    content += `  // ${moduleLabel}: ${file}\n`;

    const desc = MODULE_DESCRIPTIONS[file];
    if (desc) {
      content += `  // ${descLabel}: ${isZh ? desc.zh : desc.en}\n`;
    }

    content += `  // =====================================================================================\n`;

    for (const key of keys) {
      let val = existing[key];
      if (!val || val.startsWith("[TODO]")) {
        val = isZh ? `[TODO] ${key}` : key;
      }

      // Use JSON.stringify for absolute safety with quotes and escapes
      const line = `  ${JSON.stringify(key)}: ${JSON.stringify(val)},`;
      content += line + "\n";
    }
    content += `\n`;
  }

  content += `};\n`;

  fs.writeFileSync(outputPath, content, "utf-8");
  console.log(`Generated ${outputPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
