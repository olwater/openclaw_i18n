---
name: 1password
description: 设置并使用 1Password CLI (op)。在安装 CLI、启用桌面应用集成、登录（单账号或多账号）以及通过 op 读取/注入/运行机密信息时使用。
homepage: https://developer.1password.com/docs/cli/get-started/
metadata:
  {
    "openclaw":
      {
        "emoji": "🔐",
        "requires": { "bins": ["op"] },
        "install":
          [
            {
              "id": "brew",
              "kind": "brew",
              "formula": "1password-cli",
              "bins": ["op"],
              "label": "安装 1Password CLI (brew)",
            },
          ],
      },
  }
---

# 1Password CLI

遵循官方 CLI 的入门步骤。不要猜测安装命令。

## 参考资料

- `references/get-started.md`（安装 + 应用集成 + 登录流程）
- `references/cli-examples.md`（真实的 `op` 示例）

## 工作流

1. 检查操作系统和 Shell。
2. 验证 CLI 是否存在：`op --version`。
3. 确认已启用桌面应用集成（参考入门指南）且应用已解锁。
4. **必需**：为所有 `op` 命令创建一个全新的 tmux 会话（不要在 tmux 之外直接调用 `op`）。
5. 在 tmux 内部登录/授权：`op signin`（预期会弹出应用提示）。
6. 在 tmux 内部验证访问权限：`op whoami`（在读取任何机密信息前必须成功）。
7. 如果有多个账号：使用 `--account` 或 `OP_ACCOUNT` 环境变量。

## 必需的 tmux 会话 (T-Max)

shell 工具在执行每个命令时都会使用一个新的 TTY。为了避免重复提示和失败，请务必在专用 tmux 会话中运行 `op`，并使用全新的套接字/会话名称。

示例（套接字惯例请参考 `tmux` 技能，不要重复使用旧的会话名称）：

```bash
SOCKET_DIR="${OPENCLAW_TMUX_SOCKET_DIR:-${CLAWDBOT_TMUX_SOCKET_DIR:-${TMPDIR:-/tmp}/openclaw-tmux-sockets}}"
mkdir -p "$SOCKET_DIR"
SOCKET="$SOCKET_DIR/openclaw-op.sock"
SESSION="op-auth-$(date +%Y%m%d-%H%M%S)"

tmux -S "$SOCKET" new -d -s "$SESSION" -n shell
tmux -S "$SOCKET" send-keys -t "$SESSION":0.0 -- "op signin --account my.1password.com" Enter
tmux -S "$SOCKET" send-keys -t "$SESSION":0.0 -- "op whoami" Enter
tmux -S "$SOCKET" send-keys -t "$SESSION":0.0 -- "op vault list" Enter
tmux -S "$SOCKET" capture-pane -p -J -t "$SESSION":0.0 -S -200
tmux -S "$SOCKET" kill-session -t "$SESSION"
```

## 防护措施

- 严禁将机密信息粘贴到日志、聊天或代码中。
- 优先选择 `op run` / `op inject`，而不是将机密信息写入磁盘。
- 如果需要在没有应用集成的情况下登录，请使用 `op account add`。
- 如果命令返回“account is not signed in”，请在 tmux 内部重新运行 `op signin` 并在应用中进行授权。
- 不要在 tmux 之外运行 `op`；如果 tmux 不可用，请停止操作并询问用户。
