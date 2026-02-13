import type { Locale, TranslationMap, TranslationSet } from "./types.js";
import en_US from "./locales/en_US.js";
import zh_CN from "./locales/zh_CN.js";

export type { Locale, TranslationMap, TranslationSet };

export const translations: TranslationSet = {
  en_US,
  zh_CN,
};

let currentLocale: Locale | undefined;

/** Set the active locale globally. */
export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

export function getLocale(): Locale {
  if (currentLocale) {
    return currentLocale;
  }
  const envLocale = (
    process.env.OPENCLAW_LANG ||
    process.env.LANG ||
    process.env.LC_ALL ||
    process.env.LC_MESSAGES ||
    ""
  ).toLowerCase();
  if (envLocale.includes("zh_cn") || envLocale.includes("zh-cn")) {
    return "zh_CN";
  }
  return "en_US";
}

export function t(
  key: string,
  args?: Record<string, string | number>,
  locale: Locale = getLocale(),
): string {
  const map = translations[locale] || translations.en_US;
  let translated = key;

  if (map) {
    translated = map[key] || translations.en_US?.[key] || key;
  }

  if (args) {
    for (const [k, v] of Object.entries(args)) {
      translated = translated.replace(new RegExp(`{{${k}}}`, "g"), String(v));
    }
  }

  return translated;
}
