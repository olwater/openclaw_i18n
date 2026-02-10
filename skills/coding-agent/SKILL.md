---
name: coding-agent
description: 通过后台进程运行 Codex CLI、Claude Code、OpenCode 或 Pi Coding Agent 以进行程序化控制。
metadata:
  {
    "openclaw": { "emoji": "🧩", "requires": { "anyBins": ["claude", "codex", "opencode", "pi"] } },
  }
---

# 编程代理（Bash 优先）

使用 **bash**（可选后台模式）进行所有编程代理工作。简单且高效。

## ⚠️ 必须使用 PTY 模式！

编程代理（Codex、Claude Code、Pi）是**交互式终端应用程序**，需要伪终端（PTY）才能正常工作。如果没有 PTY，你会得到损坏的输出、丢失颜色，或者代理可能会挂起。

运行编程代理时**务必使用 `pty:true`**：

```bash
# ✅ 正确 - 带有 PTY
bash pty:true command:"codex exec 'Your prompt'"

# ❌ 错误 - 没有 PTY，代理可能会崩溃
bash command:"codex exec 'Your prompt'"
```

### Bash 工具参数

| 参数         | 类型    | 描述                                       |
| ------------ | ------- | ------------------------------------------ |
| `command`    | string  | 要运行的 shell 命令                        |
| `pty`        | boolean | **编程代理必用！** 为交互式 CLI 分配伪终端 |
| `workdir`    | string  | 工作目录（代理仅能看到此文件夹的上下文）   |
| `background` | boolean | 在后台运行，返回 sessionId 以供监控        |
| `timeout`    | number  | 超时时间（秒），到期后将杀死进程           |
| `elevated`   | boolean | 在宿主机而非沙盒上运行（如果允许）         |

### 进程工具操作（用于后台会话）

| 操作        | 描述                                  |
| ----------- | ------------------------------------- |
| `list`      | 列出所有正在运行或最近的会话          |
| `poll`      | 检查会话是否仍在运行                  |
| `log`       | 获取会话输出（可选偏移量/限制）       |
| `write`     | 向 stdin 发送原始数据                 |
| `submit`    | 发送数据 + 换行符（模拟输入并按回车） |
| `send-keys` | 发送按键令牌或十六进制字节            |
| `paste`     | 粘贴文本（可选括号模式）              |
| `kill`      | 终止会话                              |

---

## 快速开始：一次性任务

对于快速提示/聊天，创建一个临时 git 仓库并运行：

```bash
# 快速聊天（Codex 需要 git 仓库！）
SCRATCH=$(mktemp -d) && cd $SCRATCH && git init && codex exec "你的提示词"

# 或者在真实项目中 - 带有 PTY！
bash pty:true workdir:~/Projects/myproject command:"codex exec '为 API 调用添加错误处理'"
```

**为什么要 git init？** Codex 拒绝在受信任的 git 目录之外运行。为草稿工作创建一个临时仓库可以解决这个问题。

---

## 模式：workdir + background + pty

对于较长时间的任务，请使用带有 PTY 的后台模式：

```bash
# 在目标目录启动代理（带有 PTY！）
bash pty:true workdir:~/project background:true command:"codex exec --full-auto '构建一个贪吃蛇游戏'"
# 返回用于跟踪的 sessionId

# 监控进度
process action:log sessionId:XXX

# 检查是否完成
process action:poll sessionId:XXX

# 发送输入（如果代理提出问题）
process action:write sessionId:XXX data:"y"

# 使用 Enter 提交（模拟输入 "yes" 并按回车）
process action:submit sessionId:XXX data:"yes"

# 如果需要，杀死进程
process action:kill sessionId:XXX
```

**为什么 workdir 很重要：** 代理会在一个专注的目录中醒来，不会到处乱逛去读不相关的文件（比如你的 soul.md 😅）。

---

## Codex CLI

**模型：** 默认为 `gpt-5.2-codex`（在 ~/.codex/config.toml 中设置）

### 标志

| 标志            | 作用                               |
| --------------- | ---------------------------------- |
| `exec "prompt"` | 一次性执行，完成后退出             |
| `--full-auto`   | 在沙盒中运行，但在工作区内自动批准 |
| `--yolo`        | 无沙盒，无批准（最快，也最危险）   |

### 构建/创建

```bash
# 快速一次性任务（自动批准）- 记得带 PTY！
bash pty:true workdir:~/project command:"codex exec --full-auto '构建一个深色模式切换开关'"

# 后台运行较长时间的工作
bash pty:true workdir:~/project background:true command:"codex --yolo '重构身份验证模块'"
```

### 审查 PR

**⚠️ 警告：切勿在 OpenClaw 自身的项目文件夹中审查 PR！**
请克隆到临时文件夹或使用 git worktree。

```bash
# 克隆到临时文件夹以进行安全审查
REVIEW_DIR=$(mktemp -d)
git clone https://github.com/user/repo.git $REVIEW_DIR
cd $REVIEW_DIR && gh pr checkout 130
bash pty:true workdir:$REVIEW_DIR command:"codex review --base origin/main"
# 完成后清理：trash $REVIEW_DIR

# 或者使用 git worktree（保持主分支完整）
git worktree add /tmp/pr-130-review pr-130-branch
bash pty:true workdir:/tmp/pr-130-review command:"codex review --base main"
```

### 批量 PR 审查（并行大军！）

```bash
# 先获取所有 PR 引用
git fetch origin '+refs/pull/*/head:refs/remotes/origin/pr/*'

# 部署大军 - 每个 PR 一个 Codex（全部带 PTY！）
bash pty:true workdir:~/project background:true command:"codex exec 'Review PR #86. git diff origin/main...origin/pr/86'"
bash pty:true workdir:~/project background:true command:"codex exec 'Review PR #87. git diff origin/main...origin/pr/87'"

# 监控所有进程
process action:list

# 将结果发布到 GitHub
gh pr comment <PR#> --body "<审查内容>"
```

---

## Claude Code

```bash
# 带有 PTY 以获得正确的终端输出
bash pty:true workdir:~/project command:"claude '你的任务'"

# 后台运行
bash pty:true workdir:~/project background:true command:"claude '你的任务'"
```

---

## OpenCode

```bash
bash pty:true workdir:~/project command:"opencode run '你的任务'"
```

---

## Pi 编程代理

```bash
# 安装：npm install -g @mariozechner/pi-coding-agent
bash pty:true workdir:~/project command:"pi '你的任务'"

# 非交互模式（仍建议使用 PTY）
bash pty:true command:"pi -p '总结 src/'"

# 使用不同的提供商/模型
bash pty:true command:"pi --provider openai --model gpt-4o-mini -p '你的任务'"
```

**注意：** Pi 现在已启用 Anthropic 提示词缓存（PR #584，2026 年 1 月合并）！

---

## 使用 git worktree 并行修复 Issue

为了并行修复多个 Issue，请使用 git worktree：

```bash
# 1. 为每个 Issue 创建 worktree
git worktree add -b fix/issue-78 /tmp/issue-78 main
git worktree add -b fix/issue-99 /tmp/issue-99 main

# 2. 在每个目录中启动 Codex（后台 + PTY！）
bash pty:true workdir:/tmp/issue-78 background:true command:"pnpm install && codex --yolo '修复 issue #78：<描述>。提交并推送。'"
bash pty:true workdir:/tmp/issue-99 background:true command:"pnpm install && codex --yolo '修复 issue #99：<描述>。提交并推送。'"

# 3. 监控进度
process action:list
process action:log sessionId:XXX

# 4. 修复后创建 PR
cd /tmp/issue-78 && git push -u origin fix/issue-78
gh pr create --repo user/repo --head fix/issue-78 --title "fix: ..." --body "..."

# 5. 清理
git worktree remove /tmp/issue-78
git worktree remove /tmp/issue-99
```

---

## ⚠️ 规则

1. **务必使用 pty:true** - 编程代理需要终端！
2. **尊重工具选择** - 如果用户要求使用 Codex，就用 Codex。
   - 编排模式：不要自己亲手编写补丁。
   - 如果代理失败/挂起，重启它或询问用户建议，不要默默接管。
3. **保持耐心** - 不要因为会话“慢”就杀死它们。
4. **使用 process:log 进行监控** - 在不干扰的情况下检查进度。
5. **--full-auto 用于构建** - 自动批准更改。
6. **普通模式用于审查** - 不需要特殊标志。
7. **可以并行运行** - 对于批量工作，可以同时运行多个 Codex 进程。
8. **严禁在 ~/clawd/ 启动 Codex** - 它会读取你的灵魂文档，并对组织架构产生奇怪的想法！
9. **严禁在 ~/Projects/openclaw/ 切换分支** - 那是正在运行的 OpenClaw 实例！

---

## 进度更新（至关重要）

当你在后台启动编程代理时，请保持用户知情。

- 启动时发送 1 条简短消息（运行什么 + 在哪里运行）。
- 仅当发生变化时再次更新：
  - 里程碑完成（构建结束、测试通过）
  - 代理提出问题 / 需要输入
  - 遇到错误或需要用户操作
  - 代理完成工作（包含更改内容 + 位置）
- 如果你杀死了会话，请立即说明原因。

这可以防止用户只看到“代理在回复前失败”而不知道发生了什么。

---

## 完成后自动通知

对于长时间运行的后台任务，在提示词末尾添加一个唤醒触发器，以便在代理完成时 OpenClaw 能立即收到通知（而不是等待下一次心跳）：

```
... 你的任务内容。

全部完成后，运行此命令通知我：
openclaw system event --text "完成：[构建内容的简短总结]" --mode now
```

**示例：**

```bash
bash pty:true workdir:~/project background:true command:"codex --yolo exec '为 todos 构建一个 REST API。

全部完成后，运行：openclaw system event --text \"完成：已构建包含 CRUD 端点的 todos REST API\" --mode now'"
```

这会触发一个即时唤醒事件——Skippy 会在几秒钟内收到提醒，而不是 10 分钟。

---

## 经验教训（2026 年 1 月）

- **PTY 至关重要：** 编程代理是交互式终端应用。如果没有 `pty:true`，输出会损坏或代理会挂起。
- **需要 Git 仓库：** Codex 不会在 git 目录之外运行。对于临时工作，请使用 `mktemp -d && git init`。
- **exec 是你的好帮手：** `codex exec "prompt"` 运行并干净地退出 - 非常适合一次性任务。
- **submit vs write：** 使用 `submit` 发送输入 + 回车，`write` 用于不带换行符的原始数据。
- **俏皮话有效：** Codex 对俏皮的提示词反应良好。让它写一首关于“在太空龙虾手下当二把手”的俳句，它写道：_“次席我编码 / 太空龙虾定节奏 / 键亮我跟随”_ 🦞
