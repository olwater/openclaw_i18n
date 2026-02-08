---
name: camsnap
description: 从 RTSP/ONVIF 摄像头捕捉帧或剪辑。
homepage: https://camsnap.ai
metadata:
  {
    "openclaw":
      {
        "emoji": "📸",
        "requires": { "bins": ["camsnap"] },
        "install":
          [
            {
              "id": "brew",
              "kind": "brew",
              "formula": "steipete/tap/camsnap",
              "bins": ["camsnap"],
              "label": "安装 camsnap (brew)",
            },
          ],
      },
  }
---

# camsnap

使用 `camsnap` 从配置的摄像头中获取快照、剪辑或移动事件。

## 设置

- 配置文件：`~/.config/camsnap/config.yaml`
- 添加摄像头：`camsnap add --name kitchen --host 192.168.0.10 --user user --pass pass`

## 常用命令

- 发现设备：`camsnap discover --info`
- 快照：`camsnap snap kitchen --out shot.jpg`
- 剪辑：`camsnap clip kitchen --dur 5s --out clip.mp4`
- 移动侦测：`camsnap watch kitchen --threshold 0.2 --action '...'`
- 诊断：`camsnap doctor --probe`

## 注意事项

- 需要 PATH 中包含 `ffmpeg`。
- 在进行较长剪辑之前，建议先进行简短的测试捕捉。
