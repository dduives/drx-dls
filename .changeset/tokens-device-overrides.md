---
"@drx-dls/tokens": minor
---

Add per-device scale overrides and standalone per-device CSS export. One app
identity (shared palette/typography/form-control) can now vary the global scale
knobs (`--wa-*-scale`) per device: `drx.theme.json` accepts an optional
`devices` block overriding the web/iOS/tvOS multipliers per knob (missing knobs
fall back to the base device layer). `resolveIdentity` deep-merges these over
`base.tokens.json` `devices` and exposes them as the always-present
`Identity.devices`; `generateTheme` returns the resolved `devices`.

`emitCss` gains an options arg: `emitCss(theme, { device })`. Without `device`
it emits the current combined file (web scales in `:root`, `[data-device]`
blocks for iOS/tvOS) — byte-for-byte identical when no per-app device overrides
are present. With `device` set it emits a self-contained standalone file for
that device (its resolved scales in `:root`, no `[data-device]` blocks) for
separate app repos. The CLI adds `drx-theme build --device web|ios|tvos`.
`validateThemeInputs` now accepts the optional `devices` block (valid device
keys, numeric scale knobs). Non-breaking: existing themes and `emitCss(theme)`
calls behave exactly as before.
