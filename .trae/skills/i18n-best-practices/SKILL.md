---
name: "i18n-best-practices"
description: "Guidelines for i18n implementation in OpenClaw. Invoke when adding translations, running auto-i18n scripts, or fixing locale file errors."
---

# I18n Best Practices for OpenClaw

This skill provides guidelines and common pitfalls for internationalization (i18n) in the OpenClaw codebase.

## Common Pitfalls

1.  **Duplicate Keys**: Locale files (e.g., `zh_CN.ts`) must NOT contain duplicate keys. This causes TypeScript errors and makes maintenance difficult.
2.  **Syntax Errors in Locales**:
    *   Always ensure proper quoting.
    *   Escape special characters (backslashes, newlines, quotes).
    *   Ensure every key-value pair ends with a comma.
    *   Maintain the `export default { ... };` structure.
3.  **Type Mismatches**:
    *   `t("string")` returns a generic `string`.
    *   If a function or property expects a specific string literal (e.g., `"web" | "tui"`), using `t()` will cause a type error.
    *   **Solution**: Use `as any` or a specific type assertion, OR avoid translating internal logic values like `initialValue` for selects.
4.  **Variable Shadowing**: Avoid using `t` as a variable name in scopes where the translation function `t()` is needed (e.g., in `.map((t) => ...)`). Use `tok`, `item`, or other descriptive names instead.
5.  **Global Keywords**: Avoid using reserved or global-like keys as raw identifiers (e.g., `global: global`). Use quoted keys and string values: `"global": "global"`.

## Implementation Rules

1.  **Unique Keys**: Use the English source string as the key.
2.  **No Translation for Logic**: Do NOT translate values used for internal logic (IDs, select values, mode names). Only translate labels, messages, and descriptions.
3.  **Strict Escape**: When generating locale files programmatically, use `JSON.stringify` for keys and values to ensure valid TS/JS syntax.
4.  **Verification**: Always run `pnpm build` after modifying i18n files or running automation scripts to catch syntax and type errors early.

## Automation Script Requirements

Any auto-i18n script must:
- Globalize keys to prevent duplicates.
- Filter out string literals that are part of Type Aliases or Enums.
- Correctly handle imports of the `t` function.
- Provide a way to merge with existing translations without losing work.
