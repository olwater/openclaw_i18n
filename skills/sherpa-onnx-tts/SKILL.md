---
name: sherpa-onnx-tts
description: 通过 sherpa-onnx 实现的本地文本转语音（离线，无云端）。
metadata:
  {
    "openclaw":
      {
        "emoji": "🗣️",
        "os": ["darwin", "linux", "win32"],
        "requires": { "env": ["SHERPA_ONNX_RUNTIME_DIR", "SHERPA_ONNX_MODEL_DIR"] },
        "install":
          [
            {
              "id": "download-runtime-macos",
              "kind": "download",
              "os": ["darwin"],
              "url": "https://github.com/k2-fsa/sherpa-onnx/releases/download/v1.12.23/sherpa-onnx-v1.12.23-osx-universal2-shared.tar.bz2",
              "archive": "tar.bz2",
              "extract": true,
              "stripComponents": 1,
<<<<<<< HEAD
              "targetDir": "~/.openclaw/tools/sherpa-onnx-tts/runtime",
              "label": "下载 sherpa-onnx 运行时 (macOS)",
=======
              "targetDir": "runtime",
              "label": "Download sherpa-onnx runtime (macOS)",
>>>>>>> origin/main
            },
            {
              "id": "download-runtime-linux-x64",
              "kind": "download",
              "os": ["linux"],
              "url": "https://github.com/k2-fsa/sherpa-onnx/releases/download/v1.12.23/sherpa-onnx-v1.12.23-linux-x64-shared.tar.bz2",
              "archive": "tar.bz2",
              "extract": true,
              "stripComponents": 1,
<<<<<<< HEAD
              "targetDir": "~/.openclaw/tools/sherpa-onnx-tts/runtime",
              "label": "下载 sherpa-onnx 运行时 (Linux x64)",
=======
              "targetDir": "runtime",
              "label": "Download sherpa-onnx runtime (Linux x64)",
>>>>>>> origin/main
            },
            {
              "id": "download-runtime-win-x64",
              "kind": "download",
              "os": ["win32"],
              "url": "https://github.com/k2-fsa/sherpa-onnx/releases/download/v1.12.23/sherpa-onnx-v1.12.23-win-x64-shared.tar.bz2",
              "archive": "tar.bz2",
              "extract": true,
              "stripComponents": 1,
<<<<<<< HEAD
              "targetDir": "~/.openclaw/tools/sherpa-onnx-tts/runtime",
              "label": "下载 sherpa-onnx 运行时 (Windows x64)",
=======
              "targetDir": "runtime",
              "label": "Download sherpa-onnx runtime (Windows x64)",
>>>>>>> origin/main
            },
            {
              "id": "download-model-lessac",
              "kind": "download",
              "url": "https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-en_US-lessac-high.tar.bz2",
              "archive": "tar.bz2",
              "extract": true,
<<<<<<< HEAD
              "targetDir": "~/.openclaw/tools/sherpa-onnx-tts/models",
              "label": "下载 Piper en_US lessac (high)",
=======
              "targetDir": "models",
              "label": "Download Piper en_US lessac (high)",
>>>>>>> origin/main
            },
          ],
      },
  }
---

# sherpa-onnx-tts

使用 sherpa-onnx 离线 CLI 实现的本地文本转语音（TTS）。

## 安装

1. 下载适用于你操作系统的运行时（解压到 `~/.openclaw/tools/sherpa-onnx-tts/runtime`）
2. 下载语音模型（解压到 `~/.openclaw/tools/sherpa-onnx-tts/models`）

更新 `~/.openclaw/openclaw.json`：

```json5
{
  skills: {
    entries: {
      "sherpa-onnx-tts": {
        env: {
          SHERPA_ONNX_RUNTIME_DIR: "~/.openclaw/tools/sherpa-onnx-tts/runtime",
          SHERPA_ONNX_MODEL_DIR: "~/.openclaw/tools/sherpa-onnx-tts/models/vits-piper-en_US-lessac-high",
        },
      },
    },
  },
}
```

封装程序位于此技能文件夹中。可以直接运行它，或者将封装程序添加到 PATH：

```bash
export PATH="{baseDir}/bin:$PATH"
```

## 用法

```bash
{baseDir}/bin/sherpa-onnx-tts -o ./tts.wav "这是一条来自本地 TTS 的消息。"
```

注意事项：

- 如果你想要另一种声音，请从 sherpa-onnx 的 `tts-models` 发布页面选择不同的模型。
- 如果模型目录中有多个 `.onnx` 文件，请设置 `SHERPA_ONNX_MODEL_FILE` 或传递 `--model-file`。
- 你也可以传递 `--tokens-file` 或 `--data-dir` 来覆盖默认值。
- Windows 用户：请运行 `node {baseDir}\\bin\\sherpa-onnx-tts -o tts.wav "这是一条来自本地 TTS 的消息。"`
