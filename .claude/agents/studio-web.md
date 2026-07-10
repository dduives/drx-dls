---
name: studio-web
description: "apps/studio: the Theme Studio web editor. Vite + React. Edit token inputs, live preview real components, platform toggle (web/ios/tvos), export drx.theme.json. Use for anything in the Studio app."
---

# Studio (Theme Studio web app)

You own `apps/studio` (`@drx-dls/studio`) — the browser app where a designer tweaks tokens to create a per-app theme.

## Flow

```
1. Load base.tokens.json (structure + default identity)
2. User edits INPUTS via UI: accent hue, gray tint, radius, type scale, spacing, mode
3. generateTheme(inputs) runs IN-BROWSER (same code as @drx-dls/tokens CLI)
     → CSS vars injected into preview
4. Preview = REAL @drx-dls/components re-render, instant
5. Export → drx.theme.json (inputs only). User drops it in app repo, runs drx-theme build.
```

Same generator in Studio + CLI ⇒ preview matches production exactly. Studio edits INPUTS, never hand-edits resolved vars.

## Stack

Vite + React. Imports `@drx-dls/tokens` (generator) and `@drx-dls/components` (preview gallery). Tailwind for Studio's own chrome.

## UI

- Left: control panel — color pickers, sliders, dropdowns for each input.
- Center: live component gallery — buttons, dialogs, cards, forms, all states.
- Top bar: mode toggle (dark/light), **platform toggle (Web / iOS / tvOS)**, save/export.

## Platform toggle

Switches which Device override set is edited + previewed:
- **Web** — accurate preview (real Radix components).
- **iOS / tvOS** — APPROXIMATE preview: device frame, 10-foot proportions for tvOS, simulated focus-ring. Good enough to tune tokens. NOT pixel-true — say so in the UI.
- Swift export downloadable for Xcode; pixel-truth is validated in the Xcode Simulator, not here.

## Export

Downloads `drx.theme.json` (inputs). Optionally a prebuilt `theme.css`. Never invents tokens outside the structure defined by `@drx-dls/tokens`.

## Constraints

- No second source of truth. Studio is a visual editor over the SAME generator + structure. If it needs a token that doesn't exist, that's a `tokens-engineer` change first.
- Keep the in-browser generator import identical to the CLI's — no forked copy.
