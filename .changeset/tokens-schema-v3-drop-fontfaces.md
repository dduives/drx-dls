---
"@drx-dls/tokens": minor
---

Bump the theme schema to v3 and consolidate Wave 1 into a single migration (DRI-113). The hand-entered `fontFaces` field is removed — superseded by DRI-108's Google Fonts `customFontUrl`. `MIGRATIONS[2]` drops `fontFaces` when upgrading a v2 `drx.theme.json` to v3 (no value preservation; users re-add fonts via `customFontUrl`). The `FontFace` type, the `@font-face` CSS emitter, and the Swift `customFaces` metadata are gone. `paletteOverrides`, the scale knobs + `devices` block, and `fontFamily.code` are all kept.
