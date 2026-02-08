---
name: openai-whisper-api
description: 通过 OpenAI Audio Transcriptions API (Whisper) 转录音频。
homepage: https://platform.openai.com/docs/guides/speech-to-text
metadata:
  {
    "openclaw":
      {
        "emoji": "☁️",
        "requires": { "bins": ["curl"], "env": ["OPENAI_API_KEY"] },
        "primaryEnv": "OPENAI_API_KEY",
      },
  }
---

# OpenAI Whisper API (curl)

通过 OpenAI 的 `/v1/audio/transcriptions` 端点转录音频文件。

## 快速开始

```bash
{baseDir}/scripts/transcribe.sh /path/to/audio.m4a
```

默认值：

- 模型：`whisper-1`
- 输出：`<输入文件名>.txt`

## 常用标志

```bash
{baseDir}/scripts/transcribe.sh /path/to/audio.ogg --model whisper-1 --out /tmp/transcript.txt
{baseDir}/scripts/transcribe.sh /path/to/audio.m4a --language zh
{baseDir}/scripts/transcribe.sh /path/to/audio.m4a --prompt "发言人姓名：Peter, Daniel"
{baseDir}/scripts/transcribe.sh /path/to/audio.m4a --json --out /tmp/transcript.json
```

## API 密钥

设置 `OPENAI_API_KEY`，或者在 `~/.openclaw/openclaw.json` 中进行配置：

```json5
{
  skills: {
    "openai-whisper-api": {
      apiKey: "在此输入 OpenAI 密钥",
    },
  },
}
```
