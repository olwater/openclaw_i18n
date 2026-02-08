---
name: eightctl
description: 控制 Eight Sleep 床垫（状态、温度、闹钟、日程）。
homepage: https://eightctl.sh
metadata:
  {
    "openclaw":
      {
        "emoji": "🎛️",
        "requires": { "bins": ["eightctl"] },
        "install":
          [
            {
              "id": "go",
              "kind": "go",
              "module": "github.com/steipete/eightctl/cmd/eightctl@latest",
              "bins": ["eightctl"],
              "label": "安装 eightctl (go)",
            },
          ],
      },
  }
---

# eightctl

使用 `eightctl` 控制 Eight Sleep 床垫。需要身份验证。

## 认证

- 配置文件：`~/.config/eightctl/config.yaml`
- 环境变量：`EIGHTCTL_EMAIL`、`EIGHTCTL_PASSWORD`

## 快速开始

- `eightctl status`
- `eightctl on|off`
- `eightctl temp 20`

## 常用任务

- 闹钟：`eightctl alarm list|create|dismiss`
- 日程：`eightctl schedule list|create|update`
- 音频：`eightctl audio state|play|pause`
- 床基座：`eightctl base info|angle`

## 注意事项

- API 是非官方的且有速率限制；避免重复登录。
- 在更改温度或闹钟之前请先确认。
