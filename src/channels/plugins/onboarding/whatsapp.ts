import path from "node:path";
import type { OpenClawConfig } from "../../../config/config.js";
import type { DmPolicy } from "../../../config/types.js";
import type { RuntimeEnv } from "../../../runtime.js";
import type { WizardPrompter } from "../../../wizard/prompts.js";
import type { ChannelOnboardingAdapter } from "../onboarding-types.js";
import { loginWeb } from "../../../channel-web.js";
import { formatCliCommand } from "../../../cli/command-format.js";
import { mergeWhatsAppConfig } from "../../../config/merge-config.js";
import { t } from "../../../i18n/index.js";
import { DEFAULT_ACCOUNT_ID, normalizeAccountId } from "../../../routing/session-key.js";
import { formatDocsLink } from "../../../terminal/links.js";
import { normalizeE164, pathExists } from "../../../utils.js";
import {
  listWhatsAppAccountIds,
  resolveDefaultWhatsAppAccountId,
  resolveWhatsAppAuthDir,
} from "../../../web/accounts.js";
import { promptAccountId } from "./helpers.js";

const channel = "whatsapp" as const;

function setWhatsAppDmPolicy(cfg: OpenClawConfig, dmPolicy: DmPolicy): OpenClawConfig {
  return mergeWhatsAppConfig(cfg, { dmPolicy });
}

function setWhatsAppAllowFrom(cfg: OpenClawConfig, allowFrom?: string[]): OpenClawConfig {
  return mergeWhatsAppConfig(cfg, { allowFrom }, { unsetOnUndefined: ["allowFrom"] });
}

function setWhatsAppSelfChatMode(cfg: OpenClawConfig, selfChatMode: boolean): OpenClawConfig {
  return mergeWhatsAppConfig(cfg, { selfChatMode });
}

async function detectWhatsAppLinked(cfg: OpenClawConfig, accountId: string): Promise<boolean> {
  const { authDir } = resolveWhatsAppAuthDir({ cfg, accountId });
  const credsPath = path.join(authDir, "creds.json");
  return await pathExists(credsPath);
}

async function promptWhatsAppOwnerAllowFrom(params: {
  prompter: WizardPrompter;
  existingAllowFrom: string[];
}): Promise<{ normalized: string; allowFrom: string[] }> {
  const { prompter, existingAllowFrom } = params;

  await prompter.note(
    "We need the sender/owner number so OpenClaw can allowlist you.",
    "WhatsApp number",
  );
  const entry = await prompter.text({
    message: "Your personal WhatsApp number (the phone you will message from)",
    placeholder: "+15555550123",
    initialValue: existingAllowFrom[0],
    validate: (value) => {
      const raw = String(value ?? "").trim();
      if (!raw) {
        return "Required";
      }
      const normalized = normalizeE164(raw);
      if (!normalized) {
        return `Invalid number: ${raw}`;
      }
      return undefined;
    },
  });

  const normalized = normalizeE164(String(entry).trim());
  if (!normalized) {
    throw new Error("Invalid WhatsApp owner number (expected E.164 after validation).");
  }
  const merged = [
    ...existingAllowFrom
      .filter((item) => item !== "*")
      .map((item) => normalizeE164(item))
      .filter(Boolean),
    normalized,
  ];
  const allowFrom = [...new Set(merged.filter(Boolean))];
  return { normalized, allowFrom };
}

async function applyWhatsAppOwnerAllowlist(params: {
  cfg: OpenClawConfig;
  prompter: WizardPrompter;
  existingAllowFrom: string[];
  title: string;
  messageLines: string[];
}): Promise<OpenClawConfig> {
  const { normalized, allowFrom } = await promptWhatsAppOwnerAllowFrom({
    prompter: params.prompter,
    existingAllowFrom: params.existingAllowFrom,
  });
  let next = setWhatsAppSelfChatMode(params.cfg, true);
  next = setWhatsAppDmPolicy(next, "allowlist");
  next = setWhatsAppAllowFrom(next, allowFrom);
  await params.prompter.note(
    [...params.messageLines, `- allowFrom includes ${normalized}`].join("\n"),
    params.title,
  );
  return next;
}

async function promptWhatsAppAllowFrom(
  cfg: OpenClawConfig,
  _runtime: RuntimeEnv,
  prompter: WizardPrompter,
  options?: { forceAllowlist?: boolean },
): Promise<OpenClawConfig> {
  const existingPolicy = cfg.channels?.whatsapp?.dmPolicy ?? "pairing";
  const existingAllowFrom = cfg.channels?.whatsapp?.allowFrom ?? [];
  const existingLabel = existingAllowFrom.length > 0 ? existingAllowFrom.join(", ") : "unset";

  if (options?.forceAllowlist) {
<<<<<<< HEAD
    await prompter.note(
      t("We need the sender/owner number so OpenClaw can allowlist you."),
      t("WhatsApp number"),
    );
    const entry = await prompter.text({
      message: t("Your personal WhatsApp number (the phone you will message from)"),
      placeholder: "+15555550123",
      initialValue: existingAllowFrom[0],
      validate: (value) => {
        const raw = String(value ?? "").trim();
        if (!raw) {
          return t("Required");
        }
        const normalized = normalizeE164(raw);
        if (!normalized) {
          return t("Invalid number: {number}").replace("{number}", raw);
        }
        return undefined;
      },
    });
    const normalized = normalizeE164(String(entry).trim());
    const merged = [
      ...existingAllowFrom
        .filter((item) => item !== "*")
        .map((item) => normalizeE164(item))
        .filter(Boolean),
      normalized,
    ];
    const unique = [...new Set(merged.filter(Boolean))];
    let next = setWhatsAppSelfChatMode(cfg, true);
    next = setWhatsAppDmPolicy(next, "allowlist");
    next = setWhatsAppAllowFrom(next, unique);
    await prompter.note(
      [
        t("Allowlist mode enabled."),
        t("- allowFrom includes {number}").replace("{number}", normalized),
      ].join("\n"),
      t("WhatsApp allowlist"),
    );
    return next;
=======
    return await applyWhatsAppOwnerAllowlist({
      cfg,
      prompter,
      existingAllowFrom,
      title: "WhatsApp allowlist",
      messageLines: ["Allowlist mode enabled."],
    });
>>>>>>> origin/main
  }

  await prompter.note(
    [
<<<<<<< HEAD
      t(
        "WhatsApp direct chats are gated by `channels.whatsapp.dmPolicy` + `channels.whatsapp.allowFrom`.",
      ),
      t("- pairing (default): unknown senders get a pairing code; owner approves"),
      t("- allowlist: unknown senders are blocked"),
      t('- open: public inbound DMs (requires allowFrom to include "*")'),
      t("- disabled: ignore WhatsApp DMs"),
      "",
      t("Current: dmPolicy={policy}, allowFrom={label}")
        .replace("{policy}", existingPolicy)
        .replace("{label}", existingLabel),
      t("Docs: {link}").replace("{link}", formatDocsLink("/whatsapp", "whatsapp")),
    ].join("\n"),
    t("WhatsApp DM access"),
  );

  const phoneMode = await prompter.select({
    message: t("WhatsApp phone setup"),
    options: [
      { value: "personal", label: t("This is my personal phone number") },
      { value: "separate", label: t("Separate phone just for OpenClaw") },
=======
      "WhatsApp direct chats are gated by `channels.whatsapp.dmPolicy` + `channels.whatsapp.allowFrom`.",
      "- pairing (default): unknown senders get a pairing code; owner approves",
      "- allowlist: unknown senders are blocked",
      '- open: public inbound DMs (requires allowFrom to include "*")',
      "- disabled: ignore WhatsApp DMs",
      "",
      `Current: dmPolicy=${existingPolicy}, allowFrom=${existingLabel}`,
      `Docs: ${formatDocsLink("/whatsapp", "whatsapp")}`,
    ].join("\n"),
    "WhatsApp DM access",
  );

  const phoneMode = await prompter.select({
    message: "WhatsApp phone setup",
    options: [
      { value: "personal", label: "This is my personal phone number" },
      { value: "separate", label: "Separate phone just for OpenClaw" },
>>>>>>> origin/main
    ],
  });

  if (phoneMode === "personal") {
<<<<<<< HEAD
    await prompter.note(
      t("We need the sender/owner number so OpenClaw can allowlist you."),
      t("WhatsApp number"),
    );
    const entry = await prompter.text({
      message: t("Your personal WhatsApp number (the phone you will message from)"),
      placeholder: "+15555550123",
      initialValue: existingAllowFrom[0],
      validate: (value) => {
        const raw = String(value ?? "").trim();
        if (!raw) {
          return t("Required");
        }
        const normalized = normalizeE164(raw);
        if (!normalized) {
          return t("Invalid number: {number}").replace("{number}", raw);
        }
        return undefined;
      },
    });
    const normalized = normalizeE164(String(entry).trim());
    const merged = [
      ...existingAllowFrom
        .filter((item) => item !== "*")
        .map((item) => normalizeE164(item))
        .filter(Boolean),
      normalized,
    ];
    const unique = [...new Set(merged.filter(Boolean))];
    let next = setWhatsAppSelfChatMode(cfg, true);
    next = setWhatsAppDmPolicy(next, "allowlist");
    next = setWhatsAppAllowFrom(next, unique);
    await prompter.note(
      [
        t("Personal phone mode enabled."),
        t("- dmPolicy set to allowlist (pairing skipped)"),
        t("- allowFrom includes {number}").replace("{number}", normalized),
      ].join("\n"),
      t("WhatsApp personal phone"),
    );
    return next;
=======
    return await applyWhatsAppOwnerAllowlist({
      cfg,
      prompter,
      existingAllowFrom,
      title: "WhatsApp personal phone",
      messageLines: [
        "Personal phone mode enabled.",
        "- dmPolicy set to allowlist (pairing skipped)",
      ],
    });
>>>>>>> origin/main
  }

  const policy = (await prompter.select({
    message: t("WhatsApp DM policy"),
    options: [
      { value: "pairing", label: t("Pairing (recommended)") },
      { value: "allowlist", label: t("Allowlist only (block unknown senders)") },
      { value: "open", label: t("Open (public inbound DMs)") },
      { value: "disabled", label: t("Disabled (ignore WhatsApp DMs)") },
    ],
  })) as DmPolicy;

  let next = setWhatsAppSelfChatMode(cfg, false);
  next = setWhatsAppDmPolicy(next, policy);
  if (policy === "open") {
    next = setWhatsAppAllowFrom(next, ["*"]);
  }
  if (policy === "disabled") {
    return next;
  }

  const allowOptions =
    existingAllowFrom.length > 0
      ? ([
          { value: "keep", label: t("Keep current allowFrom") },
          {
            value: "unset",
            label: t("Unset allowFrom (use pairing approvals only)"),
          },
          { value: "list", label: t("Set allowFrom to specific numbers") },
        ] as const)
      : ([
          { value: "unset", label: t("Unset allowFrom (default)") },
          { value: "list", label: t("Set allowFrom to specific numbers") },
        ] as const);

  const mode = await prompter.select({
    message: t("WhatsApp allowFrom (optional pre-allowlist)"),
    options: allowOptions.map((opt) => ({
      value: opt.value,
      label: opt.label,
    })),
  });

  if (mode === "keep") {
    // Keep allowFrom as-is.
  } else if (mode === "unset") {
    next = setWhatsAppAllowFrom(next, undefined);
  } else {
    const allowRaw = await prompter.text({
      message: t("Allowed sender numbers (comma-separated, E.164)"),
      placeholder: "+15555550123, +447700900123",
      validate: (value) => {
        const raw = String(value ?? "").trim();
        if (!raw) {
          return t("Required");
        }
        const parts = raw
          .split(/[\n,;]+/g)
          .map((p) => p.trim())
          .filter(Boolean);
        if (parts.length === 0) {
          return t("Required");
        }
        for (const part of parts) {
          if (part === "*") {
            continue;
          }
          const normalized = normalizeE164(part);
          if (!normalized) {
            return t("Invalid number: {number}").replace("{number}", part);
          }
        }
        return undefined;
      },
    });

    const parts = String(allowRaw)
      .split(/[\n,;]+/g)
      .map((p) => p.trim())
      .filter(Boolean);
    const normalized = parts.map((part) => (part === "*" ? "*" : normalizeE164(part)));
    const unique = [...new Set(normalized.filter(Boolean))];
    next = setWhatsAppAllowFrom(next, unique);
  }

  return next;
}

export const whatsappOnboardingAdapter: ChannelOnboardingAdapter = {
  channel,
  getStatus: async ({ cfg, accountOverrides }) => {
    const overrideId = accountOverrides.whatsapp?.trim();
    const defaultAccountId = resolveDefaultWhatsAppAccountId(cfg);
    const accountId = overrideId ? normalizeAccountId(overrideId) : defaultAccountId;
    const linked = await detectWhatsAppLinked(cfg, accountId);
    const accountLabel = accountId === DEFAULT_ACCOUNT_ID ? t("default") : accountId;
    return {
      channel,
      configured: linked,
      statusLines: [
        t("WhatsApp ({account}): {status}")
          .replace("{account}", accountLabel)
          .replace("{status}", linked ? t("linked") : t("not linked")),
      ],
      selectionHint: linked ? t("linked") : t("not linked"),
      quickstartScore: linked ? 5 : 4,
    };
  },
  configure: async ({
    cfg,
    runtime,
    prompter,
    options,
    accountOverrides,
    shouldPromptAccountIds,
    forceAllowFrom,
  }) => {
    const overrideId = accountOverrides.whatsapp?.trim();
    let accountId = overrideId
      ? normalizeAccountId(overrideId)
      : resolveDefaultWhatsAppAccountId(cfg);
    if (shouldPromptAccountIds || options?.promptWhatsAppAccountId) {
      if (!overrideId) {
        accountId = await promptAccountId({
          cfg,
          prompter,
          label: "WhatsApp",
          currentId: accountId,
          listAccountIds: listWhatsAppAccountIds,
          defaultAccountId: resolveDefaultWhatsAppAccountId(cfg),
        });
      }
    }

    let next = cfg;
    if (accountId !== DEFAULT_ACCOUNT_ID) {
      next = {
        ...next,
        channels: {
          ...next.channels,
          whatsapp: {
            ...next.channels?.whatsapp,
            accounts: {
              ...next.channels?.whatsapp?.accounts,
              [accountId]: {
                ...next.channels?.whatsapp?.accounts?.[accountId],
                enabled: next.channels?.whatsapp?.accounts?.[accountId]?.enabled ?? true,
              },
            },
          },
        },
      };
    }

    const linked = await detectWhatsAppLinked(next, accountId);
    const { authDir } = resolveWhatsAppAuthDir({
      cfg: next,
      accountId,
    });

    if (!linked) {
      await prompter.note(
        [
          t("Scan the QR with WhatsApp on your phone."),
          t("Credentials are stored under {authDir}/ for future runs.").replace(
            "{authDir}",
            authDir,
          ),
          t("Docs: {link}").replace("{link}", formatDocsLink("/whatsapp", "whatsapp")),
        ].join("\n"),
        t("WhatsApp linking"),
      );
    }
    const wantsLink = await prompter.confirm({
      message: linked ? t("WhatsApp already linked. Re-link now?") : t("Link WhatsApp now (QR)?"),
      initialValue: !linked,
    });
    if (wantsLink) {
      try {
        await loginWeb(false, undefined, runtime, accountId);
      } catch (err) {
        runtime.error(`WhatsApp login failed: ${String(err)}`);
        await prompter.note(
          t("Docs: {link}").replace("{link}", formatDocsLink("/whatsapp", "whatsapp")),
          t("WhatsApp help"),
        );
      }
    } else if (!linked) {
      await prompter.note(
        t("Run {command} later to link WhatsApp.").replace(
          "{command}",
          formatCliCommand("openclaw channels login"),
        ),
        t("WhatsApp"),
      );
    }

    next = await promptWhatsAppAllowFrom(next, runtime, prompter, {
      forceAllowlist: forceAllowFrom,
    });

    return { cfg: next, accountId };
  },
  onAccountRecorded: (accountId, options) => {
    options?.onWhatsAppAccountId?.(accountId);
  },
};
