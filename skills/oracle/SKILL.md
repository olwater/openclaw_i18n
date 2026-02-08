---
name: oracle
description: 使用 oracle CLI 的最佳实践（提示词 + 文件捆绑、引擎、会话和文件附加模式）。
homepage: https://askoracle.dev
metadata:
  {
    "openclaw":
      {
        "emoji": "🧿",
        "requires": { "bins": ["oracle"] },
        "install":
          [
            {
              "id": "node",
              "kind": "node",
              "package": "@steipete/oracle",
              "bins": ["oracle"],
              "label": "安装 oracle (node)",
            },
          ],
      },
  }
---

# oracle —— 最佳实践

Oracle 将你的提示词和选定的文件捆绑成一个“一次性”请求，以便另一个模型能够根据真实的仓库上下文进行回答（通过 API 或浏览器自动化）。输出结果仅供参考：请结合代码和测试进行验证。

## 主要用例（浏览器，GPT-5.2 Pro）

这里的默认工作流是：使用 `--engine browser` 并在 ChatGPT 中配合 GPT-5.2 Pro。这是常见的“深度思考”路径：通常需要 10 分钟到 1 小时；系统会存储会话，你可以重新挂载（reattach）。

推荐默认值：

- 引擎：浏览器 (`--engine browser`)
- 模型：GPT-5.2 Pro (`--model gpt-5.2-pro` 或 `--model "5.2 Pro"`)

## 黄金路径

1. 选择一个精简的文件集（包含事实的最少文件数量）。
2. 预览有效负载和 Token 消耗（`--dry-run` + `--files-report`）。
3. 对于常规的 GPT-5.2 Pro 工作流，使用浏览器模式；仅在你明确需要时才使用 API。
4. 如果运行中断或超时：重新挂载到存储的会话（不要重新运行）。

## 命令（首选）

- 帮助：
  - `oracle --help`
  - 如果二进制文件未安装：`npx -y @steipete/oracle --help`（此处避免使用 `pnpx`，涉及 sqlite 绑定）。

- 预览（不消耗 Token）：
  - `oracle --dry-run summary -p "<任务>" --file "src/**" --file "!**/*.test.*"`
  - `oracle --dry-run full -p "<任务>" --file "src/**"`

- Token 检查：
  - `oracle --dry-run summary --files-report -p "<任务>" --file "src/**"`

- 浏览器运行（主要路径；长时间运行是正常的）：
  - `oracle --engine browser --model gpt-5.2-pro -p "<任务>" --file "src/**"`

- 手动粘贴回退：
  - `oracle --render --copy -p "<任务>" --file "src/**"`
  - 注意：`--copy` 是 `--copy-markdown` 的隐藏别名。

## 附加文件 (`--file`)

`--file` 接受文件、目录和通配符（glob）。你可以多次传递它；条目也可以用逗号分隔。

- 包含：
  - `--file "src/**"`
  - `--file src/index.ts`
  - `--file docs --file README.md`

- 排除：
  - `--file "src/**" --file "!src/**/*.test.ts" --file "!**/*.snap"`

- 默认值（实现行为）：
  - 默认忽略的目录：`node_modules`, `dist`, `coverage`, `.git`, `.turbo`, `.next`, `build`, `tmp`（除非明确作为字面量目录/文件传递，否则会被跳过）。
  - 在展开通配符时遵循 `.gitignore`。
  - 不追踪符号链接。
  - 除非通过模式（如 `--file ".github/**" `）显式加入，否则会过滤点文件（dotfiles）。
  - 超过 1 MB 的文件会被拒绝。

## 引擎（API 对比浏览器）

- 自动选择：设置了 `OPENAI_API_KEY` 时使用 `api`；否则使用 `browser`。
- 浏览器模式仅支持 GPT 和 Gemini；对于 Claude/Grok/Codex 或多模型运行，请使用 `--engine api`。
- 浏览器附件：
  - `--browser-attachments auto|never|always`（auto 模式下，约 6 万字符以内会直接粘贴，超过后则上传）。
- 远程浏览器主机：
  - 主机端：`oracle serve --host 0.0.0.0 --port 9473 --token <secret>`
  - 客户端：`oracle --engine browser --remote-host <host:port> --remote-token <secret> -p "<任务>" --file "src/**"`

## 会话和 Slug

- 存储在 `~/.oracle/sessions` 下（可通过 `ORACLE_HOME_DIR` 覆盖）。
- 运行可能会中断或耗时较长（浏览器 + GPT-5.2 Pro 经常如此）。如果 CLI 超时：不要重新运行，请重新挂载。
  - 列表：`oracle status --hours 72`
  - 挂载：`oracle session <id> --render`
- 使用 `--slug "<3-5个单词>"` 来保持会话 ID 的可读性。
- 存在重复提示词保护；仅在你确实想要进行全新的运行时使用 `--force`。

## 提示词模板（高质量信号）

Oracle 在开始时对项目了解为**零**。假设模型无法推断你的技术栈、构建工具、惯例或“显而易见”的路径。请包含：

- 项目简报（技术栈 + 构建/测试命令 + 平台限制）。
- “东西在哪”（关键目录、入口点、配置文件、边界）。
- 确切的问题 + 你尝试过的内容 + 错误文本（原样提供）。
- 约束条件（“不要修改 X”、“必须保留公共 API”等）。
- 期望的输出（“返回补丁计划 + 测试”、“给出 3 个权衡方案”）。

## 安全

- 默认情况下不要附加机密信息（`.env`、密钥文件、认证令牌）。请进行激进的脱敏；仅分享必要的内容。

## “穷举式提示词”恢复模式

对于长时间的调查，编写一个独立的提示词 + 文件集，以便你在几天后重新运行：

- 6–30 句的项目简报 + 目标。
- 重现步骤 + 确切错误 + 你尝试过的内容。
- 附加所有需要的上下文文件（入口点、配置、关键模块、文档）。

Oracle 运行是一次性的；模型不会记住之前的运行。“恢复上下文”意味着使用相同的提示词 + `--file ...` 集合重新运行（或重新挂载一个仍在运行的存储会话）。
