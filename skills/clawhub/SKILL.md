---
name: clawhub
description: 使用 ClawHub CLI 从 clawhub.com 搜索、安装、更新和发布 Agent 技能。当你需要即时获取新技能、将已安装技能同步到最新或特定版本，或者使用通过 npm 安装的 clawhub CLI 发布新/更新的技能文件夹时使用。
metadata:
  {
    "openclaw":
      {
        "requires": { "bins": ["clawhub"] },
        "install":
          [
            {
              "id": "node",
              "kind": "node",
              "package": "clawhub",
              "bins": ["clawhub"],
              "label": "安装 ClawHub CLI (npm)",
            },
          ],
      },
  }
---

# ClawHub CLI

## 安装

```bash
npm i -g clawhub
```

## 认证（发布）

```bash
clawhub login
clawhub whoami
```

## 搜索

```bash
clawhub search "postgres 备份"
```

## 安装

```bash
clawhub install my-skill
clawhub install my-skill --version 1.2.3
```

## 更新（基于哈希匹配 + 升级）

```bash
clawhub update my-skill
clawhub update my-skill --version 1.2.3
clawhub update --all
clawhub update my-skill --force
clawhub update --all --no-input --force
```

## 列出

```bash
clawhub list
```

## 发布

```bash
clawhub publish ./my-skill --slug my-skill --name "My Skill" --version 1.2.0 --changelog "修复 + 文档"
```

## 注意事项

- 默认注册表：https://clawhub.com（可通过 `CLAWHUB_REGISTRY` 或 `--registry` 覆盖）
- 默认工作目录：当前目录（cwd），回退到 OpenClaw 工作区；安装目录：`./skills`（可通过 `--workdir` / `--dir` / `CLAWHUB_WORKDIR` 覆盖）
- 更新命令会对本地文件进行哈希处理，解析匹配版本，并升级到最新版本（除非设置了 `--version`）
