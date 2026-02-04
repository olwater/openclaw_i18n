# 🦞 OpenClaw i18n (中文增强版)

这是 [OpenClaw](https://github.com/openclaw/openclaw) 的中文本地化分支，旨在为中文用户提供无缝的个人 AI 助手体验。

> **Original Project**: [OpenClaw](https://github.com/openclaw/openclaw) by Peter Steinberger.

<p align="center">
    "让您的终端长出钳子 —— 个人 AI 助手，现已精通中文。"
    <br/>
    <br/>
    <a href="https://qm.qq.com/q/123456" target="_blank"><img src="https://img.shields.io/badge/QQ%E7%BE%A4-1080150682-blue?style=flat-square&logo=tencent-qq&logoColor=white" alt="QQ Group"></a>
</p>

## 🌏 i18n 版本特色

此版本我们在官方原版基础上进行了深度汉化和优化：

1.  **全界面汉化**：
    - **CLI (命令行)**：所有帮助信息、交互提示、报错信息均已翻译。
    - **Web UI (控制台)**：仪表盘、设置页面、聊天窗口全面中文化。
    - **TUI (终端界面)**：终端内的图形化界面也支持中文显示。
2.  **中文环境优化**：
    - 默认使用 `zh_CN` 语言环境。
    - 修复了部分中文输入和显示（如全角标点、Unicode 字符）的兼容性问题。
    - 优化了中文 Prompt 模板，使 AI 更懂中文语境。

## 🚀 快速开始

### 1. 安装与构建

推荐使用 `pnpm` 进行安装：

```bash
git clone https://github.com/olwater/openclaw_i18n.git
cd openclaw_i18n

# 安装依赖
pnpm install

# 构建项目 (包含 CLI 和 Web UI)
pnpm ui:build  # 首次必须运行，构建前端
pnpm build     # 构建核心服务
```

### 2. 初始化 (Onboarding)

使用中文环境启动设置向导：

（如果是从源码运行，请使用 `pnpm openclaw`；如果已安装到系统，直接使用 `openclaw`）

```bash
# 加上 LANG=zh_CN 环境变量，如果终端本身是中文环境，可以省略
LANG=zh_CN openclaw onboard
```

向导将引导您完成：

- **Gateway 设置**：本地 WebSocket 服务端口。
- **模型配置**：支持 OpenAI, Anthropic, Ollama 等。
- **Skill 技能**：浏览器控制、绘图板等。

### 3. 常用命令

日常使用时，建议将 `LANG=zh_CN` 加入您的 shell 配置文件，或每次命令前添加：

```bash
# 启动守护进程
LANG=zh_CN openclaw gateway

# 查看状态仪表盘
LANG=zh_CN openclaw status

# 发送消息
LANG=zh_CN openclaw message send --target +8613800000000 --message "你好，OpenClaw"

# 启动 Web 控制台
LANG=zh_CN openclaw dashboard
```

### 4. Docker 运行 (推荐)

如果您不想安装 Node.js 环境，可以直接使用 Docker 镜像：

```bash
# 拉取镜像
docker pull ghcr.io/olwater/openclaw_i18n:latest

# 启动 Gateway (后台运行)
docker run -d \
  --name openclaw \
  --network host \
  -v $HOME/.openclaw:/home/node/.openclaw \
  ghcr.io/olwater/openclaw_i18n:latest \
  node dist/index.js gateway --bind lan

# 查看日志
docker logs -f openclaw
```

注意：使用 `--network host` 是为了让 Gateway 能正确处理本地设备发现和端口映射。如果您在 Mac/Windows 上运行，可能因为 Docker 虚拟机隔离导致网络不通，此时建议使用端口映射模式：

```bash
docker run -d \
  --name openclaw \
  -p 18789:18789 -p 18790:18790 \
  -v $HOME/.openclaw:/home/node/.openclaw \
  ghcr.io/olwater/openclaw_i18n:latest \
  node dist/index.js gateway --bind 0.0.0.0
```

### 5. NAS 部署

针对不同品牌的 NAS 系统，建议使用官方推荐的路径与配置范式。

#### 5.1 群晖 (Synology)

适用于 **DSM 7.2+ (Container Manager)**。

1.  打开 **Container Manager** -> **项目 (Project)** -> **新增**。
2.  路径建议选择 `/volume1/docker/openclaw` (请先手动在 File Station 创建文件夹)。
3.  来源选择 "创建 docker-compose.yml"。
4.  粘贴以下内容：

```yaml
version: "3"
services:
  openclaw:
    image: ghcr.io/olwater/openclaw_i18n:latest
    container_name: openclaw
    restart: unless-stopped
    # 群晖推荐使用 host 模式以获得最佳设备发现能力
    network_mode: host
    volumes:
      # 映射到当前项目目录下的 data 文件夹
      - ./data:/home/node/.openclaw
    environment:
      - TZ=Asia/Shanghai
      - LANG=zh_CN.UTF-8
    command: ["node", "dist/index.js", "gateway", "--bind", "lan"]
```

#### 5.2 飞牛 (FnOS)

适用于 **飞牛私有云 (FnOS) -> Docker -> Docker Compose**。

1.  进入 **Docker** -> **Docker Compose** -> **新增项目**。
2.  项目名称填写 `openclaw`。
3.  粘贴以下内容（注意：FnOS 建议明确指定存储卷）：

```yaml
version: "3"
services:
  openclaw:
    image: ghcr.io/olwater/openclaw_i18n:latest
    container_name: openclaw
    restart: unless-stopped
    network_mode: host
    volumes:
      # 使用相对路径时，飞牛会自动在 /vol1/1000/Docker/openclaw 下创建数据文件夹
      # 如需指定绝对路径，请修改为: /vol1/1000/Docker/自定义文件夹:/home/node/.openclaw
      - ./data:/home/node/.openclaw
    environment:
      - TZ=Asia/Shanghai
      - LANG=zh_CN.UTF-8
    command: ["node", "dist/index.js", "gateway", "--bind", "lan"]
```

## 🛠 开发与贡献

如果您发现翻译遗漏或有更好的翻译建议，欢迎提交 Issue 或 PR！

- **翻译文件位置**：`src/i18n/locales/zh_CN.ts`
- **前端翻译**：`ui/src/i18n.ts` (部分硬编码文本已修正)

## 🔗 相关链接

- [原版文档 (English)](https://docs.openclaw.ai)
- [OpenClaw 官方仓库](https://github.com/openclaw/openclaw)

---

_Based on OpenClaw 2026.2.2_
