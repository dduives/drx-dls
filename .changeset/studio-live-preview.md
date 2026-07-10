---
"@drx-dls/studio": minor
---

Add live theme preview. On every inputs change (and project switch), Studio now
runs the same `generateTheme` + `emitCss` from `@drx-dls/tokens` as the CLI —
imported directly, no forked copy — and injects the resulting `--wa-*` custom
properties into a managed `<style>` element scoped to the preview pane. The
generated `:root` block is rewritten to a `[data-drx-preview]` scope selector
and the `[data-device="ios"|"tvos"]` blocks are prefixed with it, so device
overrides activate when `data-device` is set on the preview root (wiring up
the forthcoming platform toggle). `@font-face` rules stay unscoped at the top
level. Studio's own chrome is unaffected.
