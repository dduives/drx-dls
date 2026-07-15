---
"@drx-dls/tokens": minor
---

Add optional `customFontUrl` identity field (DRI-108): a Google Fonts stylesheet URL emitted as an `@import` in the generated CSS (before any `@font-face`), so a custom web font loads at runtime. Validated as an optional string by `validateThemeInputs`; passed through `resolveIdentity` and the JSON emitter. Web-only — native emitters ignore it. No schema version bump (backward-compatible additive field).
