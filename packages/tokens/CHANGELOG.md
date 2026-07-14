# @drx-dls/tokens

## 0.1.0

### Minor Changes

- 1a125cf: Initial release, targeting WebAwesome. `@drx-dls/tokens` derives a WebAwesome `--wa-color-{variant}-{tint}` palette (11 tints, OKLCH) per variant from per-app identity inputs, plus global scale knobs (`--wa-*-scale`) driven by a web/iOS/tvOS device layer. Emitters for CSS, Swift (native mirror), and JSON; `drx-theme build` CLI.
- dba830c: Add advisory WCAG contrast validation. `@drx-dls/tokens` now exports
  `checkContrast(resolvedTheme)`, which evaluates WCAG 2.1 AA contrast (4.5:1)
  for the text-on-fill pairs WebAwesome's default light-mode semantic layer uses
  per variant (loud: white/tint-50, normal: tint-30/tint-90, quiet: tint-40/tint-95)
  and returns a per-variant pass/fail report plus a flat `violations` list, with a
  `formatViolation` helper. `drx-theme build` prints violations as non-blocking
  warnings, and Theme Studio surfaces them next to the color pickers. Advisory
  only — dark mode, custom palette overrides, and non-text UI contrast are not
  checked, and colors are never enforced or rewritten.
- dba830c: Add custom web-font support. `Identity` gains an optional `fontFaces` array
  (`family`, `src`, optional `weight`/`style`/`display`). The CSS emitter
  generates one `@font-face` rule per entry before the `--wa-font-family-*`
  declarations, inferring `format(...)` from the URL extension
  (woff2/woff/ttf/otf) and stripping query/hash, while passing through full CSS
  `src` values (containing `url(`/`local(`) verbatim; `font-display` defaults to
  `swap`. The Swift and JSON emitters pass the metadata through as-is
  (`DRXFonts.customFaces`) — native font loading remains an app-repo concern.
- 4d6b359: Add per-device scale overrides and standalone per-device CSS export. One app
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

- dba830c: Add a form-control token group to the theme identity. `drx.theme.json` can now
  set `formControl` inputs (`paddingBlock`, `paddingInline`, `borderColor`,
  `borderWidth`, `borderStyle`, `borderRadius`) that map to WebAwesome's
  `--wa-form-control-*` component-group tokens (inputs, selects, textareas,
  buttons). `borderColor` accepts a raw hex or a variant-tint reference like
  `neutral-70`, which the CSS emitter links to `var(--wa-color-neutral-70)` and
  the Swift emitter resolves to the palette hex. Non-breaking — sensible defaults
  are provided in `base.tokens.json`.
- 8ac6a7a: Add two optional override layers to the identity model (DRI-99 / DRI-100), both
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

- dba830c: Add schema versioning + validation for theme inputs. `validateThemeInputs`, `migrateThemeInputs`, `formatValidationIssue`, and `CURRENT_SCHEMA_VERSION` are now exported; `drx-theme build` validates loaded `drx.theme.json` files (failing with clear messages on invalid shapes/versions) and migrates older files before generating a theme. Per-app files may declare a `version` field.
