# drx-dls

DRX Design System — [Radix](https://www.radix-ui.com/primitives)-based, token-themeable, cross-platform.

One component set, many app identities. Style everything through a 12-step token contract; give each app its own look by swapping a theme — no component code changes. Web via Radix + Tailwind, native Apple via SwiftUI, same tokens underneath.

## Packages

| Package | What |
|---|---|
| `@drx-dls/tokens` | 12-step Radix token structure, theme generator (`generateTheme`), CSS/Swift/JSON emitters, `drx-theme` CLI |
| `@drx-dls/components` | Web component library — Radix Primitives + CVA + Tailwind preset + Storybook |
| `@drx-dls/studio` | Theme Studio — web editor to tweak tokens and export a per-app theme |
| `swift/DRXKit` | Native SwiftUI components (iOS + tvOS) on the shared tokens (SwiftPM) |

## How theming works

```
base.tokens.json  (structure: 12-step scale + Device overrides — source of truth for SHAPE)
        +
drx.theme.json    (per-app identity: accent hue, gray, radius, type — source of truth for LOOK)
        │  generateTheme(inputs)
        ├─ theme.css        → web
        ├─ DRXTheme.swift   → iOS / tvOS
        └─ theme.json       → anything
```

The **12-step scale** (Radix Colors semantics): step 9 = solid/brand, 6–8 = borders, 11–12 = text, 1–5 = backgrounds. Components author against step meaning, so any theme drops in.

## Use in an app (web)

```bash
npm i @drx-dls/components @drx-dls/tokens
```

`@drx-dls` is published to **GitHub Packages**. Add to the app's `.npmrc`:

```
@drx-dls:registry=https://npm.pkg.github.com
```

and a personal access token (one-time, per developer) in `~/.npmrc`:

```
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

Then:

```ts
import './theme.css'                    // generated from your drx.theme.json
import { Button } from '@drx-dls/components'
```

## Develop

```bash
npm install          # installs all workspaces
npm run build        # build every package
npm run typecheck
```

Agents for each area live in `.claude/agents/` (`tokens-engineer`, `radix-components`, `studio-web`, `drxkit-swift`, `monorepo-devops`).
