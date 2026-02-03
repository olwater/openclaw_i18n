export type TranslationMap = {
  [key: string]: string;
};

export type Locale = "en_US" | "zh_CN";

export type TranslationSet = {
  en_US: TranslationMap;
  zh_CN: TranslationMap;
};
