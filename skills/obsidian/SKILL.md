---
name: obsidian
description: 操作 Obsidian 库（纯 Markdown 笔记）并通过 obsidian-cli 进行自动化。
homepage: https://help.obsidian.md
metadata:
  {
    "openclaw":
      {
        "emoji": "💎",
        "requires": { "bins": ["obsidian-cli"] },
        "install":
          [
            {
              "id": "brew",
              "kind": "brew",
              "formula": "yakitrak/yakitrak/obsidian-cli",
              "bins": ["obsidian-cli"],
              "label": "安装 obsidian-cli (brew)",
            },
          ],
      },
  }
---

# Obsidian

Obsidian 库 = 磁盘上的一个普通文件夹。

## 库结构（典型）

- **笔记**：`*.md`（纯文本 Markdown；可用任何编辑器编辑）
- **配置**：`.obsidian/`（工作区和插件设置；通常不建议通过脚本修改）
- **画布**：`*.canvas` (JSON)
- **附件**：你在 Obsidian 设置中选择的任何文件夹（图像/PDF 等）

## 查找当前活动的库

Obsidian 桌面端在这里跟踪库（事实来源）：

- `~/Library/Application Support/obsidian/obsidian.json`

`obsidian-cli` 从该文件中解析库信息；库名称通常是**文件夹名称**（路径后缀）。

### 快速查询“哪个库是活动的 / 笔记在哪里？”

- 如果你已经设置了默认库：`obsidian-cli print-default --path-only`
- 否则，读取 `~/Library/Application Support/obsidian/obsidian.json` 并查找 `"open": true` 的库条目。

## 注意事项

- 存在多个库是很常见的情况（iCloud vs `~/Documents`、工作/个人等）。不要靠猜，请读取配置。
- 避免在脚本中硬编码库路径；优先选择读取配置或使用 `print-default`。

## obsidian-cli 快速开始

选择默认库（仅需一次）：

- `obsidian-cli set-default "<库文件夹名称>"`
- `obsidian-cli print-default` / `obsidian-cli print-default --path-only`

### 搜索

- `obsidian-cli search "查询内容"`（搜索笔记名称）
- `obsidian-cli search-content "查询内容"`（搜索笔记内容；显示片段和行号）

### 创建

- `obsidian-cli create "文件夹/新笔记" --content "内容..." --open`
- 需要 Obsidian URI 处理器 (`obsidian://…`) 正常工作（即已安装 Obsidian）。
- 避免通过 URI 在“隐藏”的点文件夹（如 `.something/...`）下创建笔记；Obsidian 可能会拒绝。

### 移动/重命名（安全重构）

- `obsidian-cli move "原/路径/笔记" "新/路径/笔记"`
- 这会更新整个库中的 `[[维基链接]]`（wikilinks）和常见的 Markdown 链接（这是对比普通 `mv` 命令的主要优势）。

### 删除

- `obsidian-cli delete "路径/笔记"`

在合适的情况下优先直接编辑：打开 `.md` 文件并修改，Obsidian 会自动检测到更改。
