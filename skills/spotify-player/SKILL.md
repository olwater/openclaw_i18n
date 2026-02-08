---
name: spotify-player
description: 通过 spogo（首选）或 spotify_player 进行终端 Spotify 播放/搜索。
homepage: https://www.spotify.com
metadata:
  {
    "openclaw":
      {
        "emoji": "🎵",
        "requires": { "anyBins": ["spogo", "spotify_player"] },
        "install":
          [
            {
              "id": "brew",
              "kind": "brew",
              "formula": "spogo",
              "tap": "steipete/tap",
              "bins": ["spogo"],
              "label": "安装 spogo (brew)",
            },
            {
              "id": "brew",
              "kind": "brew",
              "formula": "spotify_player",
              "bins": ["spotify_player"],
              "label": "安装 spotify_player (brew)",
            },
          ],
      },
  }
---

# spogo / spotify_player

使用 `spogo` **（首选）** 进行 Spotify 播放/搜索。如果需要，可回退到 `spotify_player`。

## 要求

- Spotify Premium 帐户。
- 已安装 `spogo` 或 `spotify_player`。

## spogo 设置

- 导入 Cookie：`spogo auth import --browser chrome`

## 常用 CLI 命令

- 搜索：`spogo search track "查询内容"`
- 播放控制：`spogo play|pause|next|prev`
- 设备：`spogo device list`，`spogo device set "<名称|ID>"`
- 状态：`spogo status`

## spotify_player 命令（回退）

- 搜索：`spotify_player search "查询内容"`
- 播放控制：`spotify_player playback play|pause|next|previous`
- 连接设备：`spotify_player connect`
- 收藏歌曲：`spotify_player like`

## 注意事项

- 配置文件夹：`~/.config/spotify-player`（例如 `app.toml`）。
- 要集成 Spotify Connect，请在配置中设置用户 `client_id`。
- 在应用中按 `?` 可查看 TUI 快捷键。
