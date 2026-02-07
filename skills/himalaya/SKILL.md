---
name: himalaya
description: "通过 IMAP/SMTP 管理电子邮件的 CLI。使用 `himalaya` 从终端列出、阅读、编写、回复、转发、搜索和组织电子邮件。支持多个帐户和使用 MML (MIME Meta Language) 编写消息。"
homepage: https://github.com/pimalaya/himalaya
metadata:
  {
    "openclaw":
      {
        "emoji": "📧",
        "requires": { "bins": ["himalaya"] },
        "install":
          [
            {
              "id": "brew",
              "kind": "brew",
              "formula": "himalaya",
              "bins": ["himalaya"],
              "label": "安装 Himalaya (brew)",
            },
          ],
      },
  }
---

# Himalaya Email CLI

Himalaya 是一个 CLI 电子邮件客户端，允许您使用 IMAP、SMTP、Notmuch 或 Sendmail 后端从终端管理电子邮件。

## 参考

- `references/configuration.md`（配置文件设置 + IMAP/SMTP 认证）
- `references/message-composition.md`（用于编写电子邮件的 MML 语法）

## 先决条件

1. 安装 Himalaya CLI（使用 `himalaya --version` 验证）
2. 位于 `~/.config/himalaya/config.toml` 的配置文件
3. 配置 IMAP/SMTP 凭据（安全存储密码）

## 配置设置

运行交互式向导来设置帐户：

```bash
himalaya account configure
```

或者手动创建 `~/.config/himalaya/config.toml`：

```toml
[accounts.personal]
email = "you@example.com"
display-name = "Your Name"
default = true

backend.type = "imap"
backend.host = "imap.example.com"
backend.port = 993
backend.encryption.type = "tls"
backend.login = "you@example.com"
backend.auth.type = "password"
backend.auth.cmd = "pass show email/imap"  # or use keyring

message.send.backend.type = "smtp"
message.send.backend.host = "smtp.example.com"
message.send.backend.port = 587
message.send.backend.encryption.type = "start-tls"
message.send.backend.login = "you@example.com"
message.send.backend.auth.type = "password"
message.send.backend.auth.cmd = "pass show email/smtp"
```

## 常用操作

### 列出文件夹

```bash
himalaya folder list
```

### 列出电子邮件

列出收件箱中的邮件（默认）：

```bash
himalaya envelope list
```

列出特定文件夹中的邮件：

```bash
himalaya envelope list --folder "Sent"
```

带分页的列表：

```bash
himalaya envelope list --page 1 --page-size 20
```

### 搜索电子邮件

```bash
himalaya envelope list from john@example.com subject meeting
```

### 阅读电子邮件

按 ID 阅读邮件（显示纯文本）：

```bash
himalaya message read 42
```

导出原始 MIME：

```bash
himalaya message export 42 --full
```

### 回复电子邮件

交互式回复（打开 $EDITOR）：

```bash
himalaya message reply 42
```

回复全部：

```bash
himalaya message reply 42 --all
```

### 转发电子邮件

```bash
himalaya message forward 42
```

### 编写新电子邮件

交互式编写（打开 $EDITOR）：

```bash
himalaya message write
```

使用模板直接发送：

```bash
cat << 'EOF' | himalaya template send
From: you@example.com
To: recipient@example.com
Subject: Test Message

Hello from Himalaya!
EOF
```

或者使用 header 标志：

```bash
himalaya message write -H "To:recipient@example.com" -H "Subject:Test" "Message body here"
```

### 移动/复制电子邮件

移动到文件夹：

```bash
himalaya message move 42 "Archive"
```

复制到文件夹：

```bash
himalaya message copy 42 "Important"
```

### 删除电子邮件

```bash
himalaya message delete 42
```

### 管理标志（Flags）

添加标志：

```bash
himalaya flag add 42 --flag seen
```

移除标志：

```bash
himalaya flag remove 42 --flag seen
```

## 多帐户

列出帐户：

```bash
himalaya account list
```

使用特定帐户：

```bash
himalaya --account work envelope list
```

## 附件

从消息中保存附件：

```bash
himalaya attachment download 42
```

保存到特定目录：

```bash
himalaya attachment download 42 --dir ~/Downloads
```

## 输出格式

大多数命令支持 `--output` 以进行结构化输出：

```bash
himalaya envelope list --output json
himalaya envelope list --output plain
```

## 调试

启用调试日志：

```bash
RUST_LOG=debug himalaya envelope list
```

带回溯的完整跟踪：

```bash
RUST_LOG=trace RUST_BACKTRACE=1 himalaya envelope list
```

## 提示

- 使用 `himalaya --help` 或 `himalaya <command> --help` 获取详细用法。
- 消息 ID 相对于当前文件夹；更改文件夹后请重新列出。
- 要编写带有附件的富文本电子邮件，请使用 MML 语法（参见 `references/message-composition.md`）。
- 使用 `pass`、系统密钥环或输出密码的命令安全地存储密码。
