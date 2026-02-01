import type { ApplyAuthChoiceParams, ApplyAuthChoiceResult } from "./auth-choice.apply.js";
import { t } from "../i18n/index.js";
import { githubCopilotLoginCommand } from "../providers/github-copilot-auth.js";
import { applyAuthProfileConfig } from "./onboard-auth.js";

export async function applyAuthChoiceGitHubCopilot(
  params: ApplyAuthChoiceParams,
): Promise<ApplyAuthChoiceResult | null> {
  if (params.authChoice !== "github-copilot") {
    return null;
  }

  let nextConfig = params.config;

  await params.prompter.note(
    [
      t("This will open a GitHub device login to authorize Copilot."),
      t("Requires an active GitHub Copilot subscription."),
    ].join("\n"),
    t("GitHub Copilot"),
  );

  if (!process.stdin.isTTY) {
    await params.prompter.note(
      t("GitHub Copilot login requires an interactive TTY."),
      t("GitHub Copilot"),
    );
    return { config: nextConfig };
  }

  try {
    await githubCopilotLoginCommand({ yes: true }, params.runtime);
  } catch (err) {
    await params.prompter.note(`GitHub Copilot login failed: ${String(err)}`, t("GitHub Copilot"));
    return { config: nextConfig };
  }

  nextConfig = applyAuthProfileConfig(nextConfig, {
    profileId: "github-copilot:github",
    provider: "github-copilot",
    mode: "token",
  });

  if (params.setDefaultModel) {
    const model = "github-copilot/gpt-4o";
    nextConfig = {
      ...nextConfig,
      agents: {
        ...nextConfig.agents,
        defaults: {
          ...nextConfig.agents?.defaults,
          model: {
            ...(typeof nextConfig.agents?.defaults?.model === "object"
              ? nextConfig.agents.defaults.model
              : undefined),
            primary: model,
          },
        },
      },
    };
    await params.prompter.note(`Default model set to ${model}`, t("Model configured"));
  }

  return { config: nextConfig };
}
