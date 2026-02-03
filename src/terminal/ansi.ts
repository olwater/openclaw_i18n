const ANSI_SGR_PATTERN = "\\x1b\\[[0-9;]*m";
// OSC-8 hyperlinks: ESC ] 8 ; ; url ST ... ESC ] 8 ; ; ST
const OSC8_PATTERN = "\\x1b\\]8;;.*?\\x1b\\\\|\\x1b\\]8;;\\x1b\\\\";

const ANSI_REGEX = new RegExp(ANSI_SGR_PATTERN, "g");
const OSC8_REGEX = new RegExp(OSC8_PATTERN, "g");

export function stripAnsi(input: string): string {
  return input.replace(OSC8_REGEX, "").replace(ANSI_REGEX, "");
}

/**
 * 计算字符串的显示宽度,正确处理东亚全角字符
 * 全角字符(中文、日文、韩文等)占用2个显示宽度
 */
export function visibleWidth(input: string): number {
  const stripped = stripAnsi(input);
  let width = 0;

  for (const char of stripped) {
    const code = char.codePointAt(0);
    if (!code) {
      continue;
    }

    // 东亚全角字符范围 (占用2个显示宽度)
    // CJK统一表意文字: 0x4E00-0x9FFF
    // CJK扩展A: 0x3400-0x4DBF
    // CJK兼容表意文字: 0xF900-0xFAFF
    // 全角ASCII和全角标点: 0xFF00-0xFFEF
    // Hiragana/Katakana: 0x3040-0x30FF
    // Hangul Syllables: 0xAC00-0xD7AF
    if (
      (code >= 0x4e00 && code <= 0x9fff) || // CJK统一表意文字
      (code >= 0x3400 && code <= 0x4dbf) || // CJK扩展A
      (code >= 0xf900 && code <= 0xfaff) || // CJK兼容表意文字
      (code >= 0xff00 && code <= 0xffef) || // 全角ASCII和全角标点
      (code >= 0x3040 && code <= 0x30ff) || // Hiragana/Katakana
      (code >= 0xac00 && code <= 0xd7af) // Hangul Syllables
    ) {
      width += 2;
    } else {
      width += 1;
    }
  }

  return width;
}
