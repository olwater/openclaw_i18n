import type { Command } from "commander";
import {
  githubCopilotLoginCommand,
  modelsAliasesAddCommand,
  modelsAliasesListCommand,
  modelsAliasesRemoveCommand,
  modelsAuthAddCommand,
  modelsAuthLoginCommand,
  modelsAuthOrderClearCommand,
  modelsAuthOrderGetCommand,
  modelsAuthOrderSetCommand,
  modelsAuthPasteTokenCommand,
  modelsAuthSetupTokenCommand,
  modelsFallbacksAddCommand,
  modelsFallbacksClearCommand,
  modelsFallbacksListCommand,
  modelsFallbacksRemoveCommand,
  modelsImageFallbacksAddCommand,
  modelsImageFallbacksClearCommand,
  modelsImageFallbacksListCommand,
  modelsImageFallbacksRemoveCommand,
  modelsListCommand,
  modelsScanCommand,
  modelsSetCommand,
  modelsSetImageCommand,
  modelsStatusCommand,
} from "../commands/models.js";
import { t } from "../i18n/index.js";
import { defaultRuntime } from "../runtime.js";
import { formatDocsLink } from "../terminal/links.js";
import { theme } from "../terminal/theme.js";
import { resolveOptionFromCommand, runCommandWithRuntime } from "./cli-utils.js";

function runModelsCommand(action: () => Promise<void>) {
  return runCommandWithRuntime(defaultRuntime, action);
}

export function registerModelsCli(program: Command) {
  const models = program
    .command("models")
    .description(t("Model discovery, scanning, and configuration"))
    .option("--status-json", t("Output JSON (alias for `models status --json`)"), false)
    .option("--status-plain", t("Plain output (alias for `models status --plain`)"), false)
    .option(
      "--agent <id>",
      t("Agent id to inspect (overrides OPENCLAW_AGENT_DIR/PI_CODING_AGENT_DIR)"),
    )
    .addHelpText(
      "after",
      () =>
        `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/models", "docs.openclaw.ai/cli/models")}\n`,
    );

  models
    .command("list")
    .description(t("List models (configured by default)"))
    .option("--all", t("Show full model catalog"), false)
    .option("--local", t("Filter to local models"), false)
    .option("--provider <name>", t("Filter by provider"))
    .option("--json", t("Output JSON"), false)
    .option("--plain", t("Plain line output"), false)
    .action(async (opts) => {
      await runModelsCommand(async () => {
        await modelsListCommand(opts, defaultRuntime);
      });
    });

  models
    .command("status")
    .description(t("Show configured model state"))
    .option("--json", t("Output JSON"), false)
    .option("--plain", t("Plain output"), false)
    .option(
      "--check",
      t("Exit non-zero if auth is expiring/expired (1=expired/missing, 2=expiring)"),
      false,
    )
    .option("--probe", t("Probe configured provider auth (live)"), false)
    .option("--probe-provider <name>", t("Only probe a single provider"))
    .option(
      "--probe-profile <id>",
      t("Only probe specific auth profile ids (repeat or comma-separated)"),
      (value, previous) => {
        const next = Array.isArray(previous) ? previous : previous ? [previous] : [];
        next.push(value);
        return next;
      },
    )
    .option("--probe-timeout <ms>", t("Per-probe timeout in ms"))
    .option("--probe-concurrency <n>", t("Concurrent probes"))
    .option("--probe-max-tokens <n>", t("Probe max tokens (best-effort)"))
    .option(
      "--agent <id>",
      t("Agent id to inspect (overrides OPENCLAW_AGENT_DIR/PI_CODING_AGENT_DIR)"),
    )
    .action(async (opts, command) => {
      const agent =
        resolveOptionFromCommand<string>(command, "agent") ?? (opts.agent as string | undefined);
      await runModelsCommand(async () => {
        await modelsStatusCommand(
          {
            json: Boolean(opts.json),
            plain: Boolean(opts.plain),
            check: Boolean(opts.check),
            probe: Boolean(opts.probe),
            probeProvider: opts.probeProvider as string | undefined,
            probeProfile: opts.probeProfile as string | string[] | undefined,
            probeTimeout: opts.probeTimeout as string | undefined,
            probeConcurrency: opts.probeConcurrency as string | undefined,
            probeMaxTokens: opts.probeMaxTokens as string | undefined,
            agent,
          },
          defaultRuntime,
        );
      });
    });

  models
    .command("set")
    .description(t("Set the default model"))
    .argument("<model>", t("Model id or alias"))
    .action(async (model: string) => {
      await runModelsCommand(async () => {
        await modelsSetCommand(model, defaultRuntime);
      });
    });

  models
    .command("set-image")
    .description(t("Set the image model"))
    .argument("<model>", t("Model id or alias"))
    .action(async (model: string) => {
      await runModelsCommand(async () => {
        await modelsSetImageCommand(model, defaultRuntime);
      });
    });

  const aliases = models.command("aliases").description(t("Manage model aliases"));

  aliases
    .command("list")
    .description(t("List model aliases"))
    .option("--json", t("Output JSON"), false)
    .option("--plain", t("Plain output"), false)
    .action(async (opts) => {
      await runModelsCommand(async () => {
        await modelsAliasesListCommand(opts, defaultRuntime);
      });
    });

  aliases
    .command("add")
    .description(t("Add or update a model alias"))
    .argument("<alias>", t("Alias name"))
    .argument("<model>", t("Model id or alias"))
    .action(async (alias: string, model: string) => {
      await runModelsCommand(async () => {
        await modelsAliasesAddCommand(alias, model, defaultRuntime);
      });
    });

  aliases
    .command("remove")
    .description(t("Remove a model alias"))
    .argument("<alias>", t("Alias name"))
    .action(async (alias: string) => {
      await runModelsCommand(async () => {
        await modelsAliasesRemoveCommand(alias, defaultRuntime);
      });
    });

  const fallbacks = models.command("fallbacks").description(t("Manage model fallback list"));

  fallbacks
    .command("list")
    .description(t("List fallback models"))
    .option("--json", t("Output JSON"), false)
    .option("--plain", t("Plain output"), false)
    .action(async (opts) => {
      await runModelsCommand(async () => {
        await modelsFallbacksListCommand(opts, defaultRuntime);
      });
    });

  fallbacks
    .command("add")
    .description(t("Add a fallback model"))
    .argument("<model>", t("Model id or alias"))
    .action(async (model: string) => {
      await runModelsCommand(async () => {
        await modelsFallbacksAddCommand(model, defaultRuntime);
      });
    });

  fallbacks
    .command("remove")
    .description(t("Remove a fallback model"))
    .argument("<model>", t("Model id or alias"))
    .action(async (model: string) => {
      await runModelsCommand(async () => {
        await modelsFallbacksRemoveCommand(model, defaultRuntime);
      });
    });

  fallbacks
    .command("clear")
    .description(t("Clear all fallback models"))
    .action(async () => {
      await runModelsCommand(async () => {
        await modelsFallbacksClearCommand(defaultRuntime);
      });
    });

  const imageFallbacks = models
    .command("image-fallbacks")
    .description(t("Manage image model fallback list"));

  imageFallbacks
    .command("list")
    .description(t("List image fallback models"))
    .option("--json", t("Output JSON"), false)
    .option("--plain", t("Plain output"), false)
    .action(async (opts) => {
      await runModelsCommand(async () => {
        await modelsImageFallbacksListCommand(opts, defaultRuntime);
      });
    });

  imageFallbacks
    .command("add")
    .description(t("Add an image fallback model"))
    .argument("<model>", t("Model id or alias"))
    .action(async (model: string) => {
      await runModelsCommand(async () => {
        await modelsImageFallbacksAddCommand(model, defaultRuntime);
      });
    });

  imageFallbacks
    .command("remove")
    .description(t("Remove an image fallback model"))
    .argument("<model>", t("Model id or alias"))
    .action(async (model: string) => {
      await runModelsCommand(async () => {
        await modelsImageFallbacksRemoveCommand(model, defaultRuntime);
      });
    });

  imageFallbacks
    .command("clear")
    .description(t("Clear all image fallback models"))
    .action(async () => {
      await runModelsCommand(async () => {
        await modelsImageFallbacksClearCommand(defaultRuntime);
      });
    });

  models
    .command("scan")
    .description(t("Scan OpenRouter free models for tools + images"))
    .option("--min-params <b>", t("Minimum parameter size (billions)"))
    .option("--max-age-days <days>", t("Skip models older than N days"))
    .option("--provider <name>", t("Filter by provider prefix"))
    .option("--max-candidates <n>", t("Max fallback candidates"), "6")
    .option("--timeout <ms>", t("Per-probe timeout in ms"))
    .option("--concurrency <n>", t("Probe concurrency"))
    .option("--no-probe", t("Skip live probes; list free candidates only"))
    .option("--yes", t("Accept defaults without prompting"), false)
    .option("--no-input", t("Disable prompts (use defaults)"))
    .option("--set-default", t("Set agents.defaults.model to the first selection"), false)
    .option("--set-image", t("Set agents.defaults.imageModel to the first image selection"), false)
    .option("--json", t("Output JSON"), false)
    .action(async (opts) => {
      await runModelsCommand(async () => {
        await modelsScanCommand(opts, defaultRuntime);
      });
    });

  models.action(async (opts) => {
    await runModelsCommand(async () => {
      await modelsStatusCommand(
        {
          json: Boolean(opts?.statusJson),
          plain: Boolean(opts?.statusPlain),
          agent: opts?.agent as string | undefined,
        },
        defaultRuntime,
      );
    });
  });

  const auth = models.command("auth").description(t("Manage model auth profiles"));
  auth.option("--agent <id>", t("Agent id for auth order get/set/clear"));
  auth.action(() => {
    auth.help();
  });

  auth
    .command("add")
    .description(t("Interactive auth helper (setup-token or paste token)"))
    .action(async () => {
      await runModelsCommand(async () => {
        await modelsAuthAddCommand({}, defaultRuntime);
      });
    });

  auth
    .command("login")
    .description(t("Run a provider plugin auth flow (OAuth/API key)"))
    .option("--provider <id>", t("Provider id registered by a plugin"))
    .option("--method <id>", t("Provider auth method id"))
    .option("--set-default", t("Apply the provider's default model recommendation"), false)
    .action(async (opts) => {
      await runModelsCommand(async () => {
        await modelsAuthLoginCommand(
          {
            provider: opts.provider as string | undefined,
            method: opts.method as string | undefined,
            setDefault: Boolean(opts.setDefault),
          },
          defaultRuntime,
        );
      });
    });

  auth
    .command("setup-token")
    .description(t("Run a provider CLI to create/sync a token (TTY required)"))
    .option("--provider <name>", t("Provider id (default: anthropic)"))
    .option("--yes", t("Skip confirmation"), false)
    .action(async (opts) => {
      await runModelsCommand(async () => {
        await modelsAuthSetupTokenCommand(
          {
            provider: opts.provider as string | undefined,
            yes: Boolean(opts.yes),
          },
          defaultRuntime,
        );
      });
    });

  auth
    .command("paste-token")
    .description(t("Paste a token into auth-profiles.json and update config"))
    .requiredOption("--provider <name>", t("Provider id (e.g. anthropic)"))
    .option("--profile-id <id>", t("Auth profile id (default: <provider>:manual)"))
    .option(
      "--expires-in <duration>",
      t("Optional expiry duration (e.g. 365d, 12h). Stored as absolute expiresAt."),
    )
    .action(async (opts) => {
      await runModelsCommand(async () => {
        await modelsAuthPasteTokenCommand(
          {
            provider: opts.provider as string | undefined,
            profileId: opts.profileId as string | undefined,
            expiresIn: opts.expiresIn as string | undefined,
          },
          defaultRuntime,
        );
      });
    });

  auth
    .command("login-github-copilot")
    .description(t("Login to GitHub Copilot via GitHub device flow (TTY required)"))
    .option("--profile-id <id>", t("Auth profile id (default: github-copilot:github)"))
    .option("--yes", t("Overwrite existing profile without prompting"), false)
    .action(async (opts) => {
      await runModelsCommand(async () => {
        await githubCopilotLoginCommand(
          {
            profileId: opts.profileId as string | undefined,
            yes: Boolean(opts.yes),
          },
          defaultRuntime,
        );
      });
    });

  const order = auth
    .command("order")
    .description(t("Manage per-agent auth profile order overrides"));

  order
    .command("get")
    .description(t("Show per-agent auth order override (from auth-profiles.json)"))
    .requiredOption("--provider <name>", t("Provider id (e.g. anthropic)"))
    .option("--agent <id>", t("Agent id (default: configured default agent)"))
    .option("--json", t("Output JSON"), false)
    .action(async (opts, command) => {
      const agent =
        resolveOptionFromCommand<string>(command, "agent") ?? (opts.agent as string | undefined);
      await runModelsCommand(async () => {
        await modelsAuthOrderGetCommand(
          {
            provider: opts.provider as string,
            agent,
            json: Boolean(opts.json),
          },
          defaultRuntime,
        );
      });
    });

  order
    .command("set")
    .description(t("Set per-agent auth order override (locks rotation to this list)"))
    .requiredOption("--provider <name>", t("Provider id (e.g. anthropic)"))
    .option("--agent <id>", t("Agent id (default: configured default agent)"))
    .argument("<profileIds...>", t("Auth profile ids (e.g. anthropic:default)"))
    .action(async (profileIds: string[], opts, command) => {
      const agent =
        resolveOptionFromCommand<string>(command, "agent") ?? (opts.agent as string | undefined);
      await runModelsCommand(async () => {
        await modelsAuthOrderSetCommand(
          {
            provider: opts.provider as string,
            agent,
            order: profileIds,
          },
          defaultRuntime,
        );
      });
    });

  order
    .command("clear")
    .description(t("Clear per-agent auth order override (fall back to config/round-robin)"))
    .requiredOption("--provider <name>", t("Provider id (e.g. anthropic)"))
    .option("--agent <id>", t("Agent id (default: configured default agent)"))
    .action(async (opts, command) => {
      const agent =
        resolveOptionFromCommand<string>(command, "agent") ?? (opts.agent as string | undefined);
      await runModelsCommand(async () => {
        await modelsAuthOrderClearCommand(
          {
            provider: opts.provider as string,
            agent,
          },
          defaultRuntime,
        );
      });
    });
}
