import type { ApplyAuthChoiceParams, ApplyAuthChoiceResult } from "./auth-choice.apply.js";
import { t } from "../i18n/index.js";
import { applyAuthChoicePluginProvider } from "./auth-choice.apply.plugin-provider.js";

export async function applyAuthChoiceGoogleAntigravity(
  params: ApplyAuthChoiceParams,
): Promise<ApplyAuthChoiceResult | null> {
  return await applyAuthChoicePluginProvider(params, {
    authChoice: "google-antigravity",
    pluginId: "google-antigravity-auth",
    providerId: "google-antigravity",
    methodId: "oauth",
    label: t("Google Antigravity"),
  });
}
