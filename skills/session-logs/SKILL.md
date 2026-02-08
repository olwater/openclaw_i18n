---
name: session-logs
description: 使用 jq 搜索和分析你自己的会话日志（旧的/父级对话）。
metadata: { "openclaw": { "emoji": "📜", "requires": { "bins": ["jq", "rg"] } } }
---

# session-logs

搜索存储在会话 JSONL 文件中的完整对话历史记录。当用户引用旧的/父级对话或询问之前说过什么时使用。

## 触发场景

当用户询问以前的聊天、父级对话或 memory 文件中不存在的历史背景时，请使用此技能。

## 位置

会话日志位于：`~/.openclaw/agents/<agentId>/sessions/`（使用系统提示词 Runtime 行中的 `agent=<id>` 值）。

- **`sessions.json`** - 将会话密钥映射到会话 ID 的索引
- **`<session-id>.jsonl`** - 每个会话的完整对话记录

## 结构

每个 `.jsonl` 文件包含的消息具有以下字段：

- `type`: "session" (元数据) 或 "message"
- `timestamp`: ISO 时间戳
- `message.role`: "user"、"assistant" 或 "toolResult"
- `message.content[]`: 文本、思考过程或工具调用（过滤 `type=="text"` 可获取人类可读的内容）
- `message.usage.cost.total`: 每次回复的费用

## 常用查询

### 按日期和大小列出所有会话

```bash
for f in ~/.openclaw/agents/<agentId>/sessions/*.jsonl; do
  date=$(head -1 "$f" | jq -r '.timestamp' | cut -dT -f1)
  size=$(ls -lh "$f" | awk '{print $5}')
  echo "$date $size $(basename $f)"
done | sort -r
```

### 查找特定日期的会话

```bash
for f in ~/.openclaw/agents/<agentId>/sessions/*.jsonl; do
  head -1 "$f" | jq -r '.timestamp' | grep -q "2026-01-06" && echo "$f"
done
```

### 从会话中提取用户消息

```bash
jq -r 'select(.message.role == "user") | .message.content[]? | select(.type == "text") | .text' <session>.jsonl
```

### 在助手回复中搜索关键词

```bash
jq -r 'select(.message.role == "assistant") | .message.content[]? | select(.type == "text") | .text' <session>.jsonl | rg -i "关键词"
```

### 获取会话的总费用

```bash
jq -s '[.[] | .message.usage.cost.total // 0] | add' <session>.jsonl
```

### 每日费用汇总

```bash
for f in ~/.openclaw/agents/<agentId>/sessions/*.jsonl; do
  date=$(head -1 "$f" | jq -r '.timestamp' | cut -dT -f1)
  cost=$(jq -s '[.[] | .message.usage.cost.total // 0] | add' "$f")
  echo "$date $cost"
done | awk '{a[$1]+=$2} END {for(d in a) print d, "$"a[d]}' | sort -r
```

### 统计会话中的消息数和 Token 数

```bash
jq -s '{
  messages: length,
  user: [.[] | select(.message.role == "user")] | length,
  assistant: [.[] | select(.message.role == "assistant")] | length,
  first: .[0].timestamp,
  last: .[-1].timestamp
}' <session>.jsonl
```

### 工具使用情况明细

```bash
jq -r '.message.content[]? | select(.type == "toolCall") | .name' <session>.jsonl | sort | uniq -c | sort -rn
```

### 在所有会话中搜索短语

```bash
rg -l "短语" ~/.openclaw/agents/<agentId>/sessions/*.jsonl
```

## 提示

- 会话是仅追加（append-only）的 JSONL 文件（每行一个 JSON 对象）。
- 大型会话可能有几 MB 大——请使用 `head`/`tail` 进行采样。
- `sessions.json` 索引将聊天提供商（Discord、WhatsApp 等）映射到会话 ID。
- 已删除的会话具有 `.deleted.<timestamp>` 后缀。

## 快速纯文本提示（低噪）

```bash
jq -r 'select(.type=="message") | .message.content[]? | select(.type=="text") | .text' ~/.openclaw/agents/<agentId>/sessions/<id>.jsonl | rg '关键词'
```
