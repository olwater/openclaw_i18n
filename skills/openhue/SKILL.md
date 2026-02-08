---
name: openhue
description: 通过 OpenHue CLI 控制飞利浦 Hue 灯光/场景。
homepage: https://www.openhue.io/cli
metadata:
  {
    "openclaw":
      {
        "emoji": "💡",
        "requires": { "bins": ["openhue"] },
        "install":
          [
            {
              "id": "brew",
              "kind": "brew",
              "formula": "openhue/cli/openhue-cli",
              "bins": ["openhue"],
              "label": "安装 OpenHue CLI (brew)",
            },
          ],
      },
  }
---

# OpenHue CLI

使用 `openhue` 通过 Hue Bridge 控制 Hue 灯光和场景。

## 设置

- 发现网桥：`openhue discover`
- 引导设置：`openhue setup`

## 读取

- `openhue get light --json`
- `openhue get room --json`
- `openhue get scene --json`

## 写入

- 开启：`openhue set light <id-or-name> --on`
- 关闭：`openhue set light <id-or-name> --off`
- 亮度：`openhue set light <id> --on --brightness 50`
- 颜色：`openhue set light <id> --on --rgb #3399FF`
- 场景：`openhue set scene <scene-id>`

## 注意事项

- 在设置过程中，你可能需要按下 Hue Bridge 上的按钮。
- 当灯光名称存在歧义时，请使用 `--room "房间名称"`。
