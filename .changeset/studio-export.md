---
"@drx-dls/studio": minor
---

Add top-bar export/import. Studio can now download the active project's inputs as a `drx.theme.json` (inputs only, matching `drx.theme.example.json` and tagged with `CURRENT_SCHEMA_VERSION` — no resolved palette), plus an optional secondary download of the generated drop-in `theme.css` (unscoped CLI `emitCss` output). A top-bar Import control loads an existing `drx.theme.json` into the active project, reusing the shared `importThemeInputs` validation/migration and routing through `replaceInputs` so the editor and live preview re-seed. Export round-trips cleanly back through import. The pure `buildThemeJson`/`buildThemeCss` helpers (`src/lib/exportTheme.ts`) keep serialization unit-testable.
