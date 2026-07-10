---
"@drx-dls/studio": minor
---

Add the left-panel control surface. Every control is fully controlled off the
shared `useThemeInputs()` state and writes through its setters, so edits flow
straight into the live preview (DRI-52). Controls: variant **color pickers**
(brand/neutral/success/warning/danger → `setVariantColor`); **scale sliders**
for the four global knobs (`radiusScale`, `spaceScale`, `fontSizeScale`,
`borderWidthScale`, range 0.5–2.0 step 0.05, centered on the 1.0 base default →
`updateIdentity`); **font-family** inputs for body/heading/code
(`setFontFamily`); a **Form Controls** subsection for the `--wa-form-control-*`
group (`paddingBlock`, `paddingInline`, `borderWidth`, `borderRadius`,
`borderStyle`, and a `borderColor` variant×tint palette picker that encodes
`variant-tint` refs like `neutral-70`, with a raw-hex fallback); and a
preview-only light/dark/auto **mode toggle** (delegates to
`setColorScheme`/`getColorScheme` from `@drx-dls/webawesome`, tracked in local
state — mode is not part of identity). Adds a `setFormControl` convenience
setter to the theme-inputs context. The existing contrast warnings and custom
font-faces editor are grouped into the panel.
