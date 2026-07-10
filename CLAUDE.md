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

## Task tracking (Linear)

All work is tracked in the **Linear project `drx-dls`** (team `DRI`, https://linear.app/driesdriesdries/project/drx-dls-eba129fb58c2). Use Linear as the source of truth for tasks going forward:

- Pick the next actionable issue = a `Todo` issue with no open **blocking** issues (dependencies are modeled as blocks/blocked-by relations).
- Move the issue to `In Progress` before starting, `Done` when validated (typecheck/build/tests pass).
- Each issue description starts with a `Key:` slug that maps to the original plan.
- Connect to Linear via the API key already configured in `~/.copilot/mcp-config.json`, or the Linear MCP server (`/mcp`).

### Milestones (features)

Issues are grouped into project **milestones** — each is a feature with a clean test/retro/clear boundary. Each issue also carries an `agent:*` label naming its owning subagent. Work a milestone start-to-finish before moving on where deps allow:

- **M1 · Tokens Engine** (`agent:tokens-engineer`) — DRI-57 ✅, 61 ✅, 62 ✅, 63 (in progress). `@drx-dls/tokens` generator/emitter extensions.
- **M2 · WebAwesome Integration** (`agent:webawesome`) — DRI-60. Phosphor icons in `@drx-dls/webawesome`.
- **M3 · Studio Foundation** (`agent:studio-web`, +`agent:monorepo-devops` for DRI-56) — DRI-49 ✅, 50 ✅, 58, 56. Scaffold/state/persistence/CI.
- **M4 · Studio Editor** (`agent:studio-web`) — DRI-51, 52, 53, 54, 55. Controls/preview/gallery/toggle/export.
- **M5 · Studio Polish** (`agent:studio-web`) — DRI-64, 65. Tests + README.
- (DRI-59 stays in Backlog, `agent:tokens-engineer`, no milestone.)

**Delegation policy:** the `agent:*` label names the *domain owner*, not a mandate to always spawn a subagent. Delegate to the specialist subagent when the work is substantial and domain-contained (a whole feature in one package) or when parallel/clean-context work helps. Do small, tightly-coupled edits inline in the main thread — over-delegating adds latency and loses warm context.

### Per-issue end report + clear cadence

- On each `Done`, post an **end-report comment** on the issue (`linear-save_comment`): what shipped, files, tests, changeset, decisions. This keeps the retro with the task, not in chat.
- **Don't `/clear` after every issue** — stay warm within a milestone (shared context). `/clear` at **milestone boundaries** (domain switch: tokens → webawesome → studio) or when context gets heavy. `RESUME_PROMPT.md` + Linear rehydrate cleanly.
- Optionally do a short retro at each milestone completion.


