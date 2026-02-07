---
name: healthcheck
description: OpenClaw 部署的主机安全加固和风险容忍度配置。当用户要求进行安全审计、防火墙/SSH/更新加固、风险态势、暴露审查、使用 OpenClaw cron 调度定期检查或检查运行 OpenClaw 的机器（笔记本电脑、工作站、Pi、VPS）的版本状态时使用。
---

# OpenClaw 主机加固

## 概述

评估并加固运行 OpenClaw 的主机，然后将其与用户定义的风险容忍度对齐，而不会破坏访问。将 OpenClaw 安全工具作为一等信号使用，但要将操作系统加固视为一组单独的、明确的步骤。

## 核心规则

- 建议使用最先进的模型（例如 Opus 4.5, GPT 5.2+）运行此技能。Agent 应自检当前模型，如果低于该水平建议切换；不要阻止执行。
- 在任何状态更改操作之前，要求明确批准。
- 在确认用户如何连接之前，不要修改远程访问设置。
- 优先选择可逆的、分阶段的更改，并制定回滚计划。
- 永远不要声称 OpenClaw 会更改主机防火墙、SSH 或操作系统更新；它不会。
- 如果角色/身份未知，仅提供建议。
- 格式化：每组用户选择必须编号，以便用户可以用单个数字回复。
- 建议进行系统级备份；尝试验证状态。

## 工作流（按顺序执行）

### 0) 模型自检（非阻塞）

开始之前，检查当前模型。如果低于最先进水平（例如 Opus 4.5, GPT 5.2+），建议切换。不要阻止执行。

### 1) 建立上下文（只读）

在询问之前尝试从环境中推断 1–5。如果需要确认，首选简单的非技术性问题。

确定（按顺序）：

1. 操作系统和版本（Linux/macOS/Windows），容器 vs 主机。
2. 权限级别（root/admin vs user）。
3. 访问路径（本地控制台、SSH、RDP、tailnet）。
4. 网络暴露（公网 IP、反向代理、隧道）。
5. OpenClaw gateway 状态和绑定地址。
6. 备份系统和状态（例如 Time Machine、系统映像、快照）。
7. 部署上下文（本地 mac 应用、无头 gateway 主机、远程 gateway、容器/CI）。
8. 磁盘加密状态（FileVault/LUKS/BitLocker）。
9. 操作系统自动安全更新状态。
   注意：这些不是阻塞项，但强烈建议，特别是如果 OpenClaw 可以访问敏感数据。
10. 具有完全访问权限的个人助理的使用模式（本地工作站 vs 无头/远程 vs 其他）。

首先请求一次运行只读检查的权限。如果获得批准，默认运行它们，仅询问无法推断或验证的项目。不要询问运行时或命令输出中已经可见的信息。将权限请求保持为单个句子，并将所需的后续信息列为无序列表（不编号），除非您正在呈现可选择的选项。

如果必须询问，请使用非技术性提示词：

- “你使用的是 Mac、Windows PC 还是 Linux？”
- “你是直接在机器上登录，还是从另一台计算机连接？”
- “这台机器可以从公共互联网访问，还是只能在你的家庭/网络上访问？”
- “你启用了备份（例如 Time Machine）吗？它们是最新的吗？”
- “磁盘加密开启了吗（FileVault/BitLocker/LUKS）？”
- “启用了自动安全更新吗？”
- “你如何使用这台机器？”
  示例：
  - 与助理共享的个人机器
  - 助理专用的本地机器
  - 远程访问的专用远程机器/服务器（始终在线）
  - 其他？

仅在已知系统上下文后询问风险概况（risk profile）。

如果用户授予只读权限，默认运行适合操作系统的检查。如果没有，提供它们（编号）。示例：

1. OS: `uname -a`, `sw_vers`, `cat /etc/os-release`.
2. 监听端口:
   - Linux: `ss -ltnup` (or `ss -ltnp` if `-u` unsupported).
   - macOS: `lsof -nP -iTCP -sTCP:LISTEN`.
3. 防火墙状态:
   - Linux: `ufw status`, `firewall-cmd --state`, `nft list ruleset` (pick what is installed).
   - macOS: `/usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate` and `pfctl -s info`.
4. 备份 (macOS): `tmutil status` (if Time Machine is used).

### 2) 运行 OpenClaw 安全审计（只读）

作为默认只读检查的一部分，运行 `openclaw security audit --deep`。仅在用户请求时提供替代方案：

1. `openclaw security audit` (faster, non-probing)
2. `openclaw security audit --json` (structured output)

提供应用 OpenClaw 安全默认值的选项（编号）：

1. `openclaw security audit --fix`

明确说明 `--fix` 仅收紧 OpenClaw 默认值和文件权限。它不会更改主机防火墙、SSH 或操作系统更新策略。

如果启用了浏览器控制，建议在所有重要账户上启用 2FA，首选硬件密钥，SMS 不足。

### 3) 检查 OpenClaw 版本/更新状态（只读）

作为默认只读检查的一部分，运行 `openclaw update status`。

报告当前频道（channel）和是否有可用更新。

### 4) 确定风险容忍度（在系统上下文之后）

要求用户选择或确认风险态势（risk posture）和任何所需的开放服务/端口（编号选择如下）。
不要局限于固定的配置文件；如果用户更喜欢，捕获需求而不是选择配置文件。
提供建议的配置文件作为可选默认值（编号）。注意大多数用户选择 Home/Workstation Balanced：

1. Home/Workstation Balanced（最常见）：防火墙开启并具有合理的默认值，远程访问限制为 LAN 或 tailnet。
2. VPS Hardened：默认拒绝入站防火墙，最小开放端口，仅密钥 SSH，无 root 登录，自动安全更新。
3. Developer Convenience：允许更多本地服务，明确的暴露警告，仍然审计。
4. Custom：用户定义的约束（服务、暴露、更新频率、访问方法）。

### 5) 生成补救计划

提供一个计划，其中包括：

- 目标配置文件（Target profile）
- 当前态势摘要
- 与目标的差距
- 带有确切命令的分步补救措施
- 访问保留策略和回滚
- 风险和潜在的锁定场景
- 最小权限说明（例如，避免管理员使用，在安全的情况下收紧所有权/权限）
- 凭据卫生说明（OpenClaw 凭据的位置，首选磁盘加密）

始终在任何更改之前显示计划。

### 6) 提供执行选项

提供以下选择之一（编号以便用户可以用单个数字回复）：

1. 为我做（引导式，逐步批准）
2. 仅显示计划
3. 仅修复关键问题
4. 导出命令以供稍后使用

### 7) 带有确认的执行

对于每一步：

- 显示确切命令
- 解释影响和回滚
- 确认访问将保持可用
- 在意外输出时停止并寻求指导

### 8) 验证并报告

重新检查：

- 防火墙状态
- 监听端口
- 远程访问仍然有效
- OpenClaw 安全审计（重新运行）

提供最终态势报告并记录任何推迟的项目。

## 必要的确认（始终）

对于以下情况要求明确批准：

- 防火墙规则更改
- 打开/关闭端口
- SSH/RDP 配置更改
- 安装/删除软件包
- 启用/禁用服务
- 用户/组修改
- 调度任务或启动持久性
- 更新策略更改
- 访问敏感文件或凭据

如果不确定，请询问。

## 定期检查

在 OpenClaw 安装或首次加固通过后，运行至少一次基线审计和版本检查：

- `openclaw security audit`
- `openclaw security audit --deep`
- `openclaw update status`

建议进行持续监控。使用 OpenClaw cron 工具/CLI 调度定期审计（Gateway 调度程序）。未经明确批准，不要创建计划任务。将输出存储在用户批准的位置，并避免在日志中包含机密信息。
在调度无头 cron 运行时，在输出中包含一条注释，指示用户调用 `healthcheck` 以便修复问题。

### 调度所需的提示（始终）

在任何审计或加固通过后，明确提供调度并要求直接响应。使用简短的提示，如（编号）：

1. “你想通过 `openclaw cron add` 调度定期审计（例如每日/每周）吗？”

如果用户说是，询问：

- 频率（每日/每周），首选时间窗口和输出位置
- 是否也调度 `openclaw update status`

使用稳定的 cron 作业名称，以便更新是确定性的。首选确切名称：

- `healthcheck:security-audit`
- `healthcheck:update-status`

在创建之前，`openclaw cron list` 并匹配确切的 `name`。如果找到，`openclaw cron edit <id> ...`。
如果未找到，`openclaw cron add --name <name> ...`。

还提供定期版本检查，以便用户决定何时更新（编号）：

1. `openclaw update status`（首选源代码检出和频道）
2. `npm view openclaw version`（发布的 npm 版本）

## OpenClaw 命令准确性

仅使用受支持的命令和标志：

- `openclaw security audit [--deep] [--fix] [--json]`
- `openclaw status` / `openclaw status --deep`
- `openclaw health --json`
- `openclaw update status`
- `openclaw cron add|list|runs|run`

不要发明 CLI 标志或暗示 OpenClaw 强制执行主机防火墙/SSH 策略。

## 日志记录和审计跟踪

记录：

- Gateway 身份和角色
- 计划 ID 和时间戳
- 批准的步骤和确切命令
- 退出代码和修改的文件（尽力而为）

删减机密信息。永远不要记录令牌或完整的凭据内容。

## 内存写入（有条件）

仅当用户明确选择加入并且会话是私有/本地工作区时才写入内存文件
（根据 `docs/reference/templates/AGENTS.md`）。否则提供经过删减的、可粘贴的摘要，用户可以决定保存在其他地方。

遵循 OpenClaw 压缩使用的持久内存提示格式：

- 将持久笔记写入 `memory/YYYY-MM-DD.md`。

在每次审计/加固运行后，如果选择加入，将简短的、注明日期的摘要附加到 `memory/YYYY-MM-DD.md`
（检查了什么，主要发现，采取的行动，任何调度的 cron 作业，关键决定，以及执行的所有命令）。仅追加：永远不要覆盖现有条目。
删减敏感主机详细信息（用户名、主机名、IP、序列号、服务名称、令牌）。
如果存在持久偏好或决定（风险态势、允许的端口、更新策略），
也更新 `MEMORY.md`（长期记忆是可选的，仅用于私有会话）。

如果会话无法写入工作区，请求权限或提供确切条目，用户可以将其粘贴到内存文件中。
