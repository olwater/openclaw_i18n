---
name: ordercli
description: 仅限 Foodora 的 CLI，用于检查过往订单和当前订单状态（Deliveroo 正在开发中）。
homepage: https://ordercli.sh
metadata:
  {
    "openclaw":
      {
        "emoji": "🛵",
        "requires": { "bins": ["ordercli"] },
        "install":
          [
            {
              "id": "brew",
              "kind": "brew",
              "formula": "steipete/tap/ordercli",
              "bins": ["ordercli"],
              "label": "安装 ordercli (brew)",
            },
            {
              "id": "go",
              "kind": "go",
              "module": "github.com/steipete/ordercli/cmd/ordercli@latest",
              "bins": ["ordercli"],
              "label": "安装 ordercli (go)",
            },
          ],
      },
  }
---

# ordercli

使用 `ordercli` 检查过往订单并追踪当前订单状态（目前仅支持 Foodora）。

## 快速开始 (Foodora)

- `ordercli foodora countries`
- `ordercli foodora config set --country AT`
- `ordercli foodora login --email you@example.com --password-stdin`
- `ordercli foodora orders`
- `ordercli foodora history --limit 20`
- `ordercli foodora history show <orderCode>`

## 订单

- 当前列表（送达时间/状态）：`ordercli foodora orders`
- 监视：`ordercli foodora orders --watch`
- 当前订单详情：`ordercli foodora order <orderCode>`
- 历史详情 JSON：`ordercli foodora history show <orderCode> --json`

## 再次下单（添加到购物车）

- 预览：`ordercli foodora reorder <orderCode>`
- 确认：`ordercli foodora reorder <orderCode> --confirm`
- 地址：`ordercli foodora reorder <orderCode> --confirm --address-id <id>`

## Cloudflare / 机器人防护

- 浏览器登录：`ordercli foodora login --email you@example.com --password-stdin --browser`
- 复用配置文件：`--browser-profile "$HOME/Library/Application Support/ordercli/browser-profile"`
- 导入 Chrome Cookie：`ordercli foodora cookies chrome --profile "Default"`

## 会话导入（无需密码）

- `ordercli foodora session chrome --url https://www.foodora.at/ --profile "Default"`
- `ordercli foodora session refresh --client-id android`

## Deliveroo（开发中，尚不可用）

- 需要 `DELIVEROO_BEARER_TOKEN`（可选 `DELIVEROO_COOKIE`）。
- `ordercli deliveroo config set --market uk`
- `ordercli deliveroo history`

## 注意事项

- 使用 `--config /tmp/ordercli.json` 进行测试。
- 在进行任何再次下单或更改购物车的操作之前，请务必确认。
