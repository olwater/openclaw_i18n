import type { Command } from "commander";
import { danger } from "../globals.js";
import { t } from "../i18n/index.js";
import { defaultRuntime } from "../runtime.js";
import { parseBooleanValue } from "../utils/boolean.js";
import { callBrowserRequest, type BrowserParentOpts } from "./browser-cli-shared.js";
import { registerBrowserCookiesAndStorageCommands } from "./browser-cli-state.cookies-storage.js";
import { runCommandWithRuntime } from "./cli-utils.js";

function parseOnOff(raw: string): boolean | null {
  const parsed = parseBooleanValue(raw);
  return parsed === undefined ? null : parsed;
}

function runBrowserCommand(action: () => Promise<void>) {
  return runCommandWithRuntime(defaultRuntime, action, (err) => {
    defaultRuntime.error(danger(String(err)));
    defaultRuntime.exit(1);
  });
}

async function runBrowserSetRequest(params: {
  parent: BrowserParentOpts;
  path: string;
  body: Record<string, unknown>;
  successMessage: string;
}) {
  await runBrowserCommand(async () => {
    const profile = params.parent?.browserProfile;
    const result = await callBrowserRequest(
      params.parent,
      {
        method: "POST",
        path: params.path,
        query: profile ? { profile } : undefined,
        body: params.body,
      },
      { timeoutMs: 20000 },
    );
    if (params.parent?.json) {
      defaultRuntime.log(JSON.stringify(result, null, 2));
      return;
    }
    defaultRuntime.log(params.successMessage);
  });
}

export function registerBrowserStateCommands(
  browser: Command,
  parentOpts: (cmd: Command) => BrowserParentOpts,
) {
  registerBrowserCookiesAndStorageCommands(browser, parentOpts);

  const set = browser.command("set").description(t("Browser environment settings"));

  set
    .command("viewport")
    .description(t("Set viewport size (alias for resize)"))
    .argument("<width>", t("Viewport width"), (v: string) => Number(v))
    .argument("<height>", t("Viewport height"), (v: string) => Number(v))
    .option("--target-id <id>", t("CDP target id (or unique prefix)"))
    .action(async (width: number, height: number, opts, cmd) => {
      const parent = parentOpts(cmd);
      const profile = parent?.browserProfile;
      if (!Number.isFinite(width) || !Number.isFinite(height)) {
        defaultRuntime.error(danger(t("width and height must be numbers")));
        defaultRuntime.exit(1);
        return;
      }
      await runBrowserCommand(async () => {
        const result = await callBrowserRequest(
          parent,
          {
            method: "POST",
            path: "/act",
            query: profile ? { profile } : undefined,
            body: {
              kind: "resize",
              width,
              height,
              targetId: opts.targetId?.trim() || undefined,
            },
          },
          { timeoutMs: 20000 },
        );
        if (parent?.json) {
          defaultRuntime.log(JSON.stringify(result, null, 2));
          return;
        }
        defaultRuntime.log(`viewport set: ${width}x${height}`);
      });
    });

  set
    .command("offline")
    .description(t("Toggle offline mode"))
    .argument("<on|off>", "on/off")
    .option("--target-id <id>", t("CDP target id (or unique prefix)"))
    .action(async (value: string, opts, cmd) => {
      const parent = parentOpts(cmd);
      const offline = parseOnOff(value);
      if (offline === null) {
        defaultRuntime.error(danger(t("Expected on|off")));
        defaultRuntime.exit(1);
        return;
      }
      await runBrowserSetRequest({
        parent,
        path: "/set/offline",
        body: {
          offline,
          targetId: opts.targetId?.trim() || undefined,
        },
        successMessage: `offline: ${offline}`,
      });
    });

  set
    .command("headers")
    .description(t("Set extra HTTP headers (JSON object)"))
    .argument("[headersJson]", t("JSON object of headers (alternative to --headers-json)"))
    .option("--headers-json <json>", t("JSON object of headers"))
    .option("--target-id <id>", t("CDP target id (or unique prefix)"))
    .action(async (headersJson: string | undefined, opts, cmd) => {
      const parent = parentOpts(cmd);
      await runBrowserCommand(async () => {
        const headersJsonValue =
          (typeof opts.headersJson === "string" && opts.headersJson.trim()) ||
          (headersJson?.trim() ? headersJson.trim() : undefined);
        if (!headersJsonValue) {
          throw new Error("Missing headers JSON (pass --headers-json or positional JSON argument)");
        }
        const parsed = JSON.parse(String(headersJsonValue)) as unknown;
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          throw new Error(t("Headers JSON must be a JSON object"));
        }
        const headers: Record<string, string> = {};
        for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
          if (typeof v === "string") {
            headers[k] = v;
          }
        }
        const profile = parent?.browserProfile;
        const result = await callBrowserRequest(
          parent,
          {
            method: "POST",
            path: "/set/headers",
            query: profile ? { profile } : undefined,
            body: {
              headers,
              targetId: opts.targetId?.trim() || undefined,
            },
          },
          { timeoutMs: 20000 },
        );
        if (parent?.json) {
          defaultRuntime.log(JSON.stringify(result, null, 2));
          return;
        }
        defaultRuntime.log(t("headers set"));
      });
    });

  set
    .command("credentials")
    .description(t("Set HTTP basic auth credentials"))
    .option("--clear", t("Clear credentials"), false)
    .argument("[username]", "Username")
    .argument("[password]", "Password")
    .option("--target-id <id>", t("CDP target id (or unique prefix)"))
    .action(async (username: string | undefined, password: string | undefined, opts, cmd) => {
      const parent = parentOpts(cmd);
      await runBrowserSetRequest({
        parent,
        path: "/set/credentials",
        body: {
          username: username?.trim() || undefined,
          password,
          clear: Boolean(opts.clear),
          targetId: opts.targetId?.trim() || undefined,
        },
        successMessage: opts.clear ? t("credentials cleared") : t("credentials set"),
      });
    });

  set
    .command("geo")
    .description(t("Set geolocation (and grant permission)"))
    .option("--clear", t("Clear geolocation + permissions"), false)
    .argument("[latitude]", "Latitude", (v: string) => Number(v))
    .argument("[longitude]", "Longitude", (v: string) => Number(v))
    .option("--accuracy <m>", t("Accuracy in meters"), (v: string) => Number(v))
    .option("--origin <origin>", t("Origin to grant permissions for"))
    .option("--target-id <id>", t("CDP target id (or unique prefix)"))
    .action(async (latitude: number | undefined, longitude: number | undefined, opts, cmd) => {
      const parent = parentOpts(cmd);
      await runBrowserSetRequest({
        parent,
        path: "/set/geolocation",
        body: {
          latitude: Number.isFinite(latitude) ? latitude : undefined,
          longitude: Number.isFinite(longitude) ? longitude : undefined,
          accuracy: Number.isFinite(opts.accuracy) ? opts.accuracy : undefined,
          origin: opts.origin?.trim() || undefined,
          clear: Boolean(opts.clear),
          targetId: opts.targetId?.trim() || undefined,
        },
        successMessage: opts.clear ? t("geolocation cleared") : t("geolocation set"),
      });
    });

  set
    .command("media")
    .description(t("Emulate prefers-color-scheme"))
    .argument("<dark|light|none>", "dark/light/none")
    .option("--target-id <id>", t("CDP target id (or unique prefix)"))
    .action(async (value: string, opts, cmd) => {
      const parent = parentOpts(cmd);
      const v = value.trim().toLowerCase();
      const colorScheme =
        v === "dark" ? "dark" : v === "light" ? "light" : v === "none" ? "none" : null;
      if (!colorScheme) {
        defaultRuntime.error(danger(t("Expected dark|light|none")));
        defaultRuntime.exit(1);
        return;
      }
      await runBrowserSetRequest({
        parent,
        path: "/set/media",
        body: {
          colorScheme,
          targetId: opts.targetId?.trim() || undefined,
        },
        successMessage: `media colorScheme: ${colorScheme}`,
      });
    });

  set
    .command("timezone")
    .description(t("Override timezone (CDP)"))
    .argument("<timezoneId>", t("Timezone ID (e.g. America/New_York)"))
    .option("--target-id <id>", t("CDP target id (or unique prefix)"))
    .action(async (timezoneId: string, opts, cmd) => {
      const parent = parentOpts(cmd);
      await runBrowserSetRequest({
        parent,
        path: "/set/timezone",
        body: {
          timezoneId,
          targetId: opts.targetId?.trim() || undefined,
        },
        successMessage: `timezone: ${timezoneId}`,
      });
    });

  set
    .command("locale")
    .description(t("Override locale (CDP)"))
    .argument("<locale>", t("Locale (e.g. en-US)"))
    .option("--target-id <id>", t("CDP target id (or unique prefix)"))
    .action(async (locale: string, opts, cmd) => {
      const parent = parentOpts(cmd);
      await runBrowserSetRequest({
        parent,
        path: "/set/locale",
        body: {
          locale,
          targetId: opts.targetId?.trim() || undefined,
        },
        successMessage: `locale: ${locale}`,
      });
    });

  set
    .command("device")
    .description(t('Apply a Playwright device descriptor (e.g. "iPhone 14")'))
    .argument("<name>", t("Device name (Playwright devices)"))
    .option("--target-id <id>", t("CDP target id (or unique prefix)"))
    .action(async (name: string, opts, cmd) => {
      const parent = parentOpts(cmd);
      await runBrowserSetRequest({
        parent,
        path: "/set/device",
        body: {
          name,
          targetId: opts.targetId?.trim() || undefined,
        },
        successMessage: `device: ${name}`,
      });
    });
}
