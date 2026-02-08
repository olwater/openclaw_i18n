---
name: notion
description: 用于创建和管理页面、数据库和块的 Notion API。
homepage: https://developers.notion.com
metadata:
  {
    "openclaw":
      { "emoji": "📝", "requires": { "env": ["NOTION_API_KEY"] }, "primaryEnv": "NOTION_API_KEY" },
  }
---

# notion

使用 Notion API 创建、读取和更新页面、数据源（数据库）以及块（Block）。

## 设置

1. 在 https://notion.so/my-integrations 创建一个集成（integration）。
2. 复制 API 密钥（以 `ntn_` 或 `secret_` 开头）。
3. 保存它：

```bash
mkdir -p ~/.config/notion
echo "ntn_your_key_here" > ~/.config/notion/api_key
```

4. 将目标页面/数据库共享给你的集成（点击 "..." → "Connect to" → 你的集成名称）。

## API 基础

所有请求都需要：

```bash
NOTION_KEY=$(cat ~/.config/notion/api_key)
curl -X GET "https://api.notion.com/v1/..." \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2025-09-03" \
  -H "Content-Type: application/json"
```

> **注意：** `Notion-Version` 请求头是必填的。本技能使用 `2025-09-03`（最新版本）。在此版本中，API 将数据库称为“数据源（data sources）”。

## 常用操作

**搜索页面和数据源：**

```bash
curl -X POST "https://api.notion.com/v1/search" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2025-09-03" \
  -H "Content-Type: application/json" \
  -d '{"query": "页面标题"}'
```

**获取页面：**

```bash
curl "https://api.notion.com/v1/pages/{page_id}" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2025-09-03"
```

**获取页面内容（块）：**

```bash
curl "https://api.notion.com/v1/blocks/{page_id}/children" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2025-09-03"
```

**在数据源中创建页面：**

```bash
curl -X POST "https://api.notion.com/v1/pages" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2025-09-03" \
  -H "Content-Type: application/json" \
  -d '{
    "parent": {"database_id": "xxx"},
    "properties": {
      "Name": {"title": [{"text": {"content": "新项目"}}]},
      "Status": {"select": {"name": "Todo"}}
    }
  }'
```

**查询数据源（数据库）：**

```bash
curl -X POST "https://api.notion.com/v1/data_sources/{data_source_id}/query" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2025-09-03" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {"property": "Status", "select": {"equals": "Active"}},
    "sorts": [{"property": "Date", "direction": "descending"}]
  }'
```

**创建数据源（数据库）：**

```bash
curl -X POST "https://api.notion.com/v1/data_sources" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2025-09-03" \
  -H "Content-Type: application/json" \
  -d '{
    "parent": {"page_id": "xxx"},
    "title": [{"text": {"content": "我的数据库"}}],
    "properties": {
      "Name": {"title": {}},
      "Status": {"select": {"options": [{"name": "Todo"}, {"name": "Done"}]}},
      "Date": {"date": {}}
    }
  }'
```

**更新页面属性：**

```bash
curl -X PATCH "https://api.notion.com/v1/pages/{page_id}" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2025-09-03" \
  -H "Content-Type: application/json" \
  -d '{"properties": {"Status": {"select": {"name": "Done"}}}}'
```

**向页面添加块：**

```bash
curl -X PATCH "https://api.notion.com/v1/blocks/{page_id}/children" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2025-09-03" \
  -H "Content-Type: application/json" \
  -d '{
    "children": [
      {"object": "block", "type": "paragraph", "paragraph": {"rich_text": [{"text": {"content": "你好"}}]}}
    ]
  }'
```

## 属性类型

数据库项目的常用属性格式：

- **标题 (Title):** `{"title": [{"text": {"content": "..."}}]}`
- **富文本 (Rich text):** `{"rich_text": [{"text": {"content": "..."}}]}`
- **单选 (Select):** `{"select": {"name": "Option"}}`
- **多选 (Multi-select):** `{"multi_select": [{"name": "A"}, {"name": "B"}]}`
- **日期 (Date):** `{"date": {"start": "2024-01-15", "end": "2024-01-16"}}`
- **复选框 (Checkbox):** `{"checkbox": true}`
- **数字 (Number):** `{"number": 42}`
- **URL:** `{"url": "https://..."}`
- **电子邮件 (Email):** `{"email": "a@b.com"}`
- **关联 (Relation):** `{"relation": [{"id": "page_id"}]}`

## 2025-09-03 版本的主要差异

- **数据库 → 数据源：** 使用 `/data_sources/` 端点进行查询和获取。
- **两个 ID：** 现在每个数据库都同时拥有 `database_id` 和 `data_source_id`。
  - 创建页面时使用 `database_id` (`parent: {"database_id": "..."}`)。
  - 查询时使用 `data_source_id` (`POST /v1/data_sources/{id}/query`)。
- **搜索结果：** 数据库作为 `"object": "data_source"` 返回，并带有其 `data_source_id`。
- **响应中的父级：** 页面会同时显示 `parent.data_source_id` 和 `parent.database_id`。
- **查找 data_source_id：** 搜索该数据库，或调用 `GET /v1/data_sources/{data_source_id}`。

## 注意事项

- 页面/数据库 ID 是 UUID（带或不带连字符均可）。
- API 无法设置数据库视图过滤器——那是 UI 专属功能。
- 速率限制：平均每秒约 3 个请求。
- 创建数据源时使用 `is_inline: true` 可将其嵌入到页面中。
