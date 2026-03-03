import * as fs from "fs";

const zhCnPath = "/Users/water/Documents/Code/Github/openclaw/src/i18n/locales/zh_CN.ts";
let zhCnContent = fs.readFileSync(zhCnPath, "utf8");

const additions = [
  ["Run one agent turn via the Gateway", "通过 Gateway 运行一次 agent turn"],
  ["Manage isolated agents (workspaces, auth, routing)", "管理隔离的智能体 (工作区，认证，路由)"],
  [
    "Manage connected chat channels (Telegram, Discord, etc.)",
    "管理连接的聊天渠道 (Telegram, Discord 等)",
  ],
  ["Legacy clawbot command aliases", "旧版 clawbot 命令别名"],
  [
    "Non-interactive config helpers (get/set/unset). Default: starts setup wizard.",
    "非交互式配置助手 (get/set/unset)。默认：启动配置向导。",
  ],
  [
    "Interactive setup wizard for credentials, channels, gateway, and agent defaults",
    "用于凭证、渠道、Gateway 及智能体默认设置的交互式配置向导",
  ],
  ["Manage cron jobs via the Gateway scheduler", "通过 Gateway 调度程序管理定时任务"],
  [
    "Lookup contact and group IDs (self, peers, groups) for supported chat channels",
    "查找支持聊天渠道的联系人和群组 ID (自己、对方、群组)",
  ],
  [
    "DNS helpers for wide-area discovery (Tailscale + CoreDNS)",
    "用于广域发现的 DNS 助手 (Tailscale + CoreDNS)",
  ],
  ["Run, inspect, and query the WebSocket Gateway", "运行、检查和查询 WebSocket Gateway"],
  ["Search and reindex memory files", "搜索并重建记忆文件索引"],
  ["Send, read, and manage messages", "发送、读取和管理消息"],
  ["Discover, scan, and configure models", "发现、扫描和配置模型"],
  ["Run and manage the headless node host service", "运行和管理无头节点的本地宿主服务"],
  [
    "Manage gateway-owned node pairing and node commands",
    "管理 Gateway 所属的节点配对和节点级命令",
  ],
  [
    "Interactive onboarding wizard for gateway, workspace, and skills",
    "用于 Gateway、工作区和 Skills 的交互式引导向导",
  ],
  ["Manage OpenClaw plugins and extensions", "管理 OpenClaw 插件和扩展"],
  ["Generate iOS pairing QR/setup code", "生成 iOS 配对二维码/设置代码"],
  ["Manage sandbox containers for agent isolation", "管理用于智能体隔离的沙箱容器"],
  ["Security tools and local config audits", "安全工具和本地配置审计"],
  ["Initialize local config and agent workspace", "初始化本地配置和智能体工作空间"],
  ["Update OpenClaw and inspect update channel status", "更新 OpenClaw 并检查更新通道状态"],
  [
    "Dev profile: isolate state under ~/.openclaw-dev, default gateway port 19001, and shift derived ports (browser/canvas)",
    "开发环境：隔离 ~/.openclaw-dev 状态，默认网关端口 19001，并替换派生端口(browser/canvas)",
  ],
  [
    "Use named profile (isolates OPENCLAW_STATE_DIR/OPENCLAW_CONFIG_PATH under ~/.openclaw-<name>)",
    "使用命名配置文件 (将 OPENCLAW_STATE_DIR/OPENCLAW_CONFIG_PATH 隔离在 ~/.openclaw-<名称> 下)",
  ],
];

let toAppend = "";

for (const [key, val] of additions) {
  if (!zhCnContent.includes(`"${key}"`) && !zhCnContent.includes(`'${key}'`)) {
    toAppend += `  "${key}": "${val}",\\n`;
  }
}

if (toAppend.length > 0) {
  zhCnContent = zhCnContent.replace(
    "};\\n\\nexport default zh_CN;",
    toAppend + "};\\n\\nexport default zh_CN;",
  );
  fs.writeFileSync(zhCnPath, zhCnContent, "utf8");
  console.log("Added missing translations!");
} else {
  console.log("All translations already exist.");
}
