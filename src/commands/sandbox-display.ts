/**
 * Display utilities for sandbox CLI
 */

import type { SandboxBrowserInfo, SandboxContainerInfo } from "../agents/sandbox.js";
import type { RuntimeEnv } from "../runtime.js";
import { formatCliCommand } from "../cli/command-format.js";
import { t } from "../i18n/index.js";
import {
  formatAge,
  formatImageMatch,
  formatSimpleStatus,
  formatStatus,
} from "./sandbox-formatters.js";

type DisplayConfig<T> = {
  emptyMessage: string;
  title: string;
  renderItem: (item: T, runtime: RuntimeEnv) => void;
};

function displayItems<T>(items: T[], config: DisplayConfig<T>, runtime: RuntimeEnv): void {
  if (items.length === 0) {
    runtime.log(config.emptyMessage);
    return;
  }

  runtime.log(`\n${config.title}\n`);
  for (const item of items) {
    config.renderItem(item, runtime);
  }
}

export function displayContainers(containers: SandboxContainerInfo[], runtime: RuntimeEnv): void {
  displayItems(
    containers,
    {
      emptyMessage: t("No sandbox containers found.") as any,
      title: t("📦 Sandbox Containers:") as any,
      renderItem: (container, rt) => {
        rt.log(`  ${container.containerName}`);
        rt.log(`    Status:  ${formatStatus(container.running)}`);
        rt.log(`    Image:   ${container.image} ${formatImageMatch(container.imageMatch)}`);
        rt.log(`    Age:     ${formatAge(Date.now() - container.createdAtMs)}`);
        rt.log(`    Idle:    ${formatAge(Date.now() - container.lastUsedAtMs)}`);
        rt.log(`    Session: ${container.sessionKey}`);
        rt.log("");
      },
    },
    runtime,
  );
}

export function displayBrowsers(browsers: SandboxBrowserInfo[], runtime: RuntimeEnv): void {
  displayItems(
    browsers,
    {
      emptyMessage: t("No sandbox browser containers found.") as any,
      title: t("🌐 Sandbox Browser Containers:") as any,
      renderItem: (browser, rt) => {
        rt.log(`  ${browser.containerName}`);
        rt.log(`    Status:  ${formatStatus(browser.running)}`);
        rt.log(`    Image:   ${browser.image} ${formatImageMatch(browser.imageMatch)}`);
        rt.log(`    CDP:     ${browser.cdpPort}`);
        if (browser.noVncPort) {
          rt.log(`    noVNC:   ${browser.noVncPort}`);
        }
        rt.log(`    Age:     ${formatAge(Date.now() - browser.createdAtMs)}`);
        rt.log(`    Idle:    ${formatAge(Date.now() - browser.lastUsedAtMs)}`);
        rt.log(`    Session: ${browser.sessionKey}`);
        rt.log("");
      },
    },
    runtime,
  );
}

export function displaySummary(
  containers: SandboxContainerInfo[],
  browsers: SandboxBrowserInfo[],
  runtime: RuntimeEnv,
): void {
  const totalCount = containers.length + browsers.length;
  const runningCount =
    containers.filter((c) => c.running).length + browsers.filter((b) => b.running).length;
  const mismatchCount =
    containers.filter((c) => !c.imageMatch).length + browsers.filter((b) => !b.imageMatch).length;

  runtime.log(`Total: ${totalCount} (${runningCount} running)`);

  if (mismatchCount > 0) {
    runtime.log(`\n⚠️  ${mismatchCount} container(s) with image mismatch detected.`);
    runtime.log(
      `   Run '${formatCliCommand(t("openclaw sandbox recreate --all") as any)}' to update all containers.`,
    );
  }
}

export function displayRecreatePreview(
  containers: SandboxContainerInfo[],
  browsers: SandboxBrowserInfo[],
  runtime: RuntimeEnv,
): void {
  runtime.log(t("\nContainers to be recreated:\n") as any);

  if (containers.length > 0) {
    runtime.log(t("📦 Sandbox Containers:") as any);
    for (const container of containers) {
      runtime.log(`  - ${container.containerName} (${formatSimpleStatus(container.running)})`);
    }
  }

  if (browsers.length > 0) {
    runtime.log(t("\n🌐 Browser Containers:") as any);
    for (const browser of browsers) {
      runtime.log(`  - ${browser.containerName} (${formatSimpleStatus(browser.running)})`);
    }
  }

  const total = containers.length + browsers.length;
  runtime.log(`\nTotal: ${total} container(s)`);
}

export function displayRecreateResult(
  result: { successCount: number; failCount: number },
  runtime: RuntimeEnv,
): void {
  runtime.log(`\nDone: ${result.successCount} removed, ${result.failCount} failed`);

  if (result.successCount > 0) {
    runtime.log(
      t("\nContainers will be automatically recreated when the agent is next used.") as any,
    );
  }
}
