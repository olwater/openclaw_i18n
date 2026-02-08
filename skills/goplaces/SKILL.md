---
name: goplaces
description: 通过 goplaces CLI 查询 Google Places API (New)，进行文本搜索、地点详情、地点解析和评论查询。适用于人工友好的地点查找或脚本的 JSON 输出。
homepage: https://github.com/steipete/goplaces
metadata:
  {
    "openclaw":
      {
        "emoji": "📍",
        "requires": { "bins": ["goplaces"], "env": ["GOOGLE_PLACES_API_KEY"] },
        "primaryEnv": "GOOGLE_PLACES_API_KEY",
        "install":
          [
            {
              "id": "brew",
              "kind": "brew",
              "formula": "steipete/tap/goplaces",
              "bins": ["goplaces"],
              "label": "安装 goplaces (brew)",
            },
          ],
      },
  }
---

# goplaces

现代化的 Google Places API (New) CLI 工具。默认输出人工友好的格式，脚本请使用 `--json`。

## 安装

- Homebrew: `brew install steipete/tap/goplaces`

## 配置

- 需要设置 `GOOGLE_PLACES_API_KEY`。
- 可选：设置 `GOOGLE_PLACES_BASE_URL` 用于测试/代理。

## 常用命令

- 搜索：`goplaces search "咖啡" --open-now --min-rating 4 --limit 5`
- 偏好设置（Bias）：`goplaces search "披萨" --lat 40.8 --lng -73.9 --radius-m 3000`
- 分页：`goplaces search "披萨" --page-token "NEXT_PAGE_TOKEN"`
- 地点解析（Resolve）：`goplaces resolve "伦敦 Soho 区" --limit 5`
- 详情：`goplaces details <place_id> --reviews`
- JSON 输出：`goplaces search "寿司" --json`

## 注意事项

- `--no-color` 或 `NO_COLOR` 可禁用 ANSI 颜色。
- 价格等级：0..4（免费 → 非常昂贵）。
- 类型过滤器仅发送第一个 `--type` 值（API 仅接受一个）。
