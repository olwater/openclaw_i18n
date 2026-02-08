---
name: local-places
description: 通过 localhost 上的 Google Places API 代理搜索地点（餐厅、咖啡馆等）。
homepage: https://github.com/Hyaxia/local_places
metadata:
  {
    "openclaw":
      {
        "emoji": "📍",
        "requires": { "bins": ["uv"], "env": ["GOOGLE_PLACES_API_KEY"] },
        "primaryEnv": "GOOGLE_PLACES_API_KEY",
      },
  }
---

# 📍 Local Places

_Find places, Go fast_

使用本地 Google Places API 代理搜索附近地点。两步流程：先解析位置，再进行搜索。

## 设置

```bash
cd {baseDir}
echo "GOOGLE_PLACES_API_KEY=your-key" > .env
uv venv && uv pip install -e ".[dev]"
uv run --env-file .env uvicorn local_places.main:app --host 127.0.0.1 --port 8000
```

需要在 `.env` 或环境变量中设置 `GOOGLE_PLACES_API_KEY`。

## 快速开始

1. **检查服务器：** `curl http://127.0.0.1:8000/ping`

2. **解析位置：**

```bash
curl -X POST http://127.0.0.1:8000/locations/resolve \
  -H "Content-Type: application/json" \
  -d '{"location_text": "Soho, London", "limit": 5}'
```

3. **搜索地点：**

```bash
curl -X POST http://127.0.0.1:8000/places/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "咖啡店",
    "location_bias": {"lat": 51.5137, "lng": -0.1366, "radius_m": 1000},
    "filters": {"open_now": true, "min_rating": 4.0},
    "limit": 10
  }'
```

4. **获取详情：**

```bash
curl http://127.0.0.1:8000/places/{place_id}
```

## 对话流程

1. 如果用户说“我附近”或给出模糊位置 → 先解析该位置。
2. 如果存在多个结果 → 显示编号列表，请用户选择。
3. 询问偏好：类型、是否正在营业、评分、价格等级。
4. 使用所选位置的 `location_bias` 进行搜索。
5. 展示结果，包括名称、评分、地址和营业状态。
6. 提供获取详情或细化搜索的选项。

## 过滤约束

- `filters.types`: 仅限一个类型（如 "restaurant"、"cafe"、"gym"）。
- `filters.price_levels`: 整数 0-4（0=免费，4=非常昂贵）。
- `filters.min_rating`: 0-5 之间的数值，步长为 0.5。
- `filters.open_now`: 布尔值。
- `limit`: 搜索限制为 1-20，解析限制为 1-10。
- `location_bias.radius_m`: 必须 > 0。

## 响应格式

```json
{
  "results": [
    {
      "place_id": "ChIJ...",
      "name": "Coffee Shop",
      "address": "123 Main St",
      "location": { "lat": 51.5, "lng": -0.1 },
      "rating": 4.6,
      "price_level": 2,
      "types": ["cafe", "food"],
      "open_now": true
    }
  ],
  "next_page_token": "..."
}
```

在下次请求中使用 `next_page_token` 作为 `page_token` 以获取更多结果。
