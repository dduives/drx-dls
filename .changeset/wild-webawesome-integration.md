---
"@drx-dls/webawesome": minor
---

Initial release. `@drx-dls/webawesome` registers WebAwesome Free web components (button, input, card, dialog, etc.), applies a DRX-generated `theme.css` at runtime via `applyTheme`, and toggles light/dark/auto color scheme via `setColorScheme`/`getColorScheme`. Components are themed entirely through `--wa-*` custom properties emitted by `@drx-dls/tokens`, so swapping themes requires no component changes.
