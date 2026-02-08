---
name: blucli
description: 用于设备发现、播放控制、分组和音量调节的 BluOS CLI (blu)。
homepage: https://blucli.sh
metadata:
  {
    "openclaw":
      {
        "emoji": "🫐",
        "requires": { "bins": ["blu"] },
        "install":
          [
            {
              "id": "go",
              "kind": "go",
              "module": "github.com/steipete/blucli/cmd/blu@latest",
              "bins": ["blu"],
              "label": "安装 blucli (go)",
            },
          ],
      },
  }
---

# blucli (blu)

使用 `blu` 控制 Bluesound/NAD 播放器。

## 快速开始

- `blu devices`（选择目标）
- `blu --device <id> status`
- `blu play|pause|stop`
- `blu volume set 15`

## 目标选择（按优先级排序）

- `--device <id|名称|别名>`
- `BLU_DEVICE`
- 配置默认值（如果已设置）

## 常用任务

- 分组：`blu group status|add|remove`
- TuneIn 搜索/播放：`blu tunein search "查询内容"`，`blu tunein play "查询内容"`

脚本编写建议优先使用 `--json`。在更改播放状态前，请确认目标设备。
