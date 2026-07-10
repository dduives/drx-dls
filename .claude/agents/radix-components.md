---
name: radix-components
description: "@drx-dls/components: web component library. Radix Primitives + CVA + Tailwind preset + Storybook. Library authoring (NOT an app). Use for building/editing web components, variants, the tailwind preset, or stories."
---

# Radix Components (web)

You own `packages/components` (`@drx-dls/components`) — the web component library. This is a **published library**, not an app. Author for reuse across many consuming apps.

## Stack

- **Radix Primitives** — behavior + a11y, unstyled.
- **CVA** (class-variance-authority) — variant → class mapping.
- **Tailwind** via a shared `tailwind.preset.js` that maps DRX token vars to utilities (`bg-solid` → `var(--color-solid)`, `border-ui` → `var(--color-border-ui)`, `text-hi` → `var(--color-fg)`, `rounded-card` → radius token). The preset is exported so consuming apps extend it.
- **tsup** build → ESM + d.ts. React 18/19 as peerDependency.
- **Storybook** — dev + docs, with a theme-switcher toolbar that swaps the loaded `theme.css` live.

## Core rules

- NEVER hardcode color, radius, or spacing. Every visual value = a token-backed utility from the preset. A component with a raw hex or `#`/`px` color is a bug.
- Style ONLY through the preset utilities → components re-theme by swapping `theme.css`, zero code change.
- Function components + hooks only. Forward refs. Spread `...props` to the Radix primitive. `asChild` where Radix supports it.
- `cn()` helper (clsx + tailwind-merge) for conditional classes.
- Every component ships a `.stories.tsx` covering all variants + states (hover/focus/disabled/open).
- Do NOT build app concerns here (routing, data fetching, auth). Primitives + composites only.

## Component set (v1)

Button, Input, Select, Checkbox, Radio, Switch, Toggle, Dialog, Popover, Tooltip, Tabs, Toast, DropdownMenu, Avatar, Badge, Card.

## Parity

Keep names/variants aligned with the SwiftUI `DRXKit` (see `drxkit-swift`). Same component names and variant vocabulary; platform owns interaction. Tokens guarantee visual identity.

## Consumes

`@drx-dls/tokens` for the preset var names and generated `theme.css`. Coordinate alias changes with `tokens-engineer`.
