---
name: mcporter
description: 使用 mcporter CLI 直接列出、配置、验证和调用 MCP 服务器/工具（通过 HTTP 或 stdio），包括临时服务器、配置编辑、以及 CLI/类型生成。
homepage: http://mcporter.dev
metadata:
  {
    "openclaw":
      {
        "emoji": "📦",
        "requires": { "bins": ["mcporter"] },
        "install":
          [
            {
              "id": "node",
              "kind": "node",
              "package": "mcporter",
              "bins": ["mcporter"],
              "label": "安装 mcporter (node)",
            },
          ],
      },
  }
---

# mcporter

使用 `mcporter` 直接操作 MCP 服务器。

## 快速开始

- `mcporter list`
- `mcporter list <server> --schema`
- `mcporter call <server.tool> key=value`

## 调用工具

- 选择器：`mcporter call linear.list_issues team=ENG limit:5`
- 函数语法：`mcporter call "linear.create_issue(title: \"Bug\")"`
- 完整 URL：`mcporter call https://api.example.com/mcp.fetch url:https://example.com`
- 标准输入/输出 (Stdio)：`mcporter call --stdio "bun run ./server.ts" scrape url=https://example.com`
- JSON 负载：`mcporter call <server.tool> --args '{"limit":5}'`

## 认证 + 配置

- OAuth：`mcporter auth <server | url> [--reset]`
- 配置：`mcporter config list|get|add|remove|import|login|logout`

## 守护进程 (Daemon)

- `mcporter daemon start|status|stop|restart`

## 代码生成

- CLI：`mcporter generate-cli --server <名称>` 或 `--command <url>`
- 检查：`mcporter inspect-cli <路径> [--json]`
- TS：`mcporter emit-ts <服务器> --mode client|types`

## 注意事项

- 默认配置：`./config/mcporter.json`（可通过 `--config` 覆盖）。
- 机器可读结果建议优先使用 `--output json`。
