---
name: summarize
description: 总结或从 URL、播客和本地文件中提取文本/转录稿（“转录此 YouTube/视频”的极佳回退方案）。
homepage: https://summarize.sh
metadata:
  {
    "openclaw":
      {
        "emoji": "🧾",
        "requires": { "bins": ["summarize"] },
        "install":
          [
            {
              "id": "brew",
              "kind": "brew",
              "formula": "steipete/tap/summarize",
              "bins": ["summarize"],
              "label": "安装 summarize (brew)",
            },
          ],
      },
  }
---

# Summarize

用于总结 URL、本地文件和 YouTube 链接的快速 CLI 工具。

## 何时使用（触发短语）

当用户询问以下任何内容时，请立即使用此技能：

- “使用 summarize.sh”
- “这个链接/视频讲了什么？”
- “总结这个 URL/文章”
- “转录这个 YouTube/视频”（尽力提取转录稿；无需 `yt-dlp`）

## 快速开始

```bash
summarize "https://example.com" --model google/gemini-3-flash-preview
summarize "/path/to/file.pdf" --model google/gemini-3-flash-preview
summarize "https://youtu.be/dQw4w9WgXcQ" --youtube auto
```

## YouTube：总结对比转录稿

尽力提取转录稿（仅限 URL）：

```bash
summarize "https://youtu.be/dQw4w9WgXcQ" --youtube auto --extract-only
```

如果用户请求转录稿但内容非常庞大，请先返回一份精简总结，然后询问要展开哪个部分/时间范围。

## 模型与密钥

为所选的提供商设置 API 密钥：

- OpenAI: `OPENAI_API_KEY`
- Anthropic: `ANTHROPIC_API_KEY`
- xAI: `XAI_API_KEY`
- Google: `GEMINI_API_KEY`（别名：`GOOGLE_GENERATIVE_AI_API_KEY`, `GOOGLE_API_KEY`）

如果未设置，默认模型为 `google/gemini-3-flash-preview`。

## 常用标志

- `--length short|medium|long|xl|xxl|<chars>`
- `--max-output-tokens <count>`
- `--extract-only`（仅限 URL）
- `--json`（机器可读）
- `--firecrawl auto|off|always`（回退提取方案）
- `--youtube auto`（如果设置了 `APIFY_API_TOKEN`，则作为 Apify 回退方案）

## 配置

可选配置文件：`~/.summarize/config.json`

```json
{ "model": "openai/gpt-5.2" }
```

可选服务：

- `FIRECRAWL_API_KEY` 用于被屏蔽的站点
- `APIFY_API_TOKEN` 用于 YouTube 回退
