---
name: tmux
description: 通过发送按键和抓取面板输出来远程控制 tmux 会话，以实现交互式 CLI。
metadata:
  { "openclaw": { "emoji": "🧵", "os": ["darwin", "linux"], "requires": { "bins": ["tmux"] } } }
---

# tmux 技能 (OpenClaw)

仅在需要交互式 TTY 时使用 tmux。对于长时间运行的非交互式任务，优先使用 exec 后台模式。

## 快速开始（隔离的套接字，exec 工具）

```bash
SOCKET_DIR="${OPENCLAW_TMUX_SOCKET_DIR:-${CLAWDBOT_TMUX_SOCKET_DIR:-${TMPDIR:-/tmp}/openclaw-tmux-sockets}}"
mkdir -p "$SOCKET_DIR"
SOCKET="$SOCKET_DIR/openclaw.sock"
SESSION=openclaw-python

tmux -S "$SOCKET" new -d -s "$SESSION" -n shell
tmux -S "$SOCKET" send-keys -t "$SESSION":0.0 -- 'PYTHON_BASIC_REPL=1 python3 -q' Enter
tmux -S "$SOCKET" capture-pane -p -J -t "$SESSION":0.0 -S -200
```

启动会话后，务必打印监控命令：

```
监控命令：
  tmux -S "$SOCKET" attach -t "$SESSION"
  tmux -S "$SOCKET" capture-pane -p -J -t "$SESSION":0.0 -S -200
```

## 套接字（Socket）惯例

- 使用 `OPENCLAW_TMUX_SOCKET_DIR`（也支持旧的 `CLAWDBOT_TMUX_SOCKET_DIR`）。
- 默认套接字路径：`"$OPENCLAW_TMUX_SOCKET_DIR/openclaw.sock"`。

## 定位面板和命名

- 目标格式：`session:window.pane`（默认为 `:0.0`）。
- 保持名称简短，避免空格。
- 检查：`tmux -S "$SOCKET" list-sessions`，`tmux -S "$SOCKET" list-panes -a`。

## 查找会话

- 列出套接字上的会话：`{baseDir}/scripts/find-sessions.sh -S "$SOCKET"`。
- 扫描所有套接字：`{baseDir}/scripts/find-sessions.sh --all`（使用 `OPENCLAW_TMUX_SOCKET_DIR`）。

## 安全发送输入

- 优先使用字面量发送：`tmux -S "$SOCKET" send-keys -t target -l -- "$cmd"`。
- 控制键：`tmux -S "$SOCKET" send-keys -t target C-c`。
- 对于像 Claude Code/Codex 这样的交互式 TUI 应用，此指南涵盖了**如何发送命令**。
  **不要**在同一个 `send-keys` 中追加 `Enter`。这些应用可能会将快速的 文本+Enter 序列视为粘贴/多行输入而不提交；这取决于时机。请分两条命令发送文本和 `Enter`，并在中间加入短暂延迟（根据环境调整；如果需要请增加延迟，如果不支持亚秒级睡眠请使用 `sleep 1`）：

```bash
tmux -S "$SOCKET" send-keys -t target -l -- "$cmd" && sleep 0.1 && tmux -S "$SOCKET" send-keys -t target Enter
```

## 监控输出

- 抓取最近的历史记录：`tmux -S "$SOCKET" capture-pane -p -J -t target -S -200`。
- 等待提示符：`{baseDir}/scripts/wait-for-text.sh -t session:0.0 -p '模式'`。
- 可以使用 `attach`；通过 `Ctrl+b d` 分离（detach）。

## 启动进程

- 对于 Python REPL，设置 `PYTHON_BASIC_REPL=1`（非基础 REPL 会破坏 send-keys 流程）。

## Windows / WSL

- macOS/Linux 支持 tmux。在 Windows 上，请使用 WSL 并在 WSL 内部安装 tmux。
- 此技能仅限 `darwin`/`linux` 平台，并要求 PATH 中包含 `tmux`。

## 编排编程代理 (Codex, Claude Code)

tmux 非常擅长并行运行多个编程代理：

```bash
SOCKET="${TMPDIR:-/tmp}/codex-army.sock"

# 创建多个会话
for i in 1 2 3 4 5; do
  tmux -S "$SOCKET" new-session -d -s "agent-$i"
done

# 在不同的工作目录启动代理
tmux -S "$SOCKET" send-keys -t agent-1 "cd /tmp/project1 && codex --yolo '修复 bug X'" Enter
tmux -S "$SOCKET" send-keys -t agent-2 "cd /tmp/project2 && codex --yolo '修复 bug Y'" Enter

# 向 Claude Code/Codex TUI 发送提示词时，拆分 文本 + Enter 并加入延迟
tmux -S "$SOCKET" send-keys -t agent-1 -l -- "请对 README.md 进行微调。" && sleep 0.1 && tmux -S "$SOCKET" send-keys -t agent-1 Enter

# 轮询检查是否完成（检查提示符是否返回）
for sess in agent-1 agent-2; do
  if tmux -S "$SOCKET" capture-pane -p -t "$sess" -S -3 | grep -q "❯"; then
    echo "$sess: 完成"
  else
    echo "$sess: 运行中..."
  fi
done

# 获取已完成会话的完整输出
tmux -S "$SOCKET" capture-pane -p -t agent-1 -S -500
```

**提示：**

- 使用独立的 git worktree 进行并行修复（避免分支冲突）。
- 在新克隆的项目中运行 codex 前先执行 `pnpm install`。
- 检查 shell 提示符（`❯` 或 `$`）来检测是否完成。
- Codex 进行非交互式修复时需要使用 `--yolo` 或 `--full-auto` 标志。

## 清理

- 杀死会话：`tmux -S "$SOCKET" kill-session -t "$SESSION"`。
- 杀死套接字上的所有会话：`tmux -S "$SOCKET" list-sessions -F '#{session_name}' | xargs -r -n1 tmux -S "$SOCKET" kill-session -t`。
- 移除私有套接字上的所有内容：`tmux -S "$SOCKET" kill-server`。

## 辅助工具：wait-for-text.sh

`{baseDir}/scripts/wait-for-text.sh` 轮询面板以查找正则表达式（或固定字符串），并带有超时限制。

```bash
{baseDir}/scripts/wait-for-text.sh -t session:0.0 -p '模式' [-F] [-T 20] [-i 0.5] [-l 2000]
```

- `-t`/`--target` 面板目标（必填）
- `-p`/`--pattern` 要匹配的正则表达式（必填）；添加 `-F` 用于固定字符串匹配
- `-T` 超时秒数（整数，默认 15）
- `-i` 轮询间隔秒数（默认 0.5）
- `-l` 要搜索的历史行数（整数，默认 1000）
