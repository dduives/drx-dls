---
"@drx-dls/tokens": minor
---

Add two optional override layers to the identity model (DRI-99 / DRI-100), both
defaulting to empty so existing themes render unchanged:

- **`paletteOverrides`** — per-step palette pins. Pin a specific `variant`/`tint`
  to an exact hex, overriding the OKLCH-derived ramp value for that one step; all
  other steps stay fully generated. `deriveScale` now accepts an optional
  overrides map, and the CSS/Swift/JSON emitters reflect pinned tints.
- **`components`** — per-component-family background overrides. `badgeBackground`
  emits a top-level `wa-badge { … }` rule (the element's `:host` background is
  overridable by outer author styles); `formControlBackground` emits
  `--wa-form-control-background-color`. Each value is a hex or `variant-tint`
  reference (`brand-40`), resolved via `resolveColorRef` (Swift → palette hex).

Also exports `formatOklch(color)`, a small helper that formats a color as
`oklch(L% C H)` for tooling/UI display. Schema validation and export/import
round-tripping cover both new fields.
