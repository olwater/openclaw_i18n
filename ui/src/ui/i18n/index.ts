import zh_CN from "./locales/zh_CN";

export type TranslationMap = Record<string, string>;

const locales: Record<string, TranslationMap> = {
  "zh-CN": zh_CN,
};

let currentLocale = navigator.language.startsWith("zh") ? "zh-CN" : "en";

export function setLocale(locale: string) {
  currentLocale = locale;
}

export function getLocale(): string {
  return currentLocale;
}

/**
 * Translates a string key.
 * If the translation is missing, returns the key itself.
 */
export function t(key: string): string {
  if (currentLocale === "en") {
    return key;
  }
  const map = locales[currentLocale];
  if (!map) {
    return key;
  }
  return map[key] || key;
}
