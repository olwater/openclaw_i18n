import * as fs from "fs";

const zhCnPath = "/Users/water/Documents/Code/Github/openclaw/src/i18n/locales/zh_CN.ts";
let zhCnContent = fs.readFileSync(zhCnPath, "utf8");

const additions = [
  ["Uninstall a plugin", "卸载插件"],
  ["Keep installed files on disk", "将已安装的文件保留在磁盘上"],
  ["Deprecated alias for --keep-files", "--keep-files 的弃用别名"],
  ["Skip confirmation prompt", "跳过确认提示"],
  ["Show what would be removed without making changes", "显示将要移除的内容而不进行更改"],
  [
    "Install the Gateway service (launchd/systemd/schtasks)",
    "安装 Gateway 服务 (launchd/systemd/schtasks)",
  ],
  [
    "Uninstall the Gateway service (launchd/systemd/schtasks)",
    "卸载 Gateway 服务 (launchd/systemd/schtasks)",
  ],
  [
    "Start the Gateway service (launchd/systemd/schtasks)",
    "启动 Gateway 服务 (launchd/systemd/schtasks)",
  ],
  [
    "Stop the Gateway service (launchd/systemd/schtasks)",
    "停止 Gateway 服务 (launchd/systemd/schtasks)",
  ],
  [
    "Restart the Gateway service (launchd/systemd/schtasks)",
    "重启 Gateway 服务 (launchd/systemd/schtasks)",
  ],
  [
    "Gateway WebSocket URL (defaults to config/remote/local)",
    "Gateway WebSocket URL (默认为 config/remote/local)",
  ],
  ["Gateway token (if required)", "Gateway Token (如果需要)"],
  ["Gateway password (password auth)", "Gateway 密码 (密码认证)"],
  ["Timeout in ms", "超时时间 (毫秒)"],
  ["Skip RPC probe", "跳过 RPC 探测"],
  ["Scan system-level services", "扫描系统级服务"],
  ["Output JSON", "输出 JSON"],
  ["Gateway port", "Gateway 端口"],
  ["Daemon runtime (node|bun). Default: node", "守护进程运行时 (node|bun)。默认：node"],
  ["Gateway token (token auth)", "Gateway Token (Token 认证)"],
  ["Reinstall/overwrite if already installed", "如果已安装则重新安装/覆盖"],
  ["Remove a paired device entry", "移除配对设备条目"],
  ["Clear paired devices from the gateway table", "从网关表中清除配对设备"],
  ["Also reject all pending pairing requests", "同时拒绝所有待处理的配对请求"],
  ["Confirm destructive clear", "确认破坏性清除"],
  ["localStorage commands", "localStorage 命令"],
  ["Get localStorage (all keys or one key)", "获取 localStorage (所有键或单个键)"],
  ["Set a localStorage key", "设置 localStorage 键"],
  ["Clear all localStorage keys", "清除所有 localStorage 键"],
  ["sessionStorage commands", "sessionStorage 命令"],
  ["Get sessionStorage (all keys or one key)", "获取 sessionStorage (所有键或单个键)"],
  ["Set a sessionStorage key", "设置 sessionStorage 键"],
  ["Clear all sessionStorage keys", "清除所有 sessionStorage 键"],
  ["Send an APNs test push to an iOS node", "向 iOS 节点发送 APNs 测试推送"],
  ["Generate an iOS pairing QR code and setup code", "生成 iOS 配对二维码和设置代码"],
  [
    "Gateway WebSocket URL (defaults to gateway.remote.url when configured)",
    "Gateway WebSocket URL (配置后默认为 gateway.remote.url)",
  ],
  ["Wait for final response (agent)", "等待最终响应 (Agent)"],
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
