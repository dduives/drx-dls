# drx-dls — project context

DRX Design System. Radix-based, token-themeable, cross-platform (web + iOS/tvOS). One component set, per-app identity via token swap.

## Architecture

- `packages/tokens` (`@drx-dls/tokens`) — 12-step Radix token structure (`base.tokens.json`), `generateTheme(inputs)`, CSS/Swift/JSON emitters, `drx-theme` CLI. Structure = SoT for shape; per-app `drx.theme.json` = SoT for identity (inputs only).
- `packages/components` (`@drx-dls/components`) — web lib: Radix Primitives + CVA + Tailwind preset + Storybook. Published library, not an app. Style only via token-backed preset utilities.
- `apps/studio` (`@drx-dls/studio`) — Vite web editor. Same generator in-browser → live preview, platform toggle, exports `drx.theme.json`.
- `swift/DRXKit` — native SwiftUI (iOS + tvOS), SwiftPM, consumes generated `DRXTheme.swift`. Radix does not run on Apple; tokens are the shared contract.

## Rules

- 12-step Radix Colors semantics: 9 = solid/brand, 6–8 borders, 11–12 text, 1–5 backgrounds. Never Tailwind 50–950.
- No hardcoded colors/metrics anywhere — everything flows from tokens.
- Figma is NOT in the token flow (design reference only).
- npm workspaces + changesets. Publish to GitHub Packages under `@drx-dls`.

## Subagents (`.claude/agents/`)

- `tokens-engineer` — @drx-dls/tokens generator + emitters + CLI.
- `radix-components` — web component library.
- `studio-web` — Theme Studio app.
- `drxkit-swift` — SwiftUI iOS/tvOS components.
- `monorepo-devops` — workspaces, changesets, GitHub Packages, CI.
