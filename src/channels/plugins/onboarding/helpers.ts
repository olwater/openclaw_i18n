import type { PromptAccountId, PromptAccountIdParams } from "../onboarding-types.js";
<<<<<<< HEAD
import { t } from "../../../i18n/translations.js";
import { DEFAULT_ACCOUNT_ID, normalizeAccountId } from "../../../routing/session-key.js";

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
=======
import { promptAccountId as promptAccountIdSdk } from "../../../plugin-sdk/onboarding.js";

export const promptAccountId: PromptAccountId = async (params: PromptAccountIdParams) => {
  return await promptAccountIdSdk(params);
>>>>>>> origin/main
};

export function addWildcardAllowFrom(
  allowFrom?: Array<string | number> | null,
): Array<string | number> {
  const next = (allowFrom ?? []).map((v) => String(v).trim()).filter(Boolean);
  if (!next.includes("*")) {
    next.push("*");
  }
  return next;
}
