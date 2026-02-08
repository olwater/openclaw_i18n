---
name: gog
description: 适用于 Gmail、日历、云端硬盘、联系人、表格和文档的 Google Workspace CLI。
homepage: https://gogcli.sh
metadata:
  {
    "openclaw":
      {
        "emoji": "🎮",
        "requires": { "bins": ["gog"] },
        "install":
          [
            {
              "id": "brew",
              "kind": "brew",
              "formula": "steipete/tap/gogcli",
              "bins": ["gog"],
              "label": "安装 gog (brew)",
            },
          ],
      },
  }
---

# gog

使用 `gog` 操作 Gmail、日历、云端硬盘、联系人、表格和文档。需要进行 OAuth 设置。

## 设置（仅需一次）

- `gog auth credentials /path/to/client_secret.json`
- `gog auth add you@gmail.com --services gmail,calendar,drive,contacts,docs,sheets`
- `gog auth list`

## 常用命令

- Gmail 搜索：`gog gmail search 'newer_than:7d' --max 10`
- Gmail 邮件搜索（按邮件，忽略线程）：`gog gmail messages search "in:inbox from:ryanair.com" --max 20 --account you@example.com`
- Gmail 发送（纯文本）：`gog gmail send --to a@b.com --subject "Hi" --body "Hello"`
- Gmail 发送（多行）：`gog gmail send --to a@b.com --subject "Hi" --body-file ./message.txt`
- Gmail 发送（标准输入）：`gog gmail send --to a@b.com --subject "Hi" --body-file -`
- Gmail 发送（HTML）：`gog gmail send --to a@b.com --subject "Hi" --body-html "<p>Hello</p>"`
- Gmail 草稿：`gog gmail drafts create --to a@b.com --subject "Hi" --body-file ./message.txt`
- Gmail 发送草稿：`gog gmail drafts send <draftId>`
- Gmail 回复：`gog gmail send --to a@b.com --subject "Re: Hi" --body "Reply" --reply-to-message-id <msgId>`
- 日历列出活动：`gog calendar events <calendarId> --from <iso> --to <iso>`
- 日历创建活动：`gog calendar create <calendarId> --summary "Title" --from <iso> --to <iso>`
- 日历创建（带颜色）：`gog calendar create <calendarId> --summary "Title" --from <iso> --to <iso> --event-color 7`
- 日历更新活动：`gog calendar update <calendarId> <eventId> --summary "New Title" --event-color 4`
- 日历显示颜色：`gog calendar colors`
- 云端硬盘搜索：`gog drive search "query" --max 10`
- 联系人：`gog contacts list --max 20`
- 表格获取：`gog sheets get <sheetId> "Tab!A1:D10" --json`
- 表格更新：`gog sheets update <sheetId> "Tab!A1:B2" --values-json '[["A","B"],["1","2"]]' --input USER_ENTERED`
- 表格追加：`gog sheets append <sheetId> "Tab!A:C" --values-json '[["x","y","z"]]' --insert INSERT_ROWS`
- 表格清空：`gog sheets clear <sheetId> "Tab!A2:Z"`
- 表格元数据：`gog sheets metadata <sheetId> --json`
- 文档导出：`gog docs export <docId> --format txt --out /tmp/doc.txt`
- 文档 cat：`gog docs cat <docId>`

## 日历颜色

- 使用 `gog calendar colors` 查看所有可用的活动颜色（ID 1-11）。
- 使用 `--event-color <id>` 标志为活动添加颜色。
- 活动颜色 ID（来自 `gog calendar colors` 输出）：
  - 1: #a4bdfc
  - 2: #7ae7bf
  - 3: #dbadff
  - 4: #ff887c
  - 5: #fbd75b
  - 6: #ffb878
  - 7: #46d6db
  - 8: #e1e1e1
  - 9: #5484ed
  - 10: #51b749
  - 11: #dc2127

## 邮件格式

- 优先使用纯文本。对于多段落消息使用 `--body-file`（或通过标准输入使用 `--body-file -`）。
- 同样的 `--body-file` 模式也适用于草稿和回复。
- `--body` 不会对 `\n` 进行转义。如果你需要内联换行符，请使用 heredoc 或 `$'Line 1\n\nLine 2'`。
- 仅在你需要富文本格式时使用 `--body-html`。
- HTML 标签：`<p>` 代表段落，`<br>` 代表换行，`<strong>` 代表加粗，`<em>` 代表斜体，`<a href="url">` 代表链接，`<ul>`/`<li>` 代表列表。
- 示例（通过标准输入发送纯文本）：

  ```bash
  gog gmail send --to recipient@example.com \
    --subject "会议跟进" \
    --body-file - <<'EOF'
  你好 [姓名],

  感谢今天的会面。下一步计划：
  - 第一项
  - 第二项

  祝好，
  [你的名字]
  EOF
  ```

- 示例（HTML 列表）：
  ```bash
  gog gmail send --to recipient@example.com \
    --subject "会议跟进" \
    --body-html "<p>你好 [姓名],</p><p>感谢今天的会面。这是下一步计划：</p><ul><li>第一项</li><li>第二项</li></ul><p>祝好，<br>[你的名字]</p>"
  ```

## 注意事项

- 设置 `GOG_ACCOUNT=you@gmail.com` 以避免重复输入 `--account`。
- 对于脚本编写，优先使用 `--json` 加 `--no-input`。
- 表格值可以通过 `--values-json` 传递（推荐）或作为内联行传递。
- 文档支持导出/cat/复制。就地编辑需要使用 Docs API 客户端（gog 中不包含）。
- 在发送邮件或创建活动前请先确认。
- `gog gmail search` 每个线程返回一行；如果你需要分别返回每封具体的邮件，请使用 `gog gmail messages search`。
