import fs from "node:fs";
import path from "node:path";
import { DEFAULT_AGENTS_FILENAME } from "../agents/workspace.js";
import { t } from "../i18n/index.js";
import { shortenHomePath } from "../utils.js";

export const MEMORY_SYSTEM_PROMPT = [
  t("Memory system not found in workspace."),
  t("Paste this into your agent:"),
  "",
  t("Install the memory system by applying:"),
  "https://github.com/openclaw/openclaw/commit/9ffea23f31ca1df5183b25668f8f814bee0fb34e",
  "https://github.com/openclaw/openclaw/commit/7d1fee70e76f2f634f1b41fca927ee663914183a",
].join("\n");

export async function shouldSuggestMemorySystem(workspaceDir: string): Promise<boolean> {
  const memoryPaths = [path.join(workspaceDir, "MEMORY.md"), path.join(workspaceDir, "memory.md")];

  for (const memoryPath of memoryPaths) {
    try {
      await fs.promises.access(memoryPath);
      return false;
    } catch {
      // keep scanning
    }
  }

  const agentsPath = path.join(workspaceDir, DEFAULT_AGENTS_FILENAME);
  try {
    const content = await fs.promises.readFile(agentsPath, "utf-8");
    if (/memory\.md/i.test(content)) {
      return false;
    }
  } catch {
    // no AGENTS.md or unreadable; treat as missing memory guidance
  }

  return true;
}

export type LegacyWorkspaceDetection = {
  activeWorkspace: string;
  legacyDirs: string[];
};

export function detectLegacyWorkspaceDirs(params: {
  workspaceDir: string;
}): LegacyWorkspaceDetection {
  const activeWorkspace = path.resolve(params.workspaceDir);
  const legacyDirs: string[] = [];
  return { activeWorkspace, legacyDirs };
}

export function formatLegacyWorkspaceWarning(detection: LegacyWorkspaceDetection): string {
  return [
    t("Extra workspace directories detected (may contain old agent files):"),
    ...detection.legacyDirs.map((dir) => `- ${shortenHomePath(dir)}`),
    `Active workspace: ${shortenHomePath(detection.activeWorkspace)}`,
    t("If unused, archive or move to Trash."),
  ].join("\n");
}
