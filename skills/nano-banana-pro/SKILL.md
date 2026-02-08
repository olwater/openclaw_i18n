---
name: nano-banana-pro
description: 使用 Gemini 3 Pro Image (Nano Banana Pro) 生成或编辑图像。
homepage: https://ai.google.dev/
metadata:
  {
    "openclaw":
      {
        "emoji": "🍌",
        "requires": { "bins": ["uv"], "env": ["GEMINI_API_KEY"] },
        "primaryEnv": "GEMINI_API_KEY",
        "install":
          [
            {
              "id": "uv-brew",
              "kind": "brew",
              "formula": "uv",
              "bins": ["uv"],
              "label": "安装 uv (brew)",
            },
          ],
      },
  }
---

# Nano Banana Pro (Gemini 3 Pro 图像)

使用内置脚本生成或编辑图像。

## 生成

```bash
uv run {baseDir}/scripts/generate_image.py --prompt "你的图像描述" --filename "output.png" --resolution 1K
```

## 编辑（单张图像）

```bash
uv run {baseDir}/scripts/generate_image.py --prompt "编辑指令" --filename "output.png" -i "/path/in.png" --resolution 2K
```

## 多图合成（最多支持 14 张图像）

```bash
uv run {baseDir}/scripts/generate_image.py --prompt "将这些组合成一个场景" --filename "output.png" -i img1.png -i img2.png -i img3.png
```

## API 密钥

- 环境变量：`GEMINI_API_KEY`
- 或在 `~/.openclaw/openclaw.json` 中设置 `skills."nano-banana-pro".apiKey` / `skills."nano-banana-pro".env.GEMINI_API_KEY`

## 注意事项

- 分辨率：`1K` (默认), `2K`, `4K`。
- 文件名建议使用时间戳：`yyyy-mm-dd-hh-mm-ss-name.png`。
- 脚本会打印 `MEDIA:` 行，OpenClaw 会在支持的聊天平台上自动附件。
- 不要读取图像内容；仅需报告保存路径。
