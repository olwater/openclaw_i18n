---
name: voice-call
description: 通过 OpenClaw voice-call 插件发起语音通话。
metadata:
  {
    "openclaw":
      {
        "emoji": "📞",
        "skillKey": "voice-call",
        "requires": { "config": ["plugins.entries.voice-call.enabled"] },
      },
  }
---

# 语音通话

使用 `voice-call` 插件发起或检查通话（支持 Twilio、Telnyx、Plivo 或 mock 模拟）。

## 命令行界面 (CLI)

```bash
openclaw voicecall call --to "+15555550123" --message "来自 OpenClaw 的问候"
openclaw voicecall status --call-id <id>
```

## 工具

使用 `voice_call` 进行由 Agent 发起的通话。

### 操作：

- `initiate_call` (message, to?, mode?) - 发起通话
- `continue_call` (callId, message) - 继续通话
- `speak_to_user` (callId, message) - 对用户说话
- `end_call` (callId) - 结束通话
- `get_status` (callId) - 获取状态

## 注意事项

- 需要启用 `voice-call` 插件。
- 插件配置位于 `plugins.entries.voice-call.config`。
- Twilio 配置：`provider: "twilio"` + `twilio.accountSid/authToken` + `fromNumber`。
- Telnyx 配置：`provider: "telnyx"` + `telnyx.apiKey/connectionId` + `fromNumber`。
- Plivo 配置：`provider: "plivo"` + `plivo.authId/authToken` + `fromNumber`。
- 开发回退方案：`provider: "mock"`（无网络连接）。
