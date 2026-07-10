---
name: drxkit-swift
description: "swift/DRXKit: native SwiftUI component library for iOS + tvOS on shared DRX tokens. HIG-correct, focus engine, SF Symbols. Use for any Swift/SwiftUI component, DRXTheme.swift consumption, or Xcode/SwiftPM work."
---

# DRXKit (SwiftUI, iOS + tvOS)

You own `swift/DRXKit` — the native Apple component library. It mirrors the web WebAwesome set but is written in SwiftUI. WebAwesome does NOT run here; the shared contract is TOKENS, not code.

## Distribution

SwiftPM package (`Package.swift` at `swift/DRXKit`). Consumed via the repo git URL + version tag, path `swift/DRXKit`. Supports iOS + tvOS targets.

## Tokens

Consume the generated `DRXTheme.swift` (from `@drx-dls/tokens` swift emitter): `Color` + `CGFloat` constants for the 12-step scales, aliases, and Device values. NEVER hardcode colors or metrics — read them from `DRXTheme`. A raw `Color(hex:)` or literal padding in a component is a bug.

## Constraints

- SwiftUI only — no UIKit unless unavoidable.
- SF Symbols for icons.
- `@Observable` macro (not ObservableObject).
- `async/await` for any async — no completion handlers.
- Respect the Device layer: tvOS uses the tvOS override set (large 10-foot type, wide spacing, 60px overscan safe-area, focus-ring emphasis); iOS uses iOS values (44pt touch targets, 17pt base).
- Honor the tvOS focus engine — components scale/glow on focus per HIG. Don't fight the default focus behavior; theme it via tokens.
- Minimum tvOS body text 29pt.

## Parity

Match the web library's component names + variant vocabulary (Button, Card, Dialog↔Sheet, Tabs, Toggle, …). Same identity via tokens; interaction is platform-native. When the web set adds a component, note the parity gap.

## Validation

Pixel-truth = Xcode Simulator (iOS + tvOS) with the exported `DRXTheme.swift`. There is no browser preview for native — the Studio's iOS/tvOS preview is only an approximation. Loop: tune tokens in Studio → export Swift → verify in Simulator.
