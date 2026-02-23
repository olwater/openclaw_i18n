import { t } from "../../../i18n/index.js";
import { promptAccountId as promptAccountIdSdk } from "../../../plugin-sdk/onboarding.js";
import { DEFAULT_ACCOUNT_ID, normalizeAccountId } from "../../../routing/session-key.js";
import type { WizardPrompter } from "../../../wizard/prompts.js";
import type { PromptAccountId, PromptAccountIdParams } from "../onboarding-types.js";

export const promptAccountId: PromptAccountId = async (params: PromptAccountIdParams) => {
  const existingIds = params.listAccountIds(params.cfg);
  const initial = params.currentId?.trim() || params.defaultAccountId || DEFAULT_ACCOUNT_ID;
  const choice = await params.prompter.select({
    message: t("{label} account").replace("{label}", params.label),
    options: [
      ...existingIds.map((id) => ({
        value: id,
        label: id === DEFAULT_ACCOUNT_ID ? t("default (primary)") : id,
      })),
      { value: "__new__", label: t("Add a new account") },
    ],
    initialValue: initial,
  });

  if (choice !== "__new__") {
    return normalizeAccountId(choice);
  }

  const entered = await params.prompter.text({
    message: t("New {label} account id").replace("{label}", params.label),
    validate: (value) => (value?.trim() ? undefined : t("Required")),
  });
  const normalized = normalizeAccountId(String(entered));
  if (String(entered).trim() !== normalized) {
    await params.prompter.note(
      t('Normalized account id to "{normalized}".').replace("{normalized}", normalized),
      t("{label} account").replace("{label}", params.label),
    );
  }
  return normalized;
};

export function addWildcardAllowFrom(allowFrom?: Array<string | number> | null): string[] {
  const next = (allowFrom ?? []).map((v) => String(v).trim()).filter(Boolean);
  if (!next.includes("*")) {
    next.push("*");
  }
  return next;
}

export function mergeAllowFromEntries(
  current: Array<string | number> | null | undefined,
  additions: Array<string | number>,
): string[] {
  const merged = [...(current ?? []), ...additions].map((v) => String(v).trim()).filter(Boolean);
  return [...new Set(merged)];
}

type AllowFromResolution = {
  input: string;
  resolved: boolean;
  id?: string | null;
};

export async function promptResolvedAllowFrom(params: {
  prompter: WizardPrompter;
  existing: Array<string | number>;
  token?: string | null;
  message: string;
  placeholder: string;
  label: string;
  parseInputs: (value: string) => string[];
  parseId: (value: string) => string | null;
  invalidWithoutTokenNote: string;
  resolveEntries: (params: { token: string; entries: string[] }) => Promise<AllowFromResolution[]>;
}): Promise<string[]> {
  while (true) {
    const entry = await params.prompter.text({
      message: params.message,
      placeholder: params.placeholder,
      initialValue: params.existing[0] ? String(params.existing[0]) : undefined,
      validate: (value) => (String(value ?? "").trim() ? undefined : t("Required")),
    });
    const parts = params.parseInputs(String(entry));
    if (!params.token) {
      const ids = parts.map(params.parseId).filter(Boolean) as string[];
      if (ids.length !== parts.length) {
        await params.prompter.note(params.invalidWithoutTokenNote, params.label);
        continue;
      }
      return mergeAllowFromEntries(params.existing, ids);
    }

    const results = await params
      .resolveEntries({
        token: params.token,
        entries: parts,
      })
      .catch(() => null);
    if (!results) {
      await params.prompter.note(t("Failed to resolve usernames. Try again."), params.label);
      continue;
    }
    const unresolved = results.filter((res) => !res.resolved || !res.id);
    if (unresolved.length > 0) {
      await params.prompter.note(
        t("Could not resolve: {inputs}").replace(
          "{inputs}",
          unresolved.map((res) => res.input).join(", "),
        ),
        params.label,
      );
      continue;
    }
    const ids = results.map((res) => res.id as string);
    return mergeAllowFromEntries(params.existing, ids);
  }
}
