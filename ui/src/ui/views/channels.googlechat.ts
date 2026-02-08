import { html, nothing } from "lit";
import type { GoogleChatStatus } from "../types.ts";
import type { ChannelsProps } from "./channels.types.ts";
import { formatRelativeTimestamp } from "../format.ts";
import { t } from "../i18n/index.ts";
import { renderChannelConfigSection } from "./channels.config.ts";

export function renderGoogleChatCard(params: {
  props: ChannelsProps;
  googleChat?: GoogleChatStatus | null;
  accountCountLabel: unknown;
}) {
  const { props, googleChat, accountCountLabel } = params;

  return html`
    <div class="card">
      <div class="card-title">Google Chat</div>
      <div class="card-sub">${t("Chat API webhook status and channel configuration.")}</div>
      ${accountCountLabel}

      <div class="status-list" style="margin-top: 16px;">
        <div>
          <span class="label">${t("Configured")}</span>
          <span>${googleChat ? (googleChat.configured ? t("Yes") : t("No")) : t("n/a")}</span>
        </div>
        <div>
          <span class="label">${t("Running")}</span>
          <span>${googleChat ? (googleChat.running ? t("Yes") : t("No")) : t("n/a")}</span>
        </div>
        <div>
          <span class="label">${t("Credential")}</span>
          <span>${googleChat?.credentialSource ?? t("n/a")}</span>
        </div>
        <div>
          <span class="label">${t("Audience")}</span>
          <span>
            ${
              googleChat?.audienceType
                ? `${t(googleChat.audienceType)}${googleChat.audience ? ` · ${googleChat.audience}` : ""}`
                : t("n/a")
            }
          </span>
        </div>
        <div>
          <span class="label">${t("Last start")}</span>
          <span>${googleChat?.lastStartAt ? formatRelativeTimestamp(googleChat.lastStartAt) : t("n/a")}</span>
        </div>
        <div>
          <span class="label">${t("Last probe")}</span>
          <span>${googleChat?.lastProbeAt ? formatRelativeTimestamp(googleChat.lastProbeAt) : t("n/a")}</span>
        </div>
      </div>

      ${
        googleChat?.lastError
          ? html`<div class="callout danger" style="margin-top: 12px;">
            ${googleChat.lastError}
          </div>`
          : nothing
      }

      ${
        googleChat?.probe
          ? html`<div class="callout" style="margin-top: 12px;">
            ${t("Probe")} ${googleChat.probe.ok ? t("ok") : t("failed")} ·
            ${googleChat.probe.status ?? ""} ${googleChat.probe.error ?? ""}
          </div>`
          : nothing
      }

      ${renderChannelConfigSection({ channelId: "googlechat", props })}

      <div class="row" style="margin-top: 12px;">
        <button class="btn" @click=${() => props.onRefresh(true)}>
          ${t("Probe")}
        </button>
      </div>
    </div>
  `;
}
