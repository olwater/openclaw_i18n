---
name: sonoscli
description: 控制 Sonos 扬声器（发现/状态/播放/音量/分组）。
homepage: https://sonoscli.sh
metadata:
  {
    "openclaw":
      {
        "emoji": "🔊",
        "requires": { "bins": ["sonos"] },
        "install":
          [
            {
              "id": "go",
              "kind": "go",
              "module": "github.com/steipete/sonoscli/cmd/sonos@latest",
              "bins": ["sonos"],
              "label": "安装 sonoscli (go)",
            },
          ],
      },
  }
---

# Sonos CLI

使用 `sonos` 控制本地网络中的 Sonos 扬声器。

## 快速开始

- `sonos discover`
- `sonos status --name "厨房"`
- `sonos play|pause|stop --name "厨房"`
- `sonos volume set 15 --name "厨房"`

## 常用任务

- 分组：`sonos group status|join|unjoin|party|solo`
- 收藏夹：`sonos favorites list|open`
- 队列：`sonos queue list|play|clear`
- Spotify 搜索（通过 SMAPI）：`sonos smapi search --service "Spotify" --category tracks "查询内容"`

## 注意事项

- 如果 SSDP 发现失败，请指定 `--ip <扬声器 IP>`。
- Spotify Web API 搜索是可选的，需要设置 `SPOTIFY_CLIENT_ID/SECRET`。
