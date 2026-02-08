---
name: bluebubbles
description: 当需要通过 BlueBubbles（推荐的 iMessage 集成方案）发送或管理 iMessage 时使用。调用通过带有 channel="bluebubbles" 的通用 message 工具进行。
metadata: { "openclaw": { "emoji": "🫧", "requires": { "config": ["channels.bluebubbles"] } } }
---

# BlueBubbles 操作

## 概览

BlueBubbles 是 OpenClaw 推荐的 iMessage 集成方案。使用 `message` 工具配合 `channel: "bluebubbles"` 来发送消息和管理 iMessage 对话：发送文本和附件、添加反应 (tapbacks)、编辑/撤回、在线程中回复，以及管理群组参与者/名称/图标。

## 需要收集的输入

- `target`（首选 `chat_guid:...`；也支持 E.164 格式的 `+15551234567` 或 `user@example.com`）
- 用于发送/编辑/回复的 `message` 文本
- 用于反应/编辑/撤回/回复的 `messageId`
- 本地文件的附件 `path`，或 base64 格式的 `buffer` + `filename`

如果用户描述模糊（如“给妈妈发条短信”），请询问收件人账号或聊天 GUID 以及确切的消息内容。

## 操作

### 发送消息

```json
{
  "action": "send",
  "channel": "bluebubbles",
  "target": "+15551234567",
  "message": "来自 OpenClaw 的问候"
}
```

### 添加反应 (tapback)

```json
{
  "action": "react",
  "channel": "bluebubbles",
  "target": "+15551234567",
  "messageId": "<message-guid>",
  "emoji": "❤️"
}
```

### 移除反应

```json
{
  "action": "react",
  "channel": "bluebubbles",
  "target": "+15551234567",
  "messageId": "<message-guid>",
  "emoji": "❤️",
  "remove": true
}
```

### 编辑已发送的消息

```json
{
  "action": "edit",
  "channel": "bluebubbles",
  "target": "+15551234567",
  "messageId": "<message-guid>",
  "message": "更新后的文本"
}
```

### 撤回消息

```json
{
  "action": "unsend",
  "channel": "bluebubbles",
  "target": "+15551234567",
  "messageId": "<message-guid>"
}
```

### 回复特定消息

```json
{
  "action": "reply",
  "channel": "bluebubbles",
  "target": "+15551234567",
  "replyTo": "<message-guid>",
  "message": "回复该消息"
}
```

### 发送附件

```json
{
  "action": "sendAttachment",
  "channel": "bluebubbles",
  "target": "+15551234567",
  "path": "/tmp/photo.jpg",
  "caption": "给你这个"
}
```

### 发送带有 iMessage 特效的消息

```json
{
  "action": "sendWithEffect",
  "channel": "bluebubbles",
  "target": "+15551234567",
  "message": "大新闻",
  "effect": "balloons"
}
```

## 注意事项

- 需要网关配置 `channels.bluebubbles`（serverUrl/password/webhookPath）。
- 如果已知 `chat_guid` 目标，请优先使用（特别是对于群聊）。
- BlueBubbles 支持丰富的操作，但某些操作取决于 macOS 版本（例如，编辑功能在 macOS 26 Tahoe 上可能无法正常工作）。
- 网关可能会公开短消息 ID 和完整消息 ID；完整 ID 在重启后更持久。
- 底层插件的开发人员参考文档位于 `extensions/bluebubbles/README.md`。

## 尝试这些点子

- 使用 tapback 反应来确认收到请求。
- 当用户引用特定消息时，在线程中回复。
- 发送一个带有简短说明的文件附件。
