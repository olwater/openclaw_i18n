---
name: openai-whisper
description: 使用 Whisper CLI 进行本地语音转文本（无需 API 密钥）。
homepage: https://openai.com/research/whisper
metadata:
  {
    "openclaw":
      {
        "emoji": "🎙️",
        "requires": { "bins": ["whisper"] },
        "install":
          [
            {
              "id": "brew",
              "kind": "brew",
              "formula": "openai-whisper",
              "bins": ["whisper"],
              "label": "安装 OpenAI Whisper (brew)",
            },
          ],
      },
  }
---

# Whisper (CLI)

使用 `whisper` 进行本地音频转写。

## 快速开始

- `whisper /path/audio.mp3 --model medium --output_format txt --output_dir .`
- `whisper /path/audio.m4a --task translate --output_format srt`

## 注意事项

- 模型在首次运行时会下载到 `~/.cache/whisper`。
- 在此安装中，`--model` 默认为 `turbo`。
- 追求速度请使用较小模型，追求准确性请使用较大模型。
