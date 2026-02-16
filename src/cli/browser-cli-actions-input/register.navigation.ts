import type { Command } from "commander";
import { danger } from "../../globals.js";
import { t } from "../../i18n/index.js";
import { defaultRuntime } from "../../runtime.js";
import { callBrowserRequest, type BrowserParentOpts } from "../browser-cli-shared.js";
import { requireRef, resolveBrowserActionContext } from "./shared.js";

export function registerBrowserNavigationCommands(
  browser: Command,
  parentOpts: (cmd: Command) => BrowserParentOpts,
) {
  browser
    .command("navigate")
    .description(t("Navigate the current tab to a URL"))
    .argument("<url>", t("URL to navigate to"))
    .option("--target-id <id>", t("CDP target id (or unique prefix)"))
    .action(async (url: string, opts, cmd) => {
      const { parent, profile } = resolveBrowserActionContext(cmd, parentOpts);
      try {
        const result = await callBrowserRequest<{ url?: string }>(
          parent,
          {
            method: "POST",
            path: "/navigate",
            query: profile ? { profile } : undefined,
            body: {
              url,
              targetId: opts.targetId?.trim() || undefined,
            },
          },
          { timeoutMs: 20000 },
        );
        if (parent?.json) {
          defaultRuntime.log(JSON.stringify(result, null, 2));
          return;
        }
        defaultRuntime.log(`navigated to ${result.url ?? url}`);
      } catch (err) {
        defaultRuntime.error(danger(String(err)));
        defaultRuntime.exit(1);
      }
    });

  browser
    .command("resize")
    .description(t("Resize the viewport"))
    .argument("<width>", t("Viewport width"), (v: string) => Number(v))
    .argument("<height>", t("Viewport height"), (v: string) => Number(v))
    .option("--target-id <id>", t("CDP target id (or unique prefix)"))
    .action(async (width: number, height: number, opts, cmd) => {
      const { parent, profile } = resolveBrowserActionContext(cmd, parentOpts);
      if (!Number.isFinite(width) || !Number.isFinite(height)) {
        defaultRuntime.error(danger(t("width and height must be numbers")));
        defaultRuntime.exit(1);
        return;
      }
      try {
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
        defaultRuntime.log(`resized to ${width}x${height}`);
      } catch (err) {
        defaultRuntime.error(danger(String(err)));
        defaultRuntime.exit(1);
      }
    });

  // Keep `requireRef` reachable; shared utilities are intended for other modules too.
  void requireRef;
}
