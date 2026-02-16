import type {
  ChannelOnboardingAdapter,
  ChannelOnboardingDmPolicy,
  ClawdbotConfig,
  DmPolicy,
  WizardPrompter,
} from "openclaw/plugin-sdk";
import { addWildcardAllowFrom, DEFAULT_ACCOUNT_ID, formatDocsLink } from "openclaw/plugin-sdk";
import type { FeishuConfig } from "./types.js";
import { resolveFeishuCredentials } from "./accounts.js";
import { probeFeishu } from "./probe.js";

const channel = "feishu" as const;

function setFeishuDmPolicy(cfg: ClawdbotConfig, dmPolicy: DmPolicy): ClawdbotConfig {
  const allowFrom =
    dmPolicy === "open"
      ? addWildcardAllowFrom(cfg.channels?.feishu?.allowFrom)?.map((entry) => String(entry))
      : undefined;
  return {
    ...cfg,
    channels: {
      ...cfg.channels,
      feishu: {
        ...cfg.channels?.feishu,
        dmPolicy,
        ...(allowFrom ? { allowFrom } : {}),
      },
    },
  };
}

function setFeishuAllowFrom(cfg: ClawdbotConfig, allowFrom: string[]): ClawdbotConfig {
  return {
    ...cfg,
    channels: {
      ...cfg.channels,
      feishu: {
        ...cfg.channels?.feishu,
        allowFrom,
      },
    },
  };
}

function parseAllowFromInput(raw: string): string[] {
  return raw
    .split(/[\n,;]+/g)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

async function promptFeishuAllowFrom(params: {
  cfg: ClawdbotConfig;
  prompter: WizardPrompter;
}): Promise<ClawdbotConfig> {
  const existing = params.cfg.channels?.feishu?.allowFrom ?? [];
  await params.prompter.note(
    [
      "通过 open_id 或 user_id 设置飞书私聊白名单。",
      "您可以在飞书管理后台或通过 API 找到用户的 open_id。",
      "示例:",
      "- ou_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "- on_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    ].join("\n"),
    "飞书白名单 (Feishu allowlist)",
  );

  while (true) {
    const entry = await params.prompter.text({
      message: "飞书允许列表 (用户 open_id)",
      placeholder: "ou_xxxxx, ou_yyyyy",
      initialValue: existing[0] ? String(existing[0]) : undefined,
      validate: (value) => (String(value ?? "").trim() ? undefined : "必填项 (Required)"),
    });
    const parts = parseAllowFromInput(String(entry));
    if (parts.length === 0) {
      await params.prompter.note("请输入至少一个用户。", "飞书白名单");
      continue;
    }

    const unique = [
      ...new Set([
        ...existing.map((v: string | number) => String(v).trim()).filter(Boolean),
        ...parts,
      ]),
    ];
    return setFeishuAllowFrom(params.cfg, unique);
  }
}

async function noteFeishuCredentialHelp(prompter: WizardPrompter): Promise<void> {
  await prompter.note(
    [
      "1) 前往飞书开放平台 (open.feishu.cn)",
      "2) 创建一个自建应用",
      "3) 在“凭证与基础信息”页获取 App ID 和 App Secret",
      "4) 启用必要权限: im:message, im:chat, contact:user.base:readonly",
      "5) 发布应用或将其添加到测试企业/测试群",
      "提示: 您也可以设置 FEISHU_APP_ID / FEISHU_APP_SECRET 环境变量。",
      `文档: ${formatDocsLink("/channels/feishu", "feishu")}`,
    ].join("\n"),
    "飞书凭证指南",
  );
}

function setFeishuGroupPolicy(
  cfg: ClawdbotConfig,
  groupPolicy: "open" | "allowlist" | "disabled",
): ClawdbotConfig {
  return {
    ...cfg,
    channels: {
      ...cfg.channels,
      feishu: {
        ...cfg.channels?.feishu,
        enabled: true,
        groupPolicy,
      },
    },
  };
}

function setFeishuGroupAllowFrom(cfg: ClawdbotConfig, groupAllowFrom: string[]): ClawdbotConfig {
  return {
    ...cfg,
    channels: {
      ...cfg.channels,
      feishu: {
        ...cfg.channels?.feishu,
        groupAllowFrom,
      },
    },
  };
}

const dmPolicy: ChannelOnboardingDmPolicy = {
  label: "Feishu (飞书)",
  channel,
  policyKey: "channels.feishu.dmPolicy",
  allowFromKey: "channels.feishu.allowFrom",
  getCurrent: (cfg) => (cfg.channels?.feishu as FeishuConfig | undefined)?.dmPolicy ?? "pairing",
  setPolicy: (cfg, policy) => setFeishuDmPolicy(cfg, policy),
  promptAllowFrom: promptFeishuAllowFrom,
};

export const feishuOnboardingAdapter: ChannelOnboardingAdapter = {
  channel,
  getStatus: async ({ cfg }) => {
    const feishuCfg = cfg.channels?.feishu as FeishuConfig | undefined;
    const configured = Boolean(resolveFeishuCredentials(feishuCfg));

    // Try to probe if configured
    let probeResult = null;
    if (configured && feishuCfg) {
      try {
        probeResult = await probeFeishu(feishuCfg);
      } catch {
        // Ignore probe errors
      }
    }

    const statusLines: string[] = [];
    if (!configured) {
      statusLines.push("Feishu: 需要应用凭证 (needs app credentials)");
    } else if (probeResult?.ok) {
      statusLines.push(
        `Feishu: 已连接为 ${probeResult.botName ?? probeResult.botOpenId ?? "bot"}`,
      );
    } else {
      statusLines.push("Feishu: 已配置 (连接未验证)");
    }

    return {
      channel,
      configured,
      statusLines,
      selectionHint: configured ? "已配置" : "需要凭证",
      quickstartScore: configured ? 2 : 0,
    };
  },

  configure: async ({ cfg, prompter }) => {
    const feishuCfg = cfg.channels?.feishu as FeishuConfig | undefined;
    const resolved = resolveFeishuCredentials(feishuCfg);
    const hasConfigCreds = Boolean(feishuCfg?.appId?.trim() && feishuCfg?.appSecret?.trim());
    const canUseEnv = Boolean(
      !hasConfigCreds && process.env.FEISHU_APP_ID?.trim() && process.env.FEISHU_APP_SECRET?.trim(),
    );

    let next = cfg;
    let appId: string | null = null;
    let appSecret: string | null = null;

    if (!resolved) {
      await noteFeishuCredentialHelp(prompter);
    }

    if (canUseEnv) {
      const keepEnv = await prompter.confirm({
        message: "检测到 FEISHU_APP_ID + FEISHU_APP_SECRET 环境变量。是否使用？",
        initialValue: true,
      });
      if (keepEnv) {
        next = {
          ...next,
          channels: {
            ...next.channels,
            feishu: { ...next.channels?.feishu, enabled: true },
          },
        };
      } else {
        appId = String(
          await prompter.text({
            message: "请输入飞书 App ID",
            validate: (value) => (value?.trim() ? undefined : "必填项"),
          }),
        ).trim();
        appSecret = String(
          await prompter.text({
            message: "请输入飞书 App Secret",
            validate: (value) => (value?.trim() ? undefined : "必填项"),
          }),
        ).trim();
      }
    } else if (hasConfigCreds) {
      const keep = await prompter.confirm({
        message: "飞书凭证已配置。是否保留？",
        initialValue: true,
      });
      if (!keep) {
        appId = String(
          await prompter.text({
            message: "请输入飞书 App ID",
            validate: (value) => (value?.trim() ? undefined : "必填项"),
          }),
        ).trim();
        appSecret = String(
          await prompter.text({
            message: "请输入飞书 App Secret",
            validate: (value) => (value?.trim() ? undefined : "必填项"),
          }),
        ).trim();
      }
    } else {
      appId = String(
        await prompter.text({
          message: "请输入飞书 App ID",
          validate: (value) => (value?.trim() ? undefined : "必填项"),
        }),
      ).trim();
      appSecret = String(
        await prompter.text({
          message: "请输入飞书 App Secret",
          validate: (value) => (value?.trim() ? undefined : "必填项"),
        }),
      ).trim();
    }

    if (appId && appSecret) {
      next = {
        ...next,
        channels: {
          ...next.channels,
          feishu: {
            ...next.channels?.feishu,
            enabled: true,
            appId,
            appSecret,
          },
        },
      };

      // Test connection
      const testCfg = next.channels?.feishu as FeishuConfig;
      try {
        const probe = await probeFeishu(testCfg);
        if (probe.ok) {
          await prompter.note(
            `已连接为 ${probe.botName ?? probe.botOpenId ?? "bot"}`,
            "飞书连接测试成功",
          );
        } else {
          await prompter.note(
            `连接失败: ${probe.error ?? "未知错误"}`,
            "飞书连接测试失败",
          );
        }
      } catch (err) {
        await prompter.note(`连接测试出错: ${String(err)}`, "飞书连接测试");
      }
    }

    // Domain selection
    const currentDomain = (next.channels?.feishu as FeishuConfig | undefined)?.domain ?? "feishu";
    const domain = await prompter.select({
      message: "选择飞书域名 (Which Feishu domain?)",
      options: [
        { value: "feishu", label: "飞书 (feishu.cn) - 国内版" },
        { value: "lark", label: "Lark (larksuite.com) - 国际版" },
      ],
      initialValue: currentDomain,
    });
    if (domain) {
      next = {
        ...next,
        channels: {
          ...next.channels,
          feishu: {
            ...next.channels?.feishu,
            domain: domain as "feishu" | "lark",
          },
        },
      };
    }

    // Group policy
    const groupPolicy = await prompter.select({
      message: "群聊策略 (Group chat policy)",
      options: [
        { value: "allowlist", label: "白名单 - 仅在特定群组响应 (Allowlist)" },
        { value: "open", label: "公开 - 在所有群组响应 (需 @机器人) (Open)" },
        { value: "disabled", label: "禁用 - 不在群组响应 (Disabled)" },
      ],
      initialValue: (next.channels?.feishu as FeishuConfig | undefined)?.groupPolicy ?? "allowlist",
    });
    if (groupPolicy) {
      next = setFeishuGroupPolicy(next, groupPolicy as "open" | "allowlist" | "disabled");
    }

    // Group allowlist if needed
    if (groupPolicy === "allowlist") {
      const existing = (next.channels?.feishu as FeishuConfig | undefined)?.groupAllowFrom ?? [];
      
      await prompter.note(
        [
          "请配置允许机器人响应的群组 ID (chat_id)。",
          "您可以通过 API 获取 chat_id，或者在群里 @机器人 查看日志。",
          "支持一次输入多个 ID（逗号分隔）。"
        ].join("\n"),
        "群聊白名单设置"
      );

      while (true) {
         const entry = await prompter.text({
          message: "添加群组 ID (留空完成设置)",
          placeholder: "oc_xxxxx, oc_yyyyy",
          initialValue: existing.length > 0 ? existing.map(String).join(", ") : undefined,
        });

        if (!entry || !entry.trim()) {
          // If list is empty and user tries to finish, confirm
          const currentList = (next.channels?.feishu as FeishuConfig | undefined)?.groupAllowFrom ?? [];
          if (currentList.length === 0) {
             const confirmEmpty = await prompter.confirm({
               message: "白名单为空，机器人将不会在任何群组响应。确认吗？",
               initialValue: false,
             });
             if (!confirmEmpty) {
               continue;
             }
          }
           break;
        }

        const parts = parseAllowFromInput(String(entry));
        if (parts.length > 0) {
           // Merge and update
           const current = (next.channels?.feishu as FeishuConfig | undefined)?.groupAllowFrom ?? [];
           const unique = [
             ...new Set([
               ...current.map((v: string | number) => String(v).trim()).filter(Boolean),
               ...parts,
             ]),
           ];
           next = setFeishuGroupAllowFrom(next, unique);
           
           await prompter.note(`已添加 ${parts.length} 个群组。当前共有 ${unique.length} 个允许群组。`, "添加成功");
           // Loop continues to allow adding more or reviewing
           // Reset explicit existing value display to avoid confusion or keep it? 
           // Better to clear initialValue or update it. 
           // Since we can't easily update the prompt instance's initialValue in a loop without re-calling text(),
           // we just rely on the user inputting more or pressing enter to finish.
        }
      }
    }

    return { cfg: next, accountId: DEFAULT_ACCOUNT_ID };
  },

  dmPolicy,

  disable: (cfg) => ({
    ...cfg,
    channels: {
      ...cfg.channels,
      feishu: { ...cfg.channels?.feishu, enabled: false },
    },
  }),
};
