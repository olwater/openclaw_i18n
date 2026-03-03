import { promises as fs } from "node:fs";
import * as path from "node:path";

async function main() {
  const zhCnPath = path.join(process.cwd(), "src/i18n/locales/zh_CN.ts");
  let content = await fs.readFile(zhCnPath, "utf-8");

  const translations = [
    `  "Apply a Playwright device descriptor (e.g. \\"iPhone 14\\")": "应用 Playwright 设备描述符 (例如 \\"iPhone 14\\")",`,
    `  "Manage connected chat channels and accounts": "管理已连接的聊天频道和账户",`,
    `  "Legacy clawbot command aliases": "旧版 clawbot 命令别名",`,
    `  "Print the active config file path": "打印当前启用的配置文件的路径",`,
    `  "Validate the current config against the schema without starting the gateway": "在不启动 Gateway 的情况下依据 schema 验证当前配置",`,
    `  "Remove a paired device entry": "移除已配对设备条目",`,
    `  "Clear paired devices from the gateway table": "清除 Gateway 表中的已配对设备",`,
    `  "Run, inspect, and query the WebSocket Gateway": "运行、检查并查询 WebSocket Gateway",`,
    `  "Search, inspect, and reindex memory files": "搜索、检查并重建记忆文件索引",`,
    `  "Run and manage the headless node host service": "运行并管理无头（headless）节点主机服务",`,
    `  "Send an APNs test push to an iOS node": "向 iOS 节点发送一项 APNs 测试推送",`,
    `  "Manage gateway-owned nodes (pairing, status, invoke, and media)": "管理受 Gateway 控制的节点（配对、状态、调用及多媒体）",`,
    `  "Manage OpenClaw plugins and extensions": "管理 OpenClaw 插件和扩展",`,
    `  "Uninstall a plugin": "卸载插件",`,
    `  "models": "模型",`,
    `  "status": "状态",`,
    `  "List routing bindings": "列出路由绑定",`,
    `  "Add routing bindings for an agent": "为 Agent 添加路由绑定",`,
    `  "Remove routing bindings for an agent": "移除 Agent 路由绑定",`,
    `  "Send, read, and manage messages and channel actions": "发送、阅读并管理消息与频道操作",`,
    `  "Run session-store maintenance now": "立即运行会话存储维护",`,
    `  "Generate an iOS pairing QR code and setup code": "生成 iOS 配对二维码及设置码",`,
    `  "Secrets runtime controls": "Secrets 运行时控制",`,
    `  "Re-resolve secret references and atomically swap runtime snapshot": "重新解析凭据引用，并原子化切换运行时快照",`,
    `  "Audit plaintext secrets, unresolved refs, and precedence drift": "审查明文秘密、未解析的引用以及优先级变动",`,
    `  "Interactive secrets helper (provider setup + SecretRef mapping + preflight)": "交互式 secrets 助手 (提供商设置 + SecretRef 映射 + 预检查)",`,
    `  "Apply a previously generated secrets plan": "应用先前生成的 secrets 计划",`,
    `  "Audit local config and state for common security foot-guns": "审计本地配置及状态以排查常见安全隐患",`,
    `  "Update OpenClaw and inspect update channel status": "更新 OpenClaw 并检查更新通道的状态",`,
    `  "Session key (default: \\"main\\", or \\"global\\" when scope is global)": "会话密钥 (默认: \\"main\\"，或作用域为全局时的 \\"global\\")",`,
  ];

  const lastBraceIndex = content.lastIndexOf("};");
  if (lastBraceIndex !== -1) {
    const newContent =
      content.slice(0, lastBraceIndex) +
      "\\n" +
      translations.join("\\n") +
      "\\n" +
      content.slice(lastBraceIndex);
    // write literally \n not the syntax error causing text.
    await fs.writeFile(zhCnPath, newContent.replace(/\\n/g, "\n"), "utf-8");
    console.log("Translations appended.");
  }
}

main().catch(console.error);
