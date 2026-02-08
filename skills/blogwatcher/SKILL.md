---
name: blogwatcher
description: 使用 blogwatcher CLI 监控博客和 RSS/Atom 订阅源的更新。
homepage: https://github.com/Hyaxia/blogwatcher
metadata:
  {
    "openclaw":
      {
        "emoji": "📰",
        "requires": { "bins": ["blogwatcher"] },
        "install":
          [
            {
              "id": "go",
              "kind": "go",
              "module": "github.com/Hyaxia/blogwatcher/cmd/blogwatcher@latest",
              "bins": ["blogwatcher"],
              "label": "安装 blogwatcher (go)",
            },
          ],
      },
  }
---

# blogwatcher

使用 `blogwatcher` CLI 追踪博客和 RSS/Atom 订阅源的更新。

## 安装

- Go: `go install github.com/Hyaxia/blogwatcher/cmd/blogwatcher@latest`

## 快速开始

- `blogwatcher --help`

## 常用命令

- 添加博客：`blogwatcher add "My Blog" https://example.com`
- 列出博客：`blogwatcher blogs`
- 扫描更新：`blogwatcher scan`
- 列出文章：`blogwatcher articles`
- 标记文章为已读：`blogwatcher read 1`
- 标记所有文章为已读：`blogwatcher read-all`
- 移除博客：`blogwatcher remove "My Blog"`

## 输出示例

```
$ blogwatcher blogs
Tracked blogs (1):

  xkcd
    URL: https://xkcd.com
```

```
$ blogwatcher scan
Scanning 1 blog(s)...

  xkcd
    Source: RSS | Found: 4 | New: 4

Found 4 new article(s) total!
```

## 注意事项

- 使用 `blogwatcher <command> --help` 来查看标志和选项。
