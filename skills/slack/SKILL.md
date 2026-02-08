---
name: slack
description: 当需要通过 slack 工具从 OpenClaw 控制 Slack 时使用，包括对消息添加反应，或者在 Slack 频道或私信中置顶/取消置顶项目。
metadata: { "openclaw": { "emoji": "💬", "requires": { "config": ["channels.slack"] } } }
---

# Slack 操作

## 概览

使用 `slack` 进行反应、管理置顶、发送/编辑/删除消息以及获取成员信息。该工具使用为 OpenClaw 配置的机器人令牌（bot token）。

## 需要收集的输入

- `channelId` 和 `messageId`（Slack 消息时间戳，例如 `1712023032.1234`）。
- 反应所需的 `emoji`（Unicode 或 `:名称:`）。
- 发送消息所需的 `to` 目标（`channel:<id>` 或 `user:<id>`）和 `content`（内容）。

消息上下文行包含你可以直接复用的 `slack message id` 和 `channel` 字段。

## 操作

### 操作组

| 操作组     | 默认状态 | 备注                |
| ---------- | -------- | ------------------- |
| reactions  | 启用     | 添加反应 + 列表反应 |
| messages   | 启用     | 读取/发送/编辑/删除 |
| pins       | 启用     | 置顶/取消置顶/列表  |
| memberInfo | 启用     | 成员信息            |
| emojiList  | 启用     | 自定义表情符号列表  |

### 对消息添加反应

```json
{
  "action": "react",
  "channelId": "C123",
  "messageId": "1712023032.1234",
  "emoji": "✅"
}
```

### 列出反应

```json
{
  "action": "reactions",
  "channelId": "C123",
  "messageId": "1712023032.1234"
}
```

### 发送消息

```json
{
  "action": "sendMessage",
  "to": "channel:C123",
  "content": "来自 OpenClaw 的问候"
}
```

### 编辑消息

```json
{
  "action": "editMessage",
  "channelId": "C123",
  "messageId": "1712023032.1234",
  "content": "更新后的文本"
}
```

### 删除消息

```json
{
  "action": "deleteMessage",
  "channelId": "C123",
  "messageId": "1712023032.1234"
}
```

### 读取最近消息

```json
{
  "action": "readMessages",
  "channelId": "C123",
  "limit": 20
}
```

### 置顶消息

```json
{
  "action": "pinMessage",
  "channelId": "C123",
  "messageId": "1712023032.1234"
}
```

### 取消置顶消息

```json
{
  "action": "unpinMessage",
  "channelId": "C123",
  "messageId": "1712023032.1234"
}
```

### 列出置顶项目

```json
{
  "action": "listPins",
  "channelId": "C123"
}
```

### 成员信息

```json
{
  "action": "memberInfo",
  "userId": "U123"
}
```

### 表情符号列表

```json
{
  "action": "emojiList"
}
```

## 尝试这些点子

- 使用 ✅ 反应来标记已完成的任务。
- 置顶关键决策或每周状态更新。
