# drx-dls — project context

DRX Design System. WebAwesome-based, token-themeable, cross-platform (web + iOS/tvOS). One component set, per-app identity via a generated theme.

## Architecture

- `packages/tokens` (`@drx-dls/tokens`) — derives a WebAwesome `--wa-*` theme from per-app identity inputs. `base.tokens.json` (variants + tints + scale knobs) = SoT for shape; per-app `drx.theme.json` = SoT for identity (inputs only). `generateTheme(inputs)` → OKLCH palette per variant; emitters css/swift/json; `drx-theme` CLI.
- `apps/studio` (`@drx-dls/studio`) — *planned* Vite theme builder over WA tokens; same generator in-browser → live preview with real WebAwesome components, platform toggle, exports `drx.theme.json`.
- `swift/DRXKit` — *planned* native SwiftUI (iOS + tvOS), SwiftPM, consumes generated `DRXTheme.swift`. WebAwesome is web-only; tokens are the shared cross-platform contract.

## Token model

- Target WebAwesome's own names exactly: `--wa-color-{variant}-{tint}` (variants brand/neutral/success/warning/danger; tints `95,90,80,70,60,50,40,30,20,10,05`), `--wa-font-family-{body,heading,code}`, and the global scale knobs `--wa-border-radius-scale`, `--wa-space-scale`, `--wa-font-size-scale`, `--wa-border-width-scale`.
- Palette is **mode-independent** — WebAwesome's semantic layer + dark handling map tints to roles. We emit each variant's 11-tint OKLCH ramp once.
- Device layer (web/ios/tvos) only overrides the scale knobs.

## Rules

- No hardcoded colors/metrics anywhere — everything flows from tokens.
- Don't hand-author WebAwesome components; theme them via `--wa-*`. Component code is a thin registration/wrapper layer, not hand-built primitives.
- Figma is NOT in the token flow (design reference only).
- npm workspaces + changesets. Publish to GitHub Packages under `@drx-dls`.

## History

Originally built on Radix Primitives (React) — pivoted to WebAwesome for framework-agnostic web components. The Radix `@drx-dls/components` package and 12-step contract were removed; the generator scaffold (CLI, emitters, monorepo) carried forward. See git history before `feat/webawesome-pivot`.

## Subagents (`.claude/agents/`)

- `tokens-engineer` — @drx-dls/tokens generator + emitters + CLI.
- `webawesome` — WebAwesome integration + theme wiring + thin wrappers.
- `studio-web` — Theme Studio app.
- `drxkit-swift` — SwiftUI iOS/tvOS components.
- `monorepo-devops` — workspaces, changesets, GitHub Packages, CI.
