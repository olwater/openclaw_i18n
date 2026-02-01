import en_US from "./locales/en_US.js";
import zh_CN from "./locales/zh_CN.js";

export type Locale = "en_US" | "zh_CN";

export interface TranslationMap {
  [key: string]: string;
}

export interface TranslationSet {
  en_US: TranslationMap;
  zh_CN: TranslationMap;
}

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
  const envLocale = process.env.LANG || process.env.LC_ALL || process.env.LC_MESSAGES;
  if (envLocale?.includes("zh_CN")) {
    return "zh_CN";
  }
  return "en_US";
}

export function t(key: string, locale: Locale = getLocale()): string {
  return translations[locale][key] || translations.en_US[key] || key;
}
