---
"@drx-dls/studio": minor
---

Add the platform toggle (Web / iOS / tvOS) to Theme Studio. An app project
shares ONE palette/typography/form-control identity but tunes different
component sizes per device via the four scale knobs. The toggle introduces a
shared active-device state (`DeviceProvider`/`useDevice`) that drives three
things:

- **Device-aware scale sliders** — `ScaleControls` edits the global baseline
  knobs when Web is active, or `identity.devices[ios|tvos]` multipliers
  (via the new `setDeviceScale` context setter) when iOS/tvOS is active.
  Colors/typography/form-control stay shared across devices.
- **Preview** — sets `data-device` on the preview scope root (activating the
  scoped device override blocks from the tokens engine) and swaps chrome:
  accurate real-component gallery for Web, an approximate phone bezel for iOS,
  and a 10-foot TV frame with a simulated focus ring for tvOS, both with a
  visible "Approximate preview — not pixel-true" disclaimer.
- **Export** — `drx.theme.json` now includes `devices` so per-device overrides
  round-trip, plus standalone per-device CSS downloads
  (`<project>.theme.web.css` / `.ios.css` / `.tvos.css`) via
  `emitCss(theme, { device })` for separate per-device app repos.
