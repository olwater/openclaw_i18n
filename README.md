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

向导会引导您：

1.  选择 **API 提供商** (推荐使用 DeepSeek 或 OpenAI 兼容接口)。
2.  输入 **API Key**。
3.  配置基础 **技能 (Skills)**。

> **提示**：如果您的网络环境需要代理，请在运行前设置环境变量，例如：`export HTTPS_PROXY=http://127.0.0.1:7890`

### 4. 启动服务

配置完成后，启动 OpenClaw 网关：

```bash
pnpm openclaw gateway
```

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

- **官方仓库**: [openclaw/openclaw](https://github.com/openclaw/openclaw)
- **中文分支**: [olwater/openclaw_i18n](https://github.com/olwater/openclaw_i18n)

如果您觉得好用，请给个 Star ⭐️ 支持一下！
