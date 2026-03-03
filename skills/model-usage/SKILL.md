---
name: model-usage
description: 使用 CodexBar CLI 本地费用日志按模型汇总 Codex 或 Claude 的使用情况，包含当前（最近）模型或完整的模型明细。当需要 CodexBar 的模型级费用数据或脚本化汇总时使用。
metadata:
  {
    "openclaw":
      {
        "emoji": "📊",
        "os": ["darwin"],
        "requires": { "bins": ["codexbar"] },
        "install":
          [
            {
              "id": "brew-cask",
              "kind": "brew",
              "formula": "steipete/tap/codexbar",
              "bins": ["codexbar"],
              "label": "安装 CodexBar (brew cask)",
            },
          ],
      },
  }
---

# 模型使用情况

## 概览

从 CodexBar 的本地费用日志中获取按模型计费的使用成本。支持 Codex 或 Claude 的“当前模型”（最近的每日条目）或“所有模型”汇总。

待办：一旦 CodexBar CLI 的 Linux 安装路径有文档说明，添加 Linux CLI 支持指南。

## 快速开始

1. 通过 CodexBar CLI 获取费用 JSON 或传递一个 JSON 文件。
2. 使用捆绑的脚本按模型进行汇总。

```bash
python {baseDir}/scripts/model_usage.py --provider codex --mode current
python {baseDir}/scripts/model_usage.py --provider codex --mode all
python {baseDir}/scripts/model_usage.py --provider claude --mode all --format json --pretty
```

## 当前模型逻辑

- 使用包含 `modelBreakdowns` 的最新每日记录。
- 选择该记录中费用最高的模型。
- 当缺少明细时，回退到 `modelsUsed` 中的最后一个条目。
- 当需要特定模型时，使用 `--model <name>` 进行覆盖。

## 输入

- 默认：运行 `codexbar cost --format json --provider <codex|claude>`。
- 文件或标准输入：

```bash
codexbar cost --provider codex --format json > /tmp/cost.json
python {baseDir}/scripts/model_usage.py --input /tmp/cost.json --mode all
cat /tmp/cost.json | python {baseDir}/scripts/model_usage.py --input - --mode current
```

## 输出

- 文本（默认）或 JSON (`--format json --pretty`)。
- 数值仅为各模型的费用；在 CodexBar 的输出中，Token 数不按模型拆分。

## 参考

- 阅读 `references/codexbar-cli.md` 以了解 CLI 标志和费用 JSON 字段。
