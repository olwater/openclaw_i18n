# 🦞 OpenClaw (中文增强版)

> **让您的终端长出钳子 —— 全能个人 AI 助手，现已精通中文。**

此项目是 [OpenClaw](https://github.com/openclaw/openclaw) 的深度本地化分支，专为中文用户打造。它不仅仅是一个简单的翻译版本，更针对中文输入、显示以及国内常用的模型服务（如 DeepSeek, Moonshot, Qwen 等）进行了深度适配。

<p align="center">
    <a href="https://qm.qq.com/q/1080150682" target="_blank"><img src="https://img.shields.io/badge/QQ交流群-1080150682-blue?style=flat-square&logo=tencent-qq&logoColor=white" alt="QQ Group"></a>
    <a href="https://github.com/olwater/openclaw_i18n/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg?style=flat-square" alt="License"></a>
</p>

---

## 🌟 核心特色

1.  **全链路汉化**：
    - **CLI 命令行**：交互式向导、帮助信息、错误提示全中文。
    - **Web UI 控制台**：仪表盘、设置、聊天界面完美汉化。
    - **TUI 终端界面**：在终端内也能享受无障碍的中文交互。

2.  **本土化增强**：
    - **中文环境适配**：解决终端下的中文乱码、输入法光标错位等“水土不服”问题。
    - **模型支持**：除了 OpenAI/Anthropic，完美支持 **DeepSeek (深度求索)**、**Moonshot (月之暗面)**、**Qwen (通义千问)** 等国产大模型。
    - **Prompt 优化**：内置系统提示词已针对中文语境微调，让 AI 更懂中文指令。

3.  **强大的 Agent 能力**：
    - **多模态支持**：支持视觉识别、文件分析。
    - **工具调用**：内置浏览器控制、文件系统操作、代码执行等技能 (Skill)。
    - **多客户端**：支持 Web、终端 TUI、移动端 PWA 访问。

## 🚀 快速开始

### 1. 环境准备

确保您的系统已安装：

- **Node.js**: 版本需 **≥ 22** (推荐使用 LTS 版本)
- **pnpm**: 推荐使用 pnpm 管理依赖 (`npm i -g pnpm`)

### 2. 下载与安装

```bash
# 1. 克隆仓库
git clone https://github.com/olwater/openclaw_i18n.git
cd openclaw_i18n

# 2. 安装依赖
pnpm install

# 3. 构建项目 (这就好了！)
# ui:build 构建前端界面，build 构建核心服务
pnpm ui:build && pnpm build
```

### 3. 初始化向导 (Onboarding)

我们为您准备了一个全中文的交互式向导，只需一条命令即可完成所有配置：

```bash
pnpm openclaw onboard
```

### 安全与私信策略

OpenClaw 能够连接到真实的通讯平台。请将来自私信 (DM) 的输入视为**不可信输入**。

完整的安全指南：[Security](https://docs.openclaw.ai/gateway/security)

默认行为 (适用于 Telegram/WhatsApp/Signal/iMessage/Teams/Discord/Google Chat/Slack 等):

- **私信配对 (DM pairing)**：未知发送者会收到一个简短的配对码，机器人此时不会处理他们的消息。
- **批准配对**：在控制端使用命令 `openclaw pairing approve <频道> <配对码>` (随后发送者将被添加到本地白名单中)。
- 若要公开接收所有人的私信，需明确开启：设置 `dmPolicy="open"` 并在频道的 `allowFrom` 列表中包含 `"*"`。
- 您可以随时运行 `openclaw doctor` 来自动诊断存在安全风险的私信策略配置。

## 🌟 核心亮点

- **[本地优先的 网关 Gateway](https://docs.openclaw.ai/gateway)** — 用于统一管理会话、频道、工具和事件的控制端。
- **[多渠道消息接入](https://docs.openclaw.ai/channels)** — 现已支持 WhatsApp, Telegram, Slack, Discord, Google Chat, Signal, BlueBubbles (iMessage), Microsoft Teams, Matrix, Zalo, WebChat 以及移动端。
- **[多 Agent 路由](https://docs.openclaw.ai/gateway/configuration)** — 支持将不同的频道或账号入站请求隔离并路由给不同的 Agents。
- **[语音唤醒](https://docs.openclaw.ai/nodes/voicewake) + [对讲模式](https://docs.openclaw.ai/nodes/talk)** — 借助 ElevenLabs 实现 macOS/iOS/Android 的全天候语音交互。
- **[Live Canvas](https://docs.openclaw.ai/platforms/mac/canvas)** — 由 Agent 驱动的智能视觉工作区。
- **[原生技能与工具](https://docs.openclaw.ai/tools)** — 内置浏览器控制、Canvas 控制、移动端节点控制、Cron 定时任务等强大功能。
- **[多平台客户端支持](https://docs.openclaw.ai/platforms/macos)** — 提供 macOS 菜单栏应用及 iOS/Android 互联应用。
- **[可视化向导](https://docs.openclaw.ai/start/wizard)** — 通过向导引导轻松完成环境配置和技能管理。

## 架构概览

```text
WhatsApp / Telegram / Slack / Discord / WebChat / Signal / iMessage ...
               │
               ▼
┌───────────────────────────────┐
│            Gateway            │
│       (控制平面 / 主节点)        │
│     ws://127.0.0.1:18789      │
└──────────────┬────────────────┘
               │
               ├─ Pi Agent (RPC 远程调用)
               ├─ CLI (openclaw ...)
               ├─ WebChat UI (本地安全网页端)
               ├─ macOS 客户端应用
               └─ iOS / Android 互联节点
```

````

向导会引导您：

1.  选择 **API 提供商** (推荐使用 DeepSeek 或 OpenAI 兼容接口)。
2.  输入 **API Key**。
3.  配置基础 **技能 (Skills)**。

> **提示**：如果您的网络环境需要代理，请在运行前设置环境变量，例如：`export HTTPS_PROXY=http://127.0.0.1:7890`

### 4. 启动服务

配置完成后，启动 OpenClaw 网关：

```bash
pnpm openclaw gateway
````

现在，打开浏览器访问控制台 (默认为 `http://localhost:3000`)，或者直接在终端开始与 AI 对话！

## 🛠️ 进阶使用

### 常用命令

| 命令                    | 说明                       |
| :---------------------- | :------------------------- |
| `pnpm openclaw gateway` | 启动主服务 (Gateway)       |
| `pnpm openclaw onboard` | 重新运行配置向导           |
| `pnpm openclaw status`  | 查看当前连接状态和版本信息 |
| `pnpm openclaw doctor`  | 自动诊断环境问题           |
| `pnpm openclaw update`  | 检查并更新到最新版本       |

### 使用 Docker 运行

如果您不想配置 Node.js 环境，可以直接使用 Docker：

```bash
docker run -d \
  --name openclaw \
  --network host \
  -v $HOME/.openclaw:/home/node/.openclaw \
  ghcr.io/olwater/openclaw_i18n:latest \
  node dist/index.js gateway --bind lan
```

_(注意：建议挂载 `~/.openclaw` 目录以持久化保存您的配置和对话记录)_

## 🤝 参与贡献

本项目欢迎任何形式的贡献！无论是翻译修正、代码提交还是 Bug 反馈。

<<<<<<< HEAD

- **官方仓库**: [openclaw/openclaw](https://github.com/openclaw/openclaw)
- # **中文分支**: [olwater/openclaw_i18n](https://github.com/olwater/openclaw_i18n)
- Set `DISCORD_BOT_TOKEN` or `channels.discord.token` (env wins).
- Optional: set `commands.native`, `commands.text`, or `commands.useAccessGroups`, plus `channels.discord.allowFrom`, `channels.discord.guilds`, or `channels.discord.mediaMaxMb` as needed.
  > > > > > > > origin/main

如果您觉得好用，请给个 Star ⭐️ 支持一下！
