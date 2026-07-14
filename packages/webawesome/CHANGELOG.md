# @drx-dls/webawesome

## 0.1.0

### Minor Changes

- 152318a: Swap the default icon library from Font Awesome to Phosphor Icons. Font
  Awesome's interesting families are paywalled (only ~2000 Free icons resolve
  without a kit token), so `@drx-dls/webawesome` now overrides WebAwesome's
  `default` and internal `system` icon libraries with
  [Phosphor](https://phosphoricons.com) (MIT, 1200+ glyphs, 6 weights). SVGs are
  served from jsDelivr (pinned via `PHOSPHOR_VERSION`) — no webfont, no kit token,
  no bundler asset config.

  New exports: `registerPhosphorIcons()` / `registerIcons()` (alias),
  `PHOSPHOR_VERSION`, and the `PhosphorWeight` type. `registerAll()` calls it
  automatically. Weights are chosen via the `variant` attribute
  (`thin`/`light`/`regular`/`bold`/`fill`/`duotone`); an unset/`solid` variant maps
  to Phosphor's canonical `regular`. WebAwesome's internal component icons (select
  carets, dialog close, checkbox check, media controls) are remapped by name
  automatically.

  **Migration:** icon names differ from Font Awesome — audit `<wa-icon name="…">`
  usages and rename to Phosphor equivalents (e.g. `xmark` → `x`).

- b008198: Initial release. `@drx-dls/webawesome` registers WebAwesome Free web components (button, input, card, dialog, etc.), applies a DRX-generated `theme.css` at runtime via `applyTheme`, and toggles light/dark/auto color scheme via `setColorScheme`/`getColorScheme`. Components are themed entirely through `--wa-*` custom properties emitted by `@drx-dls/tokens`, so swapping themes requires no component changes.

### Patch Changes

- Updated dependencies [1a125cf]
- Updated dependencies [dba830c]
- Updated dependencies [dba830c]
- Updated dependencies [4d6b359]
- Updated dependencies [dba830c]
- Updated dependencies [8ac6a7a]
- Updated dependencies [dba830c]
  - @drx-dls/tokens@0.1.0
