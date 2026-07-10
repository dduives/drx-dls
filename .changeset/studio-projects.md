---
"@drx-dls/studio": minor
---

Add multi-project support. Studio now manages multiple named theme projects side-by-side, each an independent `Identity` inputs instance, persisted in `localStorage`. A top-bar project switcher lists saved projects with create / rename / duplicate / delete / select actions, and each project can import an existing `drx.theme.json` (validated + migrated before overwriting its inputs). The active project's inputs are the single source of truth in `ThemeInputsContext`; edits persist back automatically and survive reload.
