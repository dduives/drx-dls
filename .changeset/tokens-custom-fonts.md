---
"@drx-dls/tokens": minor
---

Add custom web-font support. `Identity` gains an optional `fontFaces` array
(`family`, `src`, optional `weight`/`style`/`display`). The CSS emitter
generates one `@font-face` rule per entry before the `--wa-font-family-*`
declarations, inferring `format(...)` from the URL extension
(woff2/woff/ttf/otf) and stripping query/hash, while passing through full CSS
`src` values (containing `url(`/`local(`) verbatim; `font-display` defaults to
`swap`. The Swift and JSON emitters pass the metadata through as-is
(`DRXFonts.customFaces`) — native font loading remains an app-repo concern.
