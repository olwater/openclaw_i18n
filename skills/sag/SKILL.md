---
name: sag
description: 具有 Mac 风格 say 用户体验的 ElevenLabs 文本转语音。
homepage: https://sag.sh
metadata:
  {
    "openclaw":
      {
        "emoji": "🗣️",
        "requires": { "bins": ["sag"], "env": ["ELEVENLABS_API_KEY"] },
        "primaryEnv": "ELEVENLABS_API_KEY",
        "install":
          [
            {
              "id": "brew",
              "kind": "brew",
              "formula": "steipete/tap/sag",
              "bins": ["sag"],
              "label": "安装 sag (brew)",
            },
          ],
      },
  }
---

# sag

使用 `sag` 通过 ElevenLabs 进行 TTS 并支持本地播放。

## API 密钥（必需）

- `ELEVENLABS_API_KEY`（首选）
- CLI 也支持 `SAG_API_KEY`

## 快速开始

- `sag "你好"`
- `sag speak -v "Roger" "Hello"`
- `sag voices`
- `sag prompting`（特定模型的提示词技巧）

## 模型说明

- 默认：`eleven_v3`（表现力强）
- 稳定：`eleven_multilingual_v2`
- 快速：`eleven_flash_v2_5`

## 发音 + 交付规则

- 首选修正：拼写替换（例如 "key-note"）、添加连字符、调整大小写。
- 数字/单位/URL：使用 `--normalize auto`（如果对名称有副作用，则使用 `off`）。
- 语言偏好：使用 `--lang en|de|fr|...` 指导规范化。
- v3：不支持 SSML `<break>`；请使用 `[pause]`、`[short pause]`、`[long pause]`。
- v2/v2.5：支持 SSML `<break time="1.5s" />`；`sag` 未公开 `<phoneme>`。

## v3 音效标签（放在行首）

- `[whispers]` (低语), `[shouts]` (喊叫), `[sings]` (唱歌)
- `[laughs]` (笑), `[starts laughing]` (开始大笑), `[sighs]` (叹气), `[exhales]` (呼气)
- `[sarcastic]` (讽刺), `[curious]` (好奇), `[excited]` (兴奋), `[crying]` (哭泣), `[mischievously]` (调皮地)
- 示例：`sag "[whispers] 请保持安静。[short pause] 好吗？"`

## 语音默认值

- `ELEVENLABS_VOICE_ID` 或 `SAG_VOICE_ID`

在进行长文本输出前，请先确认语音和播放设备。

## 聊天语音回复

当 Peter 要求通过“语音”回复时（例如，“疯狂科学家声音”、“用语音解释”），请生成音频并发送：

```bash
# 生成音频文件
sag -v Clawd -o /tmp/voice-reply.mp3 "这里是你的消息"

# 然后在回复中包含：
# MEDIA:/tmp/voice-reply.mp3
```

语音角色建议：

- **疯狂科学家**：使用 `[excited]` 标签，加入戏剧性停顿 `[short pause]`，并改变语调强度。
- **冷静**：使用 `[whispers]` 或较慢的节奏。
- **戏剧性**：适度使用 `[sings]` 或 `[shouts]`。

Clawd 的默认语音：`lj2rcrvANS3gaWWnczSX`（或直接使用 `-v Clawd`）
