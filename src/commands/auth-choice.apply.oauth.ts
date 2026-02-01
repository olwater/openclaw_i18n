import type { ApplyAuthChoiceParams, ApplyAuthChoiceResult } from "./auth-choice.apply.js";
import { t } from "../i18n/index.js";
import { loginChutes } from "./chutes-oauth.js";
import { isRemoteEnvironment } from "./oauth-env.js";
import { createVpsAwareOAuthHandlers } from "./oauth-flow.js";
import { applyAuthProfileConfig, writeOAuthCredentials } from "./onboard-auth.js";
import { openUrl } from "./onboard-helpers.js";

export async function applyAuthChoiceOAuth(
  params: ApplyAuthChoiceParams,
): Promise<ApplyAuthChoiceResult | null> {
  if (params.authChoice === "chutes") {
    let nextConfig = params.config;
    const isRemote = isRemoteEnvironment();
    const redirectUri =
      process.env.CHUTES_OAUTH_REDIRECT_URI?.trim() || "http://127.0.0.1:1456/oauth-callback";
    const scopes = process.env.CHUTES_OAUTH_SCOPES?.trim() || t("openid profile chutes:invoke");
    const clientId =
      process.env.CHUTES_CLIENT_ID?.trim() ||
      String(
        await params.prompter.text({
          message: t("Enter Chutes OAuth client id"),
          placeholder: t("cid_xxx"),
          validate: (value) => (value?.trim() ? undefined : "Required"),
        }),
      ).trim();
    const clientSecret = process.env.CHUTES_CLIENT_SECRET?.trim() || undefined;

    await params.prompter.note(
      isRemote
        ? [
            t("You are running in a remote/VPS environment."),
            t("A URL will be shown for you to open in your LOCAL browser."),
            t("After signing in, paste the redirect URL back here."),
            "",
            `Redirect URI: ${redirectUri}`,
          ].join("\n")
        : [
            t("Browser will open for Chutes authentication."),
            t("If the callback doesn't auto-complete, paste the redirect URL."),
            "",
            `Redirect URI: ${redirectUri}`,
          ].join("\n"),
      t("Chutes OAuth"),
    );

    const spin = params.prompter.progress(t("Starting OAuth flow…"));
    try {
      const { onAuth, onPrompt } = createVpsAwareOAuthHandlers({
        isRemote,
        prompter: params.prompter,
        runtime: params.runtime,
        spin,
        openUrl,
        localBrowserMessage: t("Complete sign-in in browser…"),
      });

      const creds = await loginChutes({
        app: {
          clientId,
          clientSecret,
          redirectUri,
          scopes: scopes.split(/\s+/).filter(Boolean),
        },
        manual: isRemote,
        onAuth,
        onPrompt,
        onProgress: (msg) => spin.update(msg),
      });

      spin.stop(t("Chutes OAuth complete"));
      const email =
        typeof creds.email === "string" && creds.email.trim() ? creds.email.trim() : "default";
      const profileId = `chutes:${email}`;

      await writeOAuthCredentials("chutes", creds, params.agentDir);
      nextConfig = applyAuthProfileConfig(nextConfig, {
        profileId,
        provider: "chutes",
        mode: "oauth",
      });
    } catch (err) {
      spin.stop(t("Chutes OAuth failed"));
      params.runtime.error(String(err));
      await params.prompter.note(
        [
          t("Trouble with OAuth?"),
          t("Verify CHUTES_CLIENT_ID (and CHUTES_CLIENT_SECRET if required)."),
          `Verify the OAuth app redirect URI includes: ${redirectUri}`,
          t("Chutes docs: https://chutes.ai/docs/sign-in-with-chutes/overview"),
        ].join("\n"),
        t("OAuth help"),
      );
    }
    return { config: nextConfig };
  }

  return null;
}
