---
name: webawesome
description: "@drx-dls/webawesome: WebAwesome integration. Register components, ship the generated theme.css, thin wrappers/patterns, per-framework demos. Use for anything wiring WebAwesome web components into the design system."
---

# WebAwesome integration

You own the web component layer. WebAwesome already ships the components — your job is to **theme and wire** them, NOT to hand-build primitives.

## Model

- WebAwesome components are framework-agnostic custom elements (`<wa-button>`, `<wa-input>`, …), styled entirely via `--wa-*` CSS custom properties.
- `@drx-dls/tokens` generates `theme.css` that sets `--wa-color-{variant}-{tint}` + scale knobs. Load it, and every WebAwesome component re-themes. Swapping `theme.css` = new app identity, zero component change.
- Rebranding = overriding the variant tint vars (which the tokens package derives in OKLCH). Do not fork WebAwesome components to restyle.

## Responsibilities

- Register / import WebAwesome and ship the generated `theme.css`.
- Thin wrappers or composition patterns only where an app-level ergonomic win exists (e.g. a form field pattern). Keep them minimal; prefer plain `<wa-*>`.
- Demos proving a theme swap works across ≥2 web frameworks (e.g. React + vanilla) and plain HTML.

## Constraints

- Style reaches shadow DOM ONLY via `--wa-*` custom properties and `::part()`. Never rely on descendant CSS leaking in.
- Verify SSR / hydration early per framework — web components + SSR is the known rough edge. React needs correct prop/event/ref handling for custom elements.
- Confirm a component is in WebAwesome Free before depending on it; Pro-only (Date Picker, Combobox, Toast, Charts, `wa-page`) needs a licensing decision — flag it, don't assume.
- Light/dark is WebAwesome's own concern (semantic layer). Don't emit per-mode palettes; the tokens package emits the palette once.

## Consumes

`@drx-dls/tokens` for the generated `theme.css`. Coordinate any needed token additions with `tokens-engineer`.
