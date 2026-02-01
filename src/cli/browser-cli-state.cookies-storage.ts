import type { Command } from "commander";
import { danger } from "../globals.js";
import { t } from "../i18n/index.js";
import { defaultRuntime } from "../runtime.js";
import { callBrowserRequest, type BrowserParentOpts } from "./browser-cli-shared.js";

export function registerBrowserCookiesAndStorageCommands(
  browser: Command,
  parentOpts: (cmd: Command) => BrowserParentOpts,
) {
  const cookies = browser.command("cookies").description(t("Read/write cookies"));

  cookies
    .option("--target-id <id>", t("CDP target id (or unique prefix)"))
    .action(async (opts, cmd) => {
      const parent = parentOpts(cmd);
      const profile = parent?.browserProfile;
      try {
        const result = await callBrowserRequest<{ cookies?: unknown[] }>(
          parent,
          {
            method: "GET",
            path: "/cookies",
            query: {
              targetId: opts.targetId?.trim() || undefined,
              profile,
            },
          },
          { timeoutMs: 20000 },
        );
        if (parent?.json) {
          defaultRuntime.log(JSON.stringify(result, null, 2));
          return;
        }
        defaultRuntime.log(JSON.stringify(result.cookies ?? [], null, 2));
      } catch (err) {
        defaultRuntime.error(danger(String(err)));
        defaultRuntime.exit(1);
      }
    });

  cookies
    .command("set")
    .description(t("Set a cookie (requires --url or domain+path)"))
    .argument("<name>", t("Cookie name"))
    .argument("<value>", t("Cookie value"))
    .requiredOption("--url <url>", t("Cookie URL scope (recommended)"))
    .option("--target-id <id>", t("CDP target id (or unique prefix)"))
    .action(async (name: string, value: string, opts, cmd) => {
      const parent = parentOpts(cmd);
      const profile = parent?.browserProfile;
      try {
        const result = await callBrowserRequest(
          parent,
          {
            method: "POST",
            path: "/cookies/set",
            query: profile ? { profile } : undefined,
            body: {
              targetId: opts.targetId?.trim() || undefined,
              cookie: { name, value, url: opts.url },
            },
          },
          { timeoutMs: 20000 },
        );
        if (parent?.json) {
          defaultRuntime.log(JSON.stringify(result, null, 2));
          return;
        }
        defaultRuntime.log(`cookie set: ${name}`);
      } catch (err) {
        defaultRuntime.error(danger(String(err)));
        defaultRuntime.exit(1);
      }
    });

  cookies
    .command("clear")
    .description(t("Clear all cookies"))
    .option("--target-id <id>", t("CDP target id (or unique prefix)"))
    .action(async (opts, cmd) => {
      const parent = parentOpts(cmd);
      const profile = parent?.browserProfile;
      try {
        const result = await callBrowserRequest(
          parent,
          {
            method: "POST",
            path: "/cookies/clear",
            query: profile ? { profile } : undefined,
            body: {
              targetId: opts.targetId?.trim() || undefined,
            },
          },
          { timeoutMs: 20000 },
        );
        if (parent?.json) {
          defaultRuntime.log(JSON.stringify(result, null, 2));
          return;
        }
        defaultRuntime.log(t("cookies cleared"));
      } catch (err) {
        defaultRuntime.error(danger(String(err)));
        defaultRuntime.exit(1);
      }
    });

  const storage = browser
    .command("storage")
    .description(t("Read/write localStorage/sessionStorage"));

  function registerStorageKind(kind: "local" | "session") {
    const cmd = storage.command(kind).description(`${kind}Storage commands`);

    cmd
      .command("get")
      .description(`Get ${kind}Storage (all keys or one key)`)
      .argument("[key]", t("Key (optional)"))
      .option("--target-id <id>", t("CDP target id (or unique prefix)"))
      .action(async (key: string | undefined, opts, cmd2) => {
        const parent = parentOpts(cmd2);
        const profile = parent?.browserProfile;
        try {
          const result = await callBrowserRequest<{ values?: Record<string, string> }>(
            parent,
            {
              method: "GET",
              path: `/storage/${kind}`,
              query: {
                key: key?.trim() || undefined,
                targetId: opts.targetId?.trim() || undefined,
                profile,
              },
            },
            { timeoutMs: 20000 },
          );
          if (parent?.json) {
            defaultRuntime.log(JSON.stringify(result, null, 2));
            return;
          }
          defaultRuntime.log(JSON.stringify(result.values ?? {}, null, 2));
        } catch (err) {
          defaultRuntime.error(danger(String(err)));
          defaultRuntime.exit(1);
        }
      });

    cmd
      .command("set")
      .description(`Set a ${kind}Storage key`)
      .argument("<key>", "Key")
      .argument("<value>", "Value")
      .option("--target-id <id>", t("CDP target id (or unique prefix)"))
      .action(async (key: string, value: string, opts, cmd2) => {
        const parent = parentOpts(cmd2);
        const profile = parent?.browserProfile;
        try {
          const result = await callBrowserRequest(
            parent,
            {
              method: "POST",
              path: `/storage/${kind}/set`,
              query: profile ? { profile } : undefined,
              body: {
                key,
                value,
                targetId: opts.targetId?.trim() || undefined,
              },
            },
            { timeoutMs: 20000 },
          );
          if (parent?.json) {
            defaultRuntime.log(JSON.stringify(result, null, 2));
            return;
          }
          defaultRuntime.log(`${kind}Storage set: ${key}`);
        } catch (err) {
          defaultRuntime.error(danger(String(err)));
          defaultRuntime.exit(1);
        }
      });

    cmd
      .command("clear")
      .description(`Clear all ${kind}Storage keys`)
      .option("--target-id <id>", t("CDP target id (or unique prefix)"))
      .action(async (opts, cmd2) => {
        const parent = parentOpts(cmd2);
        const profile = parent?.browserProfile;
        try {
          const result = await callBrowserRequest(
            parent,
            {
              method: "POST",
              path: `/storage/${kind}/clear`,
              query: profile ? { profile } : undefined,
              body: {
                targetId: opts.targetId?.trim() || undefined,
              },
            },
            { timeoutMs: 20000 },
          );
          if (parent?.json) {
            defaultRuntime.log(JSON.stringify(result, null, 2));
            return;
          }
          defaultRuntime.log(`${kind}Storage cleared`);
        } catch (err) {
          defaultRuntime.error(danger(String(err)));
          defaultRuntime.exit(1);
        }
      });
  }

  registerStorageKind("local");
  registerStorageKind("session");
}
