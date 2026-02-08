---
name: things-mac
description: 在 macOS 上通过 `things` CLI 管理 Things 3（通过 URL scheme 添加/更新项目和待办事项；从本地 Things 数据库读取/搜索/列出）。当用户要求 OpenClaw 向 Things 添加任务、列出收件箱/今天/即将到来、搜索任务或检查项目/区域/标签时使用。
homepage: https://github.com/ossianhempel/things3-cli
metadata:
  {
    "openclaw":
      {
        "emoji": "✅",
        "os": ["darwin"],
        "requires": { "bins": ["things"] },
        "install":
          [
            {
              "id": "go",
              "kind": "go",
              "module": "github.com/ossianhempel/things3-cli/cmd/things@latest",
              "bins": ["things"],
              "label": "安装 things3-cli (go)",
            },
          ],
      },
  }
---

# Things 3 CLI

使用 `things` 读取你的本地 Things 数据库（收件箱/今天/搜索/项目/区域/标签），并通过 Things 的 URL scheme 添加/更新待办事项。

## 设置

- 安装（推荐 Apple Silicon）：`GOBIN=/opt/homebrew/bin go install github.com/ossianhempel/things3-cli/cmd/things@latest`
- 如果数据库读取失败：为调用方应用授予**完全磁盘访问权限（Full Disk Access）**（手动运行时为终端；通过网关运行时为 `OpenClaw.app`）。
- 可选：设置 `THINGSDB`（或传递 `--db`）指向你的 `ThingsData-*` 文件夹。
- 可选：设置 `THINGS_AUTH_TOKEN` 以在更新操作时避免传递 `--auth-token`。

## 只读操作 (数据库)

- `things inbox --limit 50`
- `things today`
- `things upcoming`
- `things search "查询内容"`
- `things projects` / `things areas` / `things tags`

## 写入操作 (URL Scheme)

- 优先使用安全预览：`things --dry-run add "标题"`
- 添加：`things add "标题" --notes "备注" --when today --deadline 2026-01-02`
- 将 Things 切换到前台：`things --foreground add "标题"`

### 示例：添加待办事项

- 基础添加：`things add "买牛奶"`
- 带备注：`things add "买牛奶" --notes "2% 脂肪含量 + 香蕉"`
- 添加到项目/区域：`things add "订机票" --list "旅行"`
- 添加到项目标题下：`things add "带充电器" --list "旅行" --heading "出发前"`
- 带标签：`things add "预约牙医" --tags "健康,电话"`
- 检查清单：`things add "旅行准备" --checklist-item "护照" --checklist-item "机票"`
- 从标准输入添加（多行 => 标题 + 备注）：
  - `cat <<'EOF' | things add -`
  - `标题行`
  - `备注行 1`
  - `备注行 2`
  - `EOF`

### 示例：修改待办事项（需要认证令牌）

- 第一步：获取 ID（UUID 列）：`things search "牛奶" --limit 5`
- 认证：设置 `THINGS_AUTH_TOKEN` 或传递 `--auth-token <TOKEN>`
- 修改标题：`things update --id <UUID> --auth-token <TOKEN> "新标题"`
- 替换备注：`things update --id <UUID> --auth-token <TOKEN> --notes "新备注"`
- 追加/前置备注：`things update --id <UUID> --auth-token <TOKEN> --append-notes "..."` / `--prepend-notes "..."`
- 移动列表：`things update --id <UUID> --auth-token <TOKEN> --list "旅行" --heading "出发前"`
- 替换/添加标签：`things update --id <UUID> --auth-token <TOKEN> --tags "a,b"` / `things update --id <UUID> --auth-token <TOKEN> --add-tags "a,b"`
- 完成/取消（类似于软删除）：`things update --id <UUID> --auth-token <TOKEN> --completed` / `--canceled`
- 安全预览：`things --dry-run update --id <UUID> --auth-token <TOKEN> --completed`

### 删除待办事项？

- 目前 `things3-cli` 不支持删除（没有“删除/移至废纸篓”的写入命令；`things trash` 仅供只读列出）。
- 方案：使用 Things UI 删除，或通过 `things update` 标记为 `--completed` / `--canceled`。

## 注意事项

- 仅限 macOS。
- `--dry-run` 会打印 URL 而不会实际打开 Things。
