---
"@drx-dls/webawesome": minor
---

Swap the default icon library from Font Awesome to Phosphor Icons. Font
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
