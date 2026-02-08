---
name: food-order
description: 使用 ordercli 重新订购 Foodora 订单 + 追踪送达时间 (ETA)/状态。未经用户明确许可，切勿执行确认操作。触发器：订餐、再次下单、追踪送达时间。
homepage: https://ordercli.sh
metadata:
  {
    "openclaw":
      {
        "emoji": "🥡",
        "requires": { "bins": ["ordercli"] },
        "install":
          [
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

# 订餐 (通过 ordercli 的 Foodora)

目标：安全地再次订购之前的 Foodora 订单（先预览；仅在用户明确表示“是/确认/下单”时才确认）。

## 硬性安全规则

- **严禁**运行 `ordercli foodora reorder ... --confirm`，除非用户明确确认要下单。
- 优先执行仅预览步骤；向用户展示将要发生的操作；请求用户确认。
- 如果用户不确定：停在预览步骤并进行询问。

## 设置（仅需一次）

- 国家：`ordercli foodora countries` → `ordercli foodora config set --country AT`
- 登录（密码方式）：`ordercli foodora login --email you@example.com --password-stdin`
- 登录（免密方式，首选）：`ordercli foodora session chrome --url https://www.foodora.at/ --profile "Default"`

## 查找要再次下单的项目

- 最近列表：`ordercli foodora history --limit 10`
- 详情：`ordercli foodora history show <orderCode>`
- 如果需要（机器可读）：`ordercli foodora history show <orderCode> --json`

## 预览再次下单（不更改购物车）

- `ordercli foodora reorder <orderCode>`

## 正式下单（更改购物车；需要明确确认）

- **先确认**，然后运行：`ordercli foodora reorder <orderCode> --confirm`
- 存在多个地址？询问用户正确的 `--address-id`（从其 Foodora 账户 / 之前的订单数据中获取）并运行：
  - `ordercli foodora reorder <orderCode> --confirm --address-id <id>`

## 追踪订单

- 送达时间 (ETA)/状态（当前列表）：`ordercli foodora orders`
- 实时更新：`ordercli foodora orders --watch`
- 单个订单详情：`ordercli foodora order <orderCode>`

## 调试 / 安全测试

- 使用临时配置：`ordercli --config /tmp/ordercli.json ...`
