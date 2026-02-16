---
name: discord
<<<<<<< HEAD
description: 通过 discord 工具控制 Discord：发送消息、添加反应、管理贴纸/表情、发起投票、管理线程/置顶/搜索、管理频道/类别、获取成员/角色/频道信息、设置机器人状态或执行管理操作。
metadata: { "openclaw": { "emoji": "🎮", "requires": { "config": ["channels.discord"] } } }
---

# Discord 操作

## 概览

使用 `discord` 来管理消息、反应、线程、投票和管理操作。你可以通过 `discord.actions.*` 禁用某些操作组（除了角色/管理操作外，默认均为启用状态）。该工具使用为 OpenClaw 配置的机器人令牌（bot token）。

## 需要收集的输入

- **反应（Reaction）**：需要 `channelId`、`messageId` 和一个 `emoji`。
- **获取消息（fetchMessage）**：需要 `guildId`、`channelId`、`messageId`，或者类似 `https://discord.com/channels/<guildId>/<channelId>/<messageId>` 的 `messageLink`。
- **贴纸/投票/发送消息**：需要一个 `to` 目标（`channel:<id>` 或 `user:<id>`）。可选 `content` 文本。
- **投票（Poll）**：还需要一个 `question`（问题）以及 2-10 个 `answers`（选项）。
- **媒体文件**：`mediaUrl` 支持本地文件的 `file:///path` 或远程文件的 `https://...`。
- **上传表情符号**：需要 `guildId`、`name`、`mediaUrl`，可选 `roleIds`（限制 256KB，PNG/JPG/GIF）。
- **上传贴纸**：需要 `guildId`、`name`、`description`、`tags`、`mediaUrl`（限制 512KB，PNG/APNG/Lottie JSON）。

消息上下文行包含你可以直接复用的 `discord message id` 和 `channel` 字段。

**注意：** `sendMessage` 使用 `to: "channel:<id>"` 格式，而不是 `channelId`。其他操作如 `react`、`readMessages`、`editMessage` 则直接使用 `channelId`。
**注意：** `fetchMessage` 接受消息 ID 或完整链接，如 `https://discord.com/channels/<guildId>/<channelId>/<messageId>`。

## 操作

### 对消息添加反应
=======
description: "Discord ops via the message tool (channel=discord)."
metadata: { "openclaw": { "emoji": "🎮", "requires": { "config": ["channels.discord.token"] } } }
allowed-tools: ["message"]
---

# Discord (Via `message`)

Use the `message` tool. No provider-specific `discord` tool exposed to the agent.

## Musts

- Always: `channel: "discord"`.
- Respect gating: `channels.discord.actions.*` (some default off: `roles`, `moderation`, `presence`, `channels`).
- Prefer explicit ids: `guildId`, `channelId`, `messageId`, `userId`.
- Multi-account: optional `accountId`.

## Guidelines

- Avoid Markdown tables in outbound Discord messages.
- Mention users as `<@USER_ID>`.
- Prefer Discord components v2 (`components`) for rich UI; use legacy `embeds` only when you must.

## Targets

- Send-like actions: `to: "channel:<id>"` or `to: "user:<id>"`.
- Message-specific actions: `channelId: "<id>"` (or `to`) + `messageId: "<id>"`.

## Common Actions (Examples)

Send message:

```json
{
  "action": "send",
  "channel": "discord",
  "to": "channel:123",
  "message": "hello",
  "silent": true
}
```

Send with media:

```json
{
  "action": "send",
  "channel": "discord",
  "to": "channel:123",
  "message": "see attachment",
  "media": "file:///tmp/example.png"
}
```

- Optional `silent: true` to suppress Discord notifications.

Send with components v2 (recommended for rich UI):

```json
{
  "action": "send",
  "channel": "discord",
  "to": "channel:123",
  "message": "Status update",
  "components": "[Carbon v2 components]"
}
```

- `components` expects Carbon component instances (Container, TextDisplay, etc.) from JS/TS integrations.
- Do not combine `components` with `embeds` (Discord rejects v2 + embeds).

Legacy embeds (not recommended):

```json
{
  "action": "send",
  "channel": "discord",
  "to": "channel:123",
  "message": "Status update",
  "embeds": [{ "title": "Legacy", "description": "Embeds are legacy." }]
}
```

- `embeds` are ignored when components v2 are present.

React:
>>>>>>> origin/main

```json
{
  "action": "react",
  "channel": "discord",
  "channelId": "123",
  "messageId": "456",
  "emoji": "✅"
}
```

<<<<<<< HEAD
### 列出反应和用户

```json
{
  "action": "reactions",
  "channelId": "123",
  "messageId": "456",
  "limit": 100
}
```

### 发送贴纸

```json
{
  "action": "sticker",
  "to": "channel:123",
  "stickerIds": ["9876543210"],
  "content": "做的不错！"
}
```

- 每条消息最多支持 3 个贴纸 ID。
- `to` 可以是 `user:<id>` 以发送私信。

### 上传自定义表情符号

```json
{
  "action": "emojiUpload",
  "guildId": "999",
  "name": "party_blob",
  "mediaUrl": "file:///tmp/party.png",
  "roleIds": ["222"]
}
```

- 表情符号图像必须为 PNG/JPG/GIF 且 <= 256KB。
- `roleIds` 是可选的；省略则使该表情符号对所有人可用。

### 上传贴纸

```json
{
  "action": "stickerUpload",
  "guildId": "999",
  "name": "openclaw_wave",
  "description": "OpenClaw 挥手问好",
  "tags": "👋",
  "mediaUrl": "file:///tmp/wave.png"
}
```

- 贴纸需要 `name`、`description` 和 `tags`。
- 上传的文件必须为 PNG/APNG/Lottie JSON 且 <= 512KB。

### 创建投票

```json
{
  "action": "poll",
  "to": "channel:123",
  "question": "午饭吃什么？",
  "answers": ["披萨", "寿司", "沙拉"],
  "allowMultiselect": false,
  "durationHours": 24,
  "content": "快来投票"
}
```

- `durationHours` 默认为 24；最大 32 天（768 小时）。

### 检查机器人在频道中的权限

```json
{
  "action": "permissions",
  "channelId": "123"
}
```

## 尝试这些点子

- 使用 ✅/⚠️ 来标记状态更新。
- 针对发布决策或会议时间发起快速投票。
- 在成功部署后发送庆祝贴纸。
- 在发布时刻上传新的表情符号/贴纸。
- 在团队频道中运行每周“优先级检查”投票。
- 在用户请求完成后，通过私信发送贴纸以示确认。

## 操作门控

使用 `discord.actions.*` 禁用操作组：

- `reactions`（添加反应 + 反应列表 + 表情符号列表）
- `stickers`、`polls`、`permissions`、`messages`、`threads`、`pins`、`search`
- `emojiUploads`、`stickerUploads`
- `memberInfo`、`roleInfo`、`channelInfo`、`voiceStatus`、`events`
- `roles`（角色添加/移除，默认 `false`）
- `channels`（频道/类别创建/编辑/删除/移动，默认 `false`）
- `moderation`（禁言/踢出/封禁，默认 `false`）
- `presence`（机器人状态/活动，默认 `false`）

### 读取最近消息

```json
{
  "action": "readMessages",
  "channelId": "123",
=======
Read:

```json
{
  "action": "read",
  "channel": "discord",
  "to": "channel:123",
>>>>>>> origin/main
  "limit": 20
}
```

<<<<<<< HEAD
### 获取单条消息

```json
{
  "action": "fetchMessage",
  "guildId": "999",
  "channelId": "123",
  "messageId": "456"
}
```

```json
{
  "action": "fetchMessage",
  "messageLink": "https://discord.com/channels/999/123/456"
}
```

### 发送/编辑/删除消息

```json
{
  "action": "sendMessage",
  "to": "channel:123",
  "content": "来自 OpenClaw 的问候"
}
```

**带有媒体附件：**

```json
{
  "action": "sendMessage",
  "to": "channel:123",
  "content": "听听这段音频！",
  "mediaUrl": "file:///tmp/audio.mp3"
}
```

- `to` 使用格式 `channel:<id>` 或 `user:<id>` 发送私信（**不是** `channelId`！）。
- `mediaUrl` 支持本地文件（`file:///path/to/file`）和远程 URL（`https://...`）。
- 可选 `replyTo` 配合消息 ID 来回复特定消息。

```json
{
  "action": "editMessage",
  "channelId": "123",
  "messageId": "456",
  "content": "修正了错别字"
=======
Edit / delete:

```json
{
  "action": "edit",
  "channel": "discord",
  "channelId": "123",
  "messageId": "456",
  "message": "fixed typo"
>>>>>>> origin/main
}
```

```json
{
  "action": "delete",
  "channel": "discord",
  "channelId": "123",
  "messageId": "456"
}
```

<<<<<<< HEAD
### 线程（Thread）

```json
{
  "action": "threadCreate",
  "channelId": "123",
  "name": "Bug 分选",
  "messageId": "456"
=======
Poll:

```json
{
  "action": "poll",
  "channel": "discord",
  "to": "channel:123",
  "pollQuestion": "Lunch?",
  "pollOption": ["Pizza", "Sushi", "Salad"],
  "pollMulti": false,
  "pollDurationHours": 24
>>>>>>> origin/main
}
```

Pins:

```json
{
<<<<<<< HEAD
  "action": "threadReply",
  "channelId": "777",
  "content": "在线程中回复"
}
```

### 置顶（Pin）

```json
{
  "action": "pinMessage",
=======
  "action": "pin",
  "channel": "discord",
>>>>>>> origin/main
  "channelId": "123",
  "messageId": "456"
}
```

Threads:

```json
{
  "action": "thread-create",
  "channel": "discord",
  "channelId": "123",
  "messageId": "456",
  "threadName": "bug triage"
}
```

<<<<<<< HEAD
### 搜索消息
=======
Search:
>>>>>>> origin/main

```json
{
  "action": "search",
  "channel": "discord",
  "guildId": "999",
<<<<<<< HEAD
  "content": "发布说明",
=======
  "query": "release notes",
>>>>>>> origin/main
  "channelIds": ["123", "456"],
  "limit": 10
}
```

<<<<<<< HEAD
### 成员和角色信息

```json
{
  "action": "memberInfo",
  "guildId": "999",
  "userId": "111"
}
```

```json
{
  "action": "roleInfo",
  "guildId": "999"
}
```

### 列出可用的自定义表情符号

```json
{
  "action": "emojiList",
  "guildId": "999"
}
```

### 角色变更（默认禁用）

```json
{
  "action": "roleAdd",
  "guildId": "999",
  "userId": "111",
  "roleId": "222"
}
```

### 频道信息

```json
{
  "action": "channelInfo",
  "channelId": "123"
}
```

```json
{
  "action": "channelList",
  "guildId": "999"
}
```

### 频道管理（默认禁用）

创建、编辑、删除和移动频道与类别。通过 `discord.actions.channels: true` 启用。

**创建文本频道：**

```json
{
  "action": "channelCreate",
  "guildId": "999",
  "name": "综合聊天",
  "type": 0,
  "parentId": "888",
  "topic": "综合讨论"
}
```

- `type`: Discord 频道类型整数（0 = 文本, 2 = 语音, 4 = 类别；支持其他值）。
- `parentId`: 所属类别的 ID（可选）。
- `topic`、`position`、`nsfw`: 可选。

**创建类别：**

```json
{
  "action": "categoryCreate",
  "guildId": "999",
  "name": "项目"
}
```

**编辑频道：**

```json
{
  "action": "channelEdit",
  "channelId": "123",
  "name": "新名称",
  "topic": "更新后的主题"
}
```

- 支持 `name`、`topic`、`position`、`parentId`（设为 null 则移出类别）、`nsfw`、`rateLimitPerUser`。

**移动频道：**

```json
{
  "action": "channelMove",
  "guildId": "999",
  "channelId": "123",
  "parentId": "888",
  "position": 2
}
```

- `parentId`: 目标类别（设为 null 则移动到顶层）。

**删除频道：**

```json
{
  "action": "channelDelete",
  "channelId": "123"
}
```

**编辑/删除类别：**

```json
{
  "action": "categoryEdit",
  "categoryId": "888",
  "name": "重命名后的类别"
}
```

```json
{
  "action": "categoryDelete",
  "categoryId": "888"
}
```

### 语音状态

```json
{
  "action": "voiceStatus",
  "guildId": "999",
  "userId": "111"
}
```

### 计划活动

```json
{
  "action": "eventList",
  "guildId": "999"
}
```

### 管理操作（默认禁用）

```json
{
  "action": "timeout",
  "guildId": "999",
  "userId": "111",
  "durationMinutes": 10
}
```

### 机器人状态/活动（默认禁用）

设置机器人的在线状态和活动。通过 `discord.actions.presence: true` 启用。

Discord 机器人只能设置活动的 `name`、`state`、`type` 和 `url`。其他活动字段（details、emoji、assets）虽然会被网关接受，但会被 Discord 忽略。

**各活动类型的渲染方式：**

- **playing, streaming, listening, watching, competing**: `activityName` 显示在侧边栏机器人名称下方（例如：类型为 "playing"、名称为 "with fire" 时，显示为 "**with fire**"）。`activityState` 显示在个人资料弹出层中。
- **custom**: `activityName` 被忽略。只有 `activityState` 会作为侧边栏的状态文本显示。
- **streaming**: `activityUrl` 可能会被客户端显示或嵌入。

**设置“正在玩”状态：**

```json
{
  "action": "setPresence",
=======
Presence (often gated):

```json
{
  "action": "set-presence",
  "channel": "discord",
>>>>>>> origin/main
  "activityType": "playing",
  "activityName": "with fire",
  "status": "online"
}
```

<<<<<<< HEAD
侧边栏结果："**with fire**"。弹出层显示："Playing: with fire"。

**带有状态（显示在弹出层）：**

```json
{
  "action": "setPresence",
  "activityType": "playing",
  "activityName": "My Game",
  "activityState": "在大厅中"
}
```

侧边栏结果："**My Game**"。弹出层显示："Playing: My Game (换行) 在大厅中"。

**设置“正在直播”（可选 URL，机器人可能不渲染）：**

```json
{
  "action": "setPresence",
  "activityType": "streaming",
  "activityName": "现场编程",
  "activityUrl": "https://twitch.tv/example"
}
```

**设置“正在听/看”：**

```json
{
  "action": "setPresence",
  "activityType": "listening",
  "activityName": "Spotify"
}
```

```json
{
  "action": "setPresence",
  "activityType": "watching",
  "activityName": "日志"
}
```

**设置自定义状态（侧边栏文本）：**

```json
{
  "action": "setPresence",
  "activityType": "custom",
  "activityState": "放空中"
}
```

侧边栏结果："放空中"。注意：对于 `custom` 类型，`activityName` 会被忽略。

**仅设置机器人状态（无活动/清除状态）：**

```json
{
  "action": "setPresence",
  "status": "dnd"
}
```

**参数：**

- `activityType`: `playing`, `streaming`, `listening`, `watching`, `competing`, `custom`
- `activityName`: 非 custom 类型在侧边栏显示的文本（对于 `custom` 则忽略）
- `activityUrl`: 直播类型的 Twitch 或 YouTube URL（可选；机器人可能不渲染）
- `activityState`: 对于 `custom` 是状态文本；对于其他类型则显示在个人资料弹出层中
- `status`: `online` (默认), `dnd`, `idle`, `invisible`

## Discord 编写风格指南

**保持对话感！** Discord 是一个聊天平台，不是文档。

### 建议

- 消息短小精悍（理想情况下 1-3 句）。
- 多次快速回复 > 一大堆长篇大论。
- 使用表情符号来表达语气/重点 🦞。
- 全小写的随意风格也没问题。
- 将信息拆分为易于消化的片段。
- 匹配对话的氛围。

### 不建议

- **不要使用 Markdown 表格**（Discord 会将其渲染为丑陋的原始 `| text |`）。
- **不要在随意聊天中使用 `## 标题`**（使用 **加粗** 或大写来表示强调）。
- 避免写好几段的长文。
- 不要过度解释简单的事情。
- 省掉“我很乐意为您提供帮助！”之类的废话。

### 行之有效的格式

- **加粗** 表示强调。
- `代码块` 表示技术术语。
- 列表 表示多个项目。
- `> 引用` 表示参考。
- 将多个链接包裹在 `<>` 中以抑制预览图。

### 示例转换

❌ 差：

```
我很乐意为您提供帮助！这里是可用版本策略的全面概览：

## 语义化版本 (Semantic Versioning)
Semver 使用主版本号.次版本号.修订号格式，其中...

## 日历化版本 (Calendar Versioning)
CalVer 使用基于日期的版本，如...
```

✅ 好：

```
版本选项：semver (1.2.3)、calver (2026.01.04) 或者干脆 yolo (永远 `latest`)。哪种适合你的发布节奏？
```
=======
## Writing Style (Discord)

- Short, conversational, low ceremony.
- No markdown tables.
- Mention users as `<@USER_ID>`.
>>>>>>> origin/main
