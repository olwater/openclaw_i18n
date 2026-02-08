---
name: wacli
description: 通过 wacli CLI 向他人发送 WhatsApp 消息或搜索/同步 WhatsApp 历史记录（非用于普通用户聊天）。
homepage: https://wacli.sh
metadata:
  {
    "openclaw":
      {
        "emoji": "📱",
        "requires": { "bins": ["wacli"] },
        "install":
          [
            {
              "id": "brew",
              "kind": "brew",
              "formula": "steipete/tap/wacli",
              "bins": ["wacli"],
              "label": "安装 wacli (brew)",
            },
            {
              "id": "go",
              "kind": "go",
              "module": "github.com/steipete/wacli/cmd/wacli@latest",
              "bins": ["wacli"],
              "label": "安装 wacli (go)",
            },
          ],
      },
  }
---

# wacli

仅当用户明确要求你通过 WhatsApp 给他人发消息，或要求同步/搜索 WhatsApp 历史记录时，才使用 `wacli`。
**不要**将 `wacli` 用于普通的用户聊天；OpenClaw 会自动路由 WhatsApp 会话。
如果用户正在 WhatsApp 上与你聊天，除非他们要求你联系第三方，否则不应使用此工具。

## 安全

- 需要明确的收件人 + 消息文本。
- 在发送前确认收件人 + 消息。
- 如果有任何模糊之处，请进行询问。

## 认证 + 同步

- `wacli auth`（扫码登录 + 初始同步）
- `wacli sync --follow`（持续同步）
- `wacli doctor`

## 查找聊天 + 消息

- `wacli chats list --limit 20 --query "名称或号码"`
- `wacli messages search "查询内容" --limit 20 --chat <jid>`
- `wacli messages search "发票" --after 2025-01-01 --before 2025-12-31`

## 历史记录回填（Backfill）

- `wacli history backfill --chat <jid> --requests 2 --count 50`

## 发送

- 文本：`wacli send text --to "+14155551212" --message "你好！下午 3 点有空吗？"`
- 群组：`wacli send text --to "1234567890-123456789@g.us" --message "会晚到 5 分钟。"`
- 文件：`wacli send file --to "+14155551212" --file /path/agenda.pdf --caption "议程"`

## 注意事项

- 存储目录：`~/.wacli`（可通过 `--store` 覆盖）。
- 解析时建议优先使用 `--json` 获取机器可读的输出。
- 历史回填需要你的手机在线；结果是尽力而为。
- 日常的用户聊天不需要 WhatsApp CLI；它是用于给其他人发消息的。
- JID 格式：直接聊天类似于 `<号码>@s.whatsapp.net`；群组类似于 `<id>@g.us`（使用 `wacli chats list` 查找）。
