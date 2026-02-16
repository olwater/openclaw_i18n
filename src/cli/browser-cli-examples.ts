import { t } from "../i18n/index.js";

export const browserCoreExamples = [
  t("openclaw browser status"),
  t("openclaw browser start"),
  t("openclaw browser stop"),
  t("openclaw browser tabs"),
  t("openclaw browser open https://example.com"),
  t("openclaw browser focus abcd1234"),
  t("openclaw browser close abcd1234"),
  t("openclaw browser screenshot"),
  t("openclaw browser screenshot --full-page"),
  t("openclaw browser screenshot --ref 12"),
  t("openclaw browser snapshot"),
  t("openclaw browser snapshot --format aria --limit 200"),
  t("openclaw browser snapshot --efficient"),
  t("openclaw browser snapshot --labels"),
];

export const browserActionExamples = [
  t("openclaw browser navigate https://example.com"),
  t("openclaw browser resize 1280 720"),
  t("openclaw browser click 12 --double"),
  t('openclaw browser type 23 "hello" --submit'),
  t("openclaw browser press Enter"),
  t("openclaw browser hover 44"),
  t("openclaw browser drag 10 11"),
  t("openclaw browser select 9 OptionA OptionB"),
  t("openclaw browser upload /tmp/file.pdf"),
  t('openclaw browser fill --fields \'[{"ref":"1","value":"Ada"}]\''),
  t("openclaw browser dialog --accept"),
  t('openclaw browser wait --text "Done"'),
  t("openclaw browser evaluate --fn '(el) => el.textContent' --ref 7"),
  t("openclaw browser console --level error"),
  t("openclaw browser pdf"),
];
