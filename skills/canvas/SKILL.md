# Canvas 技能

在连接的 OpenClaw 节点（Mac 应用、iOS、Android）上显示 HTML 内容。

## 概览

Canvas 工具允许你在任何已连接节点的 Canvas 视图中展示网页内容。非常适合用于：

- 显示游戏、可视化图表、仪表盘
- 展示生成的 HTML 内容
- 交互式演示

## 工作原理

### 架构

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│  Canvas Host    │────▶│   Node Bridge    │────▶│  Node App   │
│  (HTTP Server)  │     │  (TCP Server)    │     │ (Mac/iOS/   │
│  Port 18793     │     │  Port 18790      │     │  Android)   │
└─────────────────┘     └──────────────────┘     └─────────────┘
```

1. **Canvas Host Server**：从 `canvasHost.root` 目录提供静态 HTML/CSS/JS 文件。
2. **Node Bridge**：将 Canvas URL 传达给已连接的节点。
3. **Node Apps**：在 WebView 中渲染内容。

### Tailscale 集成

Canvas 主机服务器根据 `gateway.bind` 设置进行绑定：

| 绑定模式   | 服务器绑定到   | Canvas URL 使用           |
| ---------- | -------------- | ------------------------- |
| `loopback` | 127.0.0.1      | localhost (仅限本地)      |
| `lan`      | 局域网接口     | 局域网 IP 地址            |
| `tailnet`  | Tailscale 接口 | Tailscale 主机名          |
| `auto`     | 最佳可用接口   | Tailscale > 局域网 > 回环 |

**核心见解**：`canvasHostHostForBridge` 是从 `bridgeHost` 派生出来的。当绑定到 Tailscale 时，节点接收到的 URL 如下：

```
http://<tailscale-hostname>:18793/__openclaw__/canvas/<file>.html
```

这就是为什么 localhost URL 不起作用的原因——节点是从桥接器（bridge）接收 Tailscale 主机名的！

## 操作

| 操作       | 描述                        |
| ---------- | --------------------------- |
| `present`  | 显示 Canvas，可选择目标 URL |
| `hide`     | 隐藏 Canvas                 |
| `navigate` | 导航到新的 URL              |
| `eval`     | 在 Canvas 中执行 JavaScript |
| `snapshot` | 捕获 Canvas 的屏幕截图      |

## 配置

在 `~/.openclaw/openclaw.json` 中：

```json
{
  "canvasHost": {
    "enabled": true,
    "port": 18793,
    "root": "/Users/you/clawd/canvas",
    "liveReload": true
  },
  "gateway": {
    "bind": "auto"
  }
}
```

### 热重载 (Live Reload)

当 `liveReload: true`（默认值）时，Canvas 主机会：

- 监控根目录的更改（通过 chokidar）。
- 将 WebSocket 客户端注入到 HTML 文件中。
- 当文件更改时，自动重新加载已连接的 Canvas。

非常适合开发调试！

## 工作流

### 1. 创建 HTML 内容

将文件放在 Canvas 根目录（默认为 `~/clawd/canvas/`）：

```bash
cat > ~/clawd/canvas/my-game.html << 'HTML'
<!DOCTYPE html>
<html>
<head><title>我的游戏</title></head>
<body>
  <h1>Hello Canvas!</h1>
</body>
</html>
HTML
```

### 2. 找到你的 Canvas 主机 URL

检查你的网关绑定方式：

```bash
cat ~/.openclaw/openclaw.json | jq '.gateway.bind'
```

然后构造 URL：

- **loopback**: `http://127.0.0.1:18793/__openclaw__/canvas/<文件名>.html`
- **lan/tailnet/auto**: `http://<主机名>:18793/__openclaw__/canvas/<文件名>.html`

查找你的 Tailscale 主机名：

```bash
tailscale status --json | jq -r '.Self.DNSName' | sed 's/\.$//'
```

### 3. 查找已连接的节点

```bash
openclaw nodes list
```

寻找具有 Canvas 能力的 Mac/iOS/Android 节点。

### 4. 展示内容

```
canvas action:present node:<node-id> target:<完整-url>
```

**示例：**

```
canvas action:present node:mac-63599bc4-b54d-4392-9048-b97abd58343a target:http://peters-mac-studio-1.sheep-coho.ts.net:18793/__openclaw__/canvas/snake.html
```

### 5. 导航、快照或隐藏

```
canvas action:navigate node:<node-id> url:<新-url>
canvas action:snapshot node:<node-id>
canvas action:hide node:<node-id>
```

## 调试

### 白屏 / 内容未加载

**原因**：服务器绑定与节点预期之间的 URL 不匹配。

**调试步骤**：

1. 检查服务器绑定：`cat ~/.openclaw/openclaw.json | jq '.gateway.bind'`
2. 检查 Canvas 所在的端口：`lsof -i :18793`
3. 直接测试 URL：`curl http://<主机名>:18793/__openclaw__/canvas/<文件名>.html`

**解决方案**：使用与你的绑定模式相匹配的完整主机名，而不是 localhost。

### "node required" 错误

务必指定 `node:<node-id>` 参数。

### "node not connected" 错误

节点已离线。使用 `openclaw nodes list` 查找在线节点。

### 内容未更新

如果热重载不起作用：

1. 检查配置中的 `liveReload: true`。
2. 确保文件位于 Canvas 根目录中。
3. 检查日志中是否有监控器（watcher）错误。

## URL 路径结构

Canvas 主机提供以 `/__openclaw__/canvas/` 为前缀的服务：

```
http://<host>:18793/__openclaw__/canvas/index.html  → ~/clawd/canvas/index.html
http://<host>:18793/__openclaw__/canvas/games/snake.html → ~/clawd/canvas/games/snake.html
```

`/__openclaw__/canvas/` 前缀由 `CANVAS_HOST_PATH` 常量定义。

## 提示

- 保持 HTML 自包含（内联 CSS/JS）以获得最佳效果。
- 使用默认的 `index.html` 作为测试页（包含桥接诊断）。
- Canvas 会一直保持显示状态，直到你执行 `hide` 或导航离开。
- 热重载让开发变得飞快——只需保存，它就会自动更新！
- A2UI JSON 推送仍在开发中——目前请使用 HTML 文件。
