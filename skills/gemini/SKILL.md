---
name: gemini
description: 用于一次性问答、总结和生成的 Gemini CLI。
homepage: https://ai.google.dev/
metadata:
  {
    "openclaw":
      {
        "emoji": "♊️",
        "requires": { "bins": ["gemini"] },
        "install":
          [
            {
              "id": "brew",
              "kind": "brew",
              "formula": "gemini-cli",
              "bins": ["gemini"],
              "label": "安装 Gemini CLI (brew)",
            },
          ],
      },
  }
---

# Gemini CLI

使用 Gemini 的一次性模式（one-shot mode）并在位置参数中提供提示词（避免使用交互模式）。

快速开始

- `gemini "Answer this question..."`
- `gemini --model <name> "Prompt..."`
- `gemini --output-format json "Return JSON"`

扩展

- 列表: `gemini --list-extensions`
- 管理: `gemini extensions <command>`

注意

- 如果需要认证，请先交互式运行一次 `gemini` 并按照登录流程操作。
- 为了安全起见，避免使用 `--yolo`。
