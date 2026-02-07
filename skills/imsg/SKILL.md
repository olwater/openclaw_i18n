---
name: imsg
description: 用于列出聊天、历史记录、监控和发送的 iMessage/SMS CLI。
homepage: https://imsg.to
metadata:
  {
    "openclaw":
      {
        "emoji": "📨",
        "os": ["darwin"],
        "requires": { "bins": ["imsg"] },
        "install":
          [
            {
              "id": "brew",
              "kind": "brew",
              "formula": "steipete/tap/imsg",
              "bins": ["imsg"],
              "label": "安装 imsg (brew)",
            },
          ],
      },
  }
---

# imsg 动作

## 概述

使用 `imsg` 在 macOS 上阅读和发送 Messages.app iMessage/SMS。

要求：Messages.app 已登录，终端具有全磁盘访问权限（Full Disk Access），以及控制 Messages.app 进行发送的自动化权限（Automation permission）。

## 需要收集的输入

- 接收者句柄（电话/电子邮件）用于 `send`
- `chatId` 用于历史记录/监控（来自 `imsg chats --limit 10 --json`）
- `text` 和可选的 `file` 路径用于发送

## 动作

### 列出聊天

```bash
imsg chats --limit 10 --json
```

### 获取聊天记录

```bash
imsg history --chat-id 1 --limit 20 --attachments --json
```

### 监控聊天

```bash
imsg watch --chat-id 1 --attachments
```

### 发送消息

```bash
imsg send --to "+14155551212" --text "hi" --file /path/pic.jpg
```

## 注意

- `--service imessage|sms|auto` 控制投递方式。
- 发送前确认接收者 + 消息。

## 尝试的想法

- 使用 `imsg chats --limit 10 --json` 发现聊天 ID。
- 监控高信号聊天以流式传输传入消息。
