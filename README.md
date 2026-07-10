# drx-dls

DRX Design System — [WebAwesome](https://webawesome.com)-based, token-themeable, cross-platform.

One component set, many app identities. Define an app's identity as a small set of inputs; the generator derives a full [WebAwesome](https://webawesome.com) `--wa-*` theme from it, so every app gets its own look while reusing the same components — no component code changes. Web via WebAwesome web components (framework-agnostic), native Apple via SwiftUI, same tokens underneath.

## Packages

| Package | What |
|---|---|
| `@drx-dls/tokens` | Derives a WebAwesome `--wa-*` theme (OKLCH palette per variant + scale knobs) from per-app identity inputs. Emitters for CSS / Swift / JSON, and the `drx-theme` CLI |
| `swift/DRXKit` | Native SwiftUI components (iOS + tvOS) on the shared tokens (SwiftPM) — *planned* |

## How theming works

```
base.tokens.json  (structure: variants, tints, scale knobs — source of truth for SHAPE)
        +
drx.theme.json    (per-app identity: variant hues, radius/space/type scales, fonts — SoT for LOOK)
        │  generateTheme(inputs)  → OKLCH derivation
        ├─ theme.css        → sets --wa-color-{variant}-{tint} + --wa-*-scale  → WebAwesome components
        ├─ DRXTheme.swift   → Color + scale constants                          → SwiftUI (iOS / tvOS)
        └─ theme.json       → anything
```

Each variant (`brand`, `neutral`, `success`, `warning`, `danger`) gets an 11-tint palette (`95`≈white … `05`≈black) derived in OKLCH from its base color. WebAwesome's own semantic layer maps those tints to component roles and handles light/dark, so the palette is emitted once. The Device layer (web / iOS / tvOS) drives WebAwesome's global scale knobs (`--wa-border-radius-scale`, `--wa-space-scale`, `--wa-font-size-scale`, `--wa-border-width-scale`).

## Use in an app (web)

```bash
npm i @drx-dls/tokens
# plus WebAwesome per its install docs
```

Generate a theme from your identity and load it:

```ts
import "./theme.css";   // generated from your drx.theme.json via `drx-theme build`
```

```html
<html data-device="web">
  <wa-button variant="brand">Themed by drx-dls</wa-button>
</html>
```

Set `data-device="ios"` or `"tvos"` to switch platform sizing. Swapping `theme.css` (a different `drx.theme.json`) re-themes the whole app.

## Develop

```bash
npm install
npm run build        # build every package
npm run typecheck
```

Agents for each area live in `.claude/agents/` (`tokens-engineer`, `webawesome`, `studio-web`, `drxkit-swift`, `monorepo-devops`).
