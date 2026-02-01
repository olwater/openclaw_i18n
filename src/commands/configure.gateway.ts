import type { OpenClawConfig } from "../config/config.js";
import type { RuntimeEnv } from "../runtime.js";
import { resolveGatewayPort } from "../config/config.js";
import { t } from "../i18n/index.js";
import { findTailscaleBinary } from "../infra/tailscale.js";
import { note } from "../terminal/note.js";
import { buildGatewayAuthConfig } from "./configure.gateway-auth.js";
import { confirm, select, text } from "./configure.shared.js";
import { guardCancel, normalizeGatewayTokenInput, randomToken } from "./onboard-helpers.js";

type GatewayAuthChoice = "token" | "password";

export async function promptGatewayConfig(
  cfg: OpenClawConfig,
  runtime: RuntimeEnv,
): Promise<{
  config: OpenClawConfig;
  port: number;
  token?: string;
}> {
  const portRaw = guardCancel(
    await text({
      message: t("Gateway port"),
      initialValue: String(resolveGatewayPort(cfg)),
      validate: (value) => (Number.isFinite(Number(value)) ? undefined : t("Invalid port")),
    }),
    runtime,
  );
  const port = Number.parseInt(String(portRaw), 10);

  let bind = guardCancel(
    await select({
      message: t("Gateway bind mode"),
      options: [
        {
          value: "loopback",
          label: t("Loopback (Local only)"),
          hint: t("Bind to 127.0.0.1 - secure, local-only access"),
        },
        {
          value: "tailnet",
          label: t("Tailnet (Tailscale IP)"),
          hint: t("Bind to your Tailscale IP only (100.x.x.x)"),
        },
        {
          value: "auto",
          label: t("Auto (Loopback → LAN)"),
          hint: t("Prefer loopback; fall back to all interfaces if unavailable"),
        },
        {
          value: "lan",
          label: t("LAN (All interfaces)"),
          hint: t("Bind to 0.0.0.0 - accessible from anywhere on your network"),
        },
        {
          value: "custom",
          label: t("Custom IP"),
          hint: t("Specify a specific IP address, with 0.0.0.0 fallback if unavailable"),
        },
      ],
    }),
    runtime,
  );

  let customBindHost: string | undefined;
  if (bind === "custom") {
    const input = guardCancel(
      await text({
        message: t("Custom IP address"),
        placeholder: t("192.168.1.100"),
        validate: (value) => {
          if (!value) {
            return t("IP address is required for custom bind mode");
          }
          const trimmed = value.trim();
          const parts = trimmed.split(".");
          if (parts.length !== 4) {
            return t("Invalid IPv4 address (e.g., 192.168.1.100)");
          }
          if (
            parts.every((part) => {
              const n = parseInt(part, 10);
              return !Number.isNaN(n) && n >= 0 && n <= 255 && part === String(n);
            })
          ) {
            return undefined;
          }
          return t("Invalid IPv4 address (each octet must be 0-255)");
        },
      }),
      runtime,
    );
    customBindHost = typeof input === "string" ? input : undefined;
  }

  let authMode = guardCancel(
    await select({
      message: t("Gateway auth"),
      options: [
        { value: "token", label: t("Token"), hint: t("Recommended default") },
        { value: "password", label: t("Password") },
      ],
      initialValue: t("token"),
    }),
    runtime,
  ) as GatewayAuthChoice;

  const tailscaleMode = guardCancel(
    await select({
      message: t("Tailscale exposure"),
      options: [
        { value: "off", label: t("Off"), hint: t("No Tailscale exposure") },
        {
          value: "serve",
          label: t("Serve"),
          hint: t("Private HTTPS for your tailnet (devices on Tailscale)"),
        },
        {
          value: "funnel",
          label: t("Funnel"),
          hint: t("Public HTTPS via Tailscale Funnel (internet)"),
        },
      ],
    }),
    runtime,
  );

  // Detect Tailscale binary before proceeding with serve/funnel setup.
  if (tailscaleMode !== "off") {
    const tailscaleBin = await findTailscaleBinary();
    if (!tailscaleBin) {
      note(
        [
          t("Tailscale binary not found in PATH or /Applications."),
          t("Ensure Tailscale is installed from:"),
          t("  https://tailscale.com/download/mac"),
          "",
          t("You can continue setup, but serve/funnel will fail at runtime."),
        ].join("\n"),
        t("Tailscale Warning"),
      );
    }
  }

  let tailscaleResetOnExit = false;
  if (tailscaleMode !== "off") {
    note(
      ["Docs:", "https://docs.openclaw.ai/gateway/tailscale", "https://docs.openclaw.ai/web"].join(
        "\n",
      ),
      "Tailscale",
    );
    tailscaleResetOnExit = Boolean(
      guardCancel(
        await confirm({
          message: t("Reset Tailscale serve/funnel on exit?"),
          initialValue: false,
        }),
        runtime,
      ),
    );
  }

  if (tailscaleMode !== "off" && bind !== "loopback") {
    note(t("Tailscale requires bind=loopback. Adjusting bind to loopback."), "Note");
    bind = "loopback";
  }

  if (tailscaleMode === "funnel" && authMode !== "password") {
    note(t("Tailscale funnel requires password auth."), "Note");
    authMode = "password";
  }

  let gatewayToken: string | undefined;
  let gatewayPassword: string | undefined;
  let next = cfg;

  if (authMode === "token") {
    const tokenInput = guardCancel(
      await text({
        message: t("Gateway token (blank to generate)"),
        initialValue: randomToken(),
      }),
      runtime,
    );
    gatewayToken = normalizeGatewayTokenInput(tokenInput) || randomToken();
  }

  if (authMode === "password") {
    const password = guardCancel(
      await text({
        message: t("Gateway password"),
        validate: (value) => (value?.trim() ? undefined : "Required"),
      }),
      runtime,
    );
    gatewayPassword = String(password).trim();
  }

  const authConfig = buildGatewayAuthConfig({
    existing: next.gateway?.auth,
    mode: authMode,
    token: gatewayToken,
    password: gatewayPassword,
  });

  next = {
    ...next,
    gateway: {
      ...next.gateway,
      mode: "local",
      port,
      bind,
      auth: authConfig,
      ...(customBindHost && { customBindHost }),
      tailscale: {
        ...next.gateway?.tailscale,
        mode: tailscaleMode,
        resetOnExit: tailscaleResetOnExit,
      },
    },
  };

  return { config: next, port, token: gatewayToken };
}
