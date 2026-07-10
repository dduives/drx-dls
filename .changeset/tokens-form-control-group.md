---
"@drx-dls/tokens": minor
---

Add a form-control token group to the theme identity. `drx.theme.json` can now
set `formControl` inputs (`paddingBlock`, `paddingInline`, `borderColor`,
`borderWidth`, `borderStyle`, `borderRadius`) that map to WebAwesome's
`--wa-form-control-*` component-group tokens (inputs, selects, textareas,
buttons). `borderColor` accepts a raw hex or a variant-tint reference like
`neutral-70`, which the CSS emitter links to `var(--wa-color-neutral-70)` and
the Swift emitter resolves to the palette hex. Non-breaking — sensible defaults
are provided in `base.tokens.json`.
