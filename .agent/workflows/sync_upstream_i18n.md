---
description: Sync upstream changes to feature/i18n-chinese and resolve i18n conflicts
---

This workflow helps you synchronize the `feature/i18n-chinese` branch with the upstream `openclaw` repository (`origin`), ensuring that new features are merged while preserving Chinese specific translations and logic.

# Prerequisites

- Ensure your working directory is clean (`git status` shows no uncommitted changes).
- Ensure `origin` remote points to the upstream repo (`https://github.com/openclaw/openclaw.git`).

# Steps

1. **Update Local Main Branch**
   Switch to `main`, fetch the latest from upstream (`origin`), and sync it.

   ```bash
   git checkout main
   // turbo
   git pull origin main
   // turbo
   git push olwater main
   ```

2. **Merge into i18n Branch**
   Switch back to the i18n feature branch and merge the updated `main`.

   ```bash
   git checkout feature/i18n-chinese
   git merge main
   ```

3. **Resolve Conflicts (Crucial Step)**
   If there are merge conflicts, follow these rules:
   - **Logic Updates**: Accept upstream (Source/Theirs) changes for functional logic (new options, new flags, bug fixes).
   - **Strings/UI**:
     - If the upstream code adds a new string literal (e.g., `.description("New Feature")`), **WRAP** it in `t()` (e.g., `.description(t("New Feature"))`).
     - **DO NOT** delete existing `t("...")` wrappers just because upstream changed the string. Update the English key inside `t()` to match upstream if necessary, then update the translation.
   - **Imports**: Ensure `import { t } from "../i18n/index.js";` is preserved in conflicting files (like CLI commands).

4. **Sync Lockfile (MANDATORY)**
   Git merging updates `package.json` but often fails to update `pnpm-lock.yaml` correctly, causing CI/Docker failures. You MUST run this manually.

   ```bash
   # Regenerate lockfile to match package.json
   pnpm install

   # If lockfile changed, commit it immediately
   if ! git diff --quiet pnpm-lock.yaml; then
       git add pnpm-lock.yaml package.json
       git commit -m "chore: sync lockfile with package.json"
   fi
   ```

5. **Update Translations**
   After resolving conflicts and fixing dependencies, check for new untranslated strings.
   - Run a search for new `t("...")` keys you added.
   - Add them to `src/i18n/locales/zh_CN.ts` if they are missing.
   - **Tip**: New features often introduce new files. Check the `git log` or merge output for new `.ts` files in `src/commands` or `src/cli` and see if they need `t()` wrappers.

6. **Verify and Push**
   Build to ensure no syntax errors were introduced during merge.
   ```bash
   npm run build
   # Verify basic output (adjust LANG as needed)
   LANG=zh_CN node openclaw.mjs --help
   ```
   If successful, push the updated feature branch.
   ```bash
   git push olwater feature/i18n-chinese
   ```
