---
name: apple-reminders
description: 在 macOS 上通过 `remindctl` CLI 管理 Apple 提醒事项（列出、添加、编辑、完成、删除）。支持列表、日期过滤器以及 JSON/纯文本输出。
homepage: https://github.com/steipete/remindctl
metadata:
  {
    "openclaw":
      {
        "emoji": "⏰",
        "os": ["darwin"],
        "requires": { "bins": ["remindctl"] },
        "install":
          [
            {
              "id": "brew",
              "kind": "brew",
              "formula": "steipete/tap/remindctl",
              "bins": ["remindctl"],
              "label": "通过 Homebrew 安装 remindctl",
            },
          ],
      },
  }
---

# Apple Reminders CLI (remindctl)

使用 `remindctl` 直接从终端管理 Apple 提醒事项。支持列表过滤、基于日期的视图以及脚本输出。

## 设置

- 安装 (Homebrew)：`brew install steipete/tap/remindctl`
- 源码安装：`pnpm install && pnpm build`（二进制文件位于 `./bin/remindctl`）
- 仅限 macOS；在提示时授予提醒事项访问权限。

## 权限

- 检查状态：`remindctl status`
- 请求访问权限：`remindctl authorize`

## 查看提醒事项

- 默认（今天）：`remindctl`
- 今天：`remindctl today`
- 明天：`remindctl tomorrow`
- 本周：`remindctl week`
- 已过期：`remindctl overdue`
- 即将到来：`remindctl upcoming`
- 已完成：`remindctl completed`
- 全部：`remindctl all`
- 特定日期：`remindctl 2026-01-04`

## 管理列表

- 列出所有列表：`remindctl list`
- 显示列表：`remindctl list Work`
- 创建列表：`remindctl list Projects --create`
- 重命名列表：`remindctl list Work --rename Office`
- 删除列表：`remindctl list Work --delete`

## 创建提醒事项

- 快速添加：`remindctl add "买牛奶"`
- 指定列表 + 到期时间：`remindctl add --title "给妈妈打电话" --list Personal --due tomorrow`

## 编辑提醒事项

- 编辑标题/到期时间：`remindctl edit 1 --title "新标题" --due 2026-01-04`

## 完成提醒事项

- 按 ID 完成：`remindctl complete 1 2 3`

## 删除提醒事项

- 按 ID 删除：`remindctl delete 4A83 --force`

## 输出格式

- JSON（脚本使用）：`remindctl today --json`
- 纯文本 TSV：`remindctl today --plain`
- 仅计数：`remindctl today --quiet`

## 日期格式

`--due` 和日期过滤器接受以下格式：

- `today`, `tomorrow`, `yesterday`
- `YYYY-MM-DD`
- `YYYY-MM-DD HH:mm`
- ISO 8601 (`2026-01-04T12:34:56Z`)

## 注意事项

- 仅限 macOS。
- 如果访问被拒绝，请在“系统设置”→“隐私与安全性”→“提醒事项”中启用“终端”或 `remindctl`。
- 如果通过 SSH 运行，请在运行命令的 Mac 上授予访问权限。
