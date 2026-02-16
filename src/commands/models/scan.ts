import { cancel, multiselect as clackMultiselect, isCancel } from "@clack/prompts";
import type { RuntimeEnv } from "../../runtime.js";
import { resolveApiKeyForProvider } from "../../agents/model-auth.js";
import { type ModelScanResult, scanOpenRouterModels } from "../../agents/model-scan.js";
import { withProgressTotals } from "../../cli/progress.js";
import { loadConfig } from "../../config/config.js";
import { logConfigUpdated } from "../../config/logging.js";
import { t } from "../../i18n/index.js";
import {
  stylePromptHint,
  stylePromptMessage,
  stylePromptTitle,
} from "../../terminal/prompt-style.js";
import { formatMs, formatTokenK, updateConfig } from "./shared.js";

const MODEL_PAD = 42;
const CTX_PAD = 8;

const multiselect = <T>(params: Parameters<typeof clackMultiselect<T>>[0]) =>
  clackMultiselect({
    ...params,
    message: stylePromptMessage(params.message),
    options: params.options.map((opt) =>
      opt.hint === undefined ? opt : { ...opt, hint: stylePromptHint(opt.hint) },
    ),
  });

const pad = (value: string, size: number) => value.padEnd(size);

const truncate = (value: string, max: number) => {
  if (value.length <= max) {
    return value;
  }
  if (max <= 3) {
    return value.slice(0, max);
  }
  return `${value.slice(0, max - 3)}...`;
};

function sortScanResults(results: ModelScanResult[]): ModelScanResult[] {
  return results.slice().toSorted((a, b) => {
    const aImage = a.image.ok ? 1 : 0;
    const bImage = b.image.ok ? 1 : 0;
    if (aImage !== bImage) {
      return bImage - aImage;
    }

    const aToolLatency = a.tool.latencyMs ?? Number.POSITIVE_INFINITY;
    const bToolLatency = b.tool.latencyMs ?? Number.POSITIVE_INFINITY;
    if (aToolLatency !== bToolLatency) {
      return aToolLatency - bToolLatency;
    }

    return compareScanMetadata(a, b);
  });
}

function sortImageResults(results: ModelScanResult[]): ModelScanResult[] {
  return results.slice().toSorted((a, b) => {
    const aLatency = a.image.latencyMs ?? Number.POSITIVE_INFINITY;
    const bLatency = b.image.latencyMs ?? Number.POSITIVE_INFINITY;
    if (aLatency !== bLatency) {
      return aLatency - bLatency;
    }

    return compareScanMetadata(a, b);
  });
}

function compareScanMetadata(a: ModelScanResult, b: ModelScanResult): number {
  const aCtx = a.contextLength ?? 0;
  const bCtx = b.contextLength ?? 0;
  if (aCtx !== bCtx) {
    return bCtx - aCtx;
  }

  const aParams = a.inferredParamB ?? 0;
  const bParams = b.inferredParamB ?? 0;
  if (aParams !== bParams) {
    return bParams - aParams;
  }

  return a.modelRef.localeCompare(b.modelRef);
}

function buildScanHint(result: ModelScanResult): string {
  const toolLabel = result.tool.ok ? `tool ${formatMs(result.tool.latencyMs)}` : t("tool fail");
  const imageLabel = result.image.skipped
    ? t("img skip")
    : result.image.ok
      ? `img ${formatMs(result.image.latencyMs)}`
      : t("img fail");
  const ctxLabel = result.contextLength ? `ctx ${formatTokenK(result.contextLength)}` : t("ctx ?");
  const paramLabel = result.inferredParamB ? `${result.inferredParamB}b` : null;
  return [toolLabel, imageLabel, ctxLabel, paramLabel].filter(Boolean).join(t(" | "));
}

function printScanSummary(results: ModelScanResult[], runtime: RuntimeEnv) {
  const toolOk = results.filter((r) => r.tool.ok);
  const imageOk = results.filter((r) => r.image.ok);
  const toolImageOk = results.filter((r) => r.tool.ok && r.image.ok);
  const imageOnly = imageOk.filter((r) => !r.tool.ok);
  runtime.log(
    `Scan results: tested ${results.length}, tool ok ${toolOk.length}, image ok ${imageOk.length}, tool+image ok ${toolImageOk.length}, image only ${imageOnly.length}`,
  );
}

function printScanTable(results: ModelScanResult[], runtime: RuntimeEnv) {
  const header = [
    pad("Model", MODEL_PAD),
    pad("Tool", 10),
    pad("Image", 10),
    pad("Ctx", CTX_PAD),
    pad("Params", 8),
    "Notes",
  ].join(" ");
  runtime.log(header);

  for (const entry of results) {
    const modelLabel = pad(truncate(entry.modelRef, MODEL_PAD), MODEL_PAD);
    const toolLabel = pad(entry.tool.ok ? formatMs(entry.tool.latencyMs) : "fail", 10);
    const imageLabel = pad(
      entry.image.ok ? formatMs(entry.image.latencyMs) : entry.image.skipped ? "skip" : "fail",
      10,
    );
    const ctxLabel = pad(formatTokenK(entry.contextLength), CTX_PAD);
    const paramsLabel = pad(entry.inferredParamB ? `${entry.inferredParamB}b` : "-", 8);
    const notes = entry.modality ? `modality:${entry.modality}` : "";

    runtime.log([modelLabel, toolLabel, imageLabel, ctxLabel, paramsLabel, notes].join(" "));
  }
}

export async function modelsScanCommand(
  opts: {
    minParams?: string;
    maxAgeDays?: string;
    provider?: string;
    maxCandidates?: string;
    timeout?: string;
    concurrency?: string;
    yes?: boolean;
    input?: boolean;
    setDefault?: boolean;
    setImage?: boolean;
    json?: boolean;
    probe?: boolean;
  },
  runtime: RuntimeEnv,
) {
  const minParams = opts.minParams ? Number(opts.minParams) : undefined;
  if (minParams !== undefined && (!Number.isFinite(minParams) || minParams < 0)) {
    throw new Error(t("--min-params must be >= 0"));
  }
  const maxAgeDays = opts.maxAgeDays ? Number(opts.maxAgeDays) : undefined;
  if (maxAgeDays !== undefined && (!Number.isFinite(maxAgeDays) || maxAgeDays < 0)) {
    throw new Error(t("--max-age-days must be >= 0"));
  }
  const maxCandidates = opts.maxCandidates ? Number(opts.maxCandidates) : 6;
  if (!Number.isFinite(maxCandidates) || maxCandidates <= 0) {
    throw new Error(t("--max-candidates must be > 0"));
  }
  const timeout = opts.timeout ? Number(opts.timeout) : undefined;
  if (timeout !== undefined && (!Number.isFinite(timeout) || timeout <= 0)) {
    throw new Error(t("--timeout must be > 0"));
  }
  const concurrency = opts.concurrency ? Number(opts.concurrency) : undefined;
  if (concurrency !== undefined && (!Number.isFinite(concurrency) || concurrency <= 0)) {
    throw new Error(t("--concurrency must be > 0"));
  }

  const cfg = loadConfig();
  const probe = opts.probe ?? true;
  let storedKey: string | undefined;
  if (probe) {
    try {
      const resolved = await resolveApiKeyForProvider({
        provider: "openrouter",
        cfg,
      });
      storedKey = resolved.apiKey;
    } catch {
      storedKey = undefined;
    }
  }
  const results = await withProgressTotals(
    {
      label: t("Scanning OpenRouter models..."),
      indeterminate: false,
      enabled: opts.json !== true,
    },
    async (update) =>
      await scanOpenRouterModels({
        apiKey: storedKey ?? undefined,
        minParamB: minParams,
        maxAgeDays,
        providerFilter: opts.provider,
        timeoutMs: timeout,
        concurrency,
        probe,
        onProgress: ({ phase, completed, total }) => {
          if (phase !== "probe") {
            return;
          }
          const labelBase = probe ? t("Probing models") : t("Scanning models");
          update({
            completed,
            total,
            label: `${labelBase} (${completed}/${total})`,
          });
        },
      }),
  );

  if (!probe) {
    if (!opts.json) {
      runtime.log(
        `Found ${results.length} OpenRouter free models (metadata only; pass --probe to test tools/images).`,
      );
      printScanTable(sortScanResults(results), runtime);
    } else {
      runtime.log(JSON.stringify(results, null, 2));
    }
    return;
  }

  const toolOk = results.filter((entry) => entry.tool.ok);
  if (toolOk.length === 0) {
    throw new Error(t("No tool-capable OpenRouter free models found."));
  }

  const sorted = sortScanResults(results);
  const toolSorted = sortScanResults(toolOk);
  const imageOk = results.filter((entry) => entry.image.ok);
  const imageSorted = sortImageResults(imageOk);
  const imagePreferred = toolSorted.filter((entry) => entry.image.ok);
  const preselectPool = imagePreferred.length > 0 ? imagePreferred : toolSorted;
  const preselected = preselectPool
    .slice(0, Math.floor(maxCandidates))
    .map((entry) => entry.modelRef);
  const imagePreselected = imageSorted
    .slice(0, Math.floor(maxCandidates))
    .map((entry) => entry.modelRef);

  if (!opts.json) {
    printScanSummary(results, runtime);
    printScanTable(sorted, runtime);
  }

  const noInput = opts.input === false;
  const canPrompt = process.stdin.isTTY && !opts.yes && !noInput && !opts.json;
  let selected: string[] = preselected;
  let selectedImages: string[] = imagePreselected;

  if (canPrompt) {
    const selection = await multiselect({
      message: t("Select fallback models (ordered)"),
      options: toolSorted.map((entry) => ({
        value: entry.modelRef,
        label: entry.modelRef,
        hint: buildScanHint(entry),
      })),
      initialValues: preselected,
    });

    if (isCancel(selection)) {
      cancel(stylePromptTitle(t("Model scan cancelled.")) ?? t("Model scan cancelled."));
      runtime.exit(0);
    }

    selected = selection;
    if (imageSorted.length > 0) {
      const imageSelection = await multiselect({
        message: t("Select image fallback models (ordered)"),
        options: imageSorted.map((entry) => ({
          value: entry.modelRef,
          label: entry.modelRef,
          hint: buildScanHint(entry),
        })),
        initialValues: imagePreselected,
      });

      if (isCancel(imageSelection)) {
        cancel(stylePromptTitle(t("Model scan cancelled.")) ?? t("Model scan cancelled."));
        runtime.exit(0);
      }

      selectedImages = imageSelection;
    }
  } else if (!process.stdin.isTTY && !opts.yes && !noInput && !opts.json) {
    throw new Error(t("Non-interactive scan: pass --yes to apply defaults."));
  }

  if (selected.length === 0) {
    throw new Error(t("No models selected for fallbacks."));
  }
  if (opts.setImage && selectedImages.length === 0) {
    throw new Error(t("No image-capable models selected for image model."));
  }

  const _updated = await updateConfig((cfg) => {
    const nextModels = { ...cfg.agents?.defaults?.models };
    for (const entry of selected) {
      if (!nextModels[entry]) {
        nextModels[entry] = {};
      }
    }
    for (const entry of selectedImages) {
      if (!nextModels[entry]) {
        nextModels[entry] = {};
      }
    }
    const existingImageModel = cfg.agents?.defaults?.imageModel as
      | { primary?: string; fallbacks?: string[] }
      | undefined;
    const nextImageModel =
      selectedImages.length > 0
        ? {
            ...(existingImageModel?.primary ? { primary: existingImageModel.primary } : undefined),
            fallbacks: selectedImages,
            ...(opts.setImage ? { primary: selectedImages[0] } : {}),
          }
        : cfg.agents?.defaults?.imageModel;
    const existingModel = cfg.agents?.defaults?.model as
      | { primary?: string; fallbacks?: string[] }
      | undefined;
    const defaults = {
      ...cfg.agents?.defaults,
      model: {
        ...(existingModel?.primary ? { primary: existingModel.primary } : undefined),
        fallbacks: selected,
        ...(opts.setDefault ? { primary: selected[0] } : {}),
      },
      ...(nextImageModel ? { imageModel: nextImageModel } : {}),
      models: nextModels,
    } satisfies NonNullable<NonNullable<typeof cfg.agents>["defaults"]>;
    return {
      ...cfg,
      agents: {
        ...cfg.agents,
        defaults,
      },
    };
  });

  if (opts.json) {
    runtime.log(
      JSON.stringify(
        {
          selected,
          selectedImages,
          setDefault: Boolean(opts.setDefault),
          setImage: Boolean(opts.setImage),
          results,
          warnings: [],
        },
        null,
        2,
      ),
    );
    return;
  }

  logConfigUpdated(runtime);
  runtime.log(`Fallbacks: ${selected.join(t(", "))}`);
  if (selectedImages.length > 0) {
    runtime.log(`Image fallbacks: ${selectedImages.join(t(", "))}`);
  }
  if (opts.setDefault) {
    runtime.log(`Default model: ${selected[0]}`);
  }
  if (opts.setImage && selectedImages.length > 0) {
    runtime.log(`Image model: ${selectedImages[0]}`);
  }
}
