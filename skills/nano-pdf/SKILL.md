---
name: nano-pdf
description: 使用 nano-pdf CLI 通过自然语言指令编辑 PDF。
homepage: https://pypi.org/project/nano-pdf/
metadata:
  {
    "openclaw":
      {
        "emoji": "📄",
        "requires": { "bins": ["nano-pdf"] },
        "install":
          [
            {
              "id": "uv",
              "kind": "uv",
              "package": "nano-pdf",
              "bins": ["nano-pdf"],
              "label": "安装 nano-pdf (uv)",
            },
          ],
      },
  }
---

# nano-pdf

使用 `nano-pdf` 并通过自然语言指令对 PDF 中的特定页面进行编辑。

## 快速开始

```bash
nano-pdf edit deck.pdf 1 "Change the title to 'Q3 Results' and fix the typo in the subtitle"
```

注意：

- 页码是基于 0 还是基于 1 取决于工具的版本/配置；如果结果看起来偏差了 1 页，请尝试另一个。
- 在发送输出 PDF 之前，务必进行健全性检查。
