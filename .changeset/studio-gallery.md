---
"@drx-dls/studio": minor
---

Add the center-pane component gallery. Studio now calls `registerAll()` from
`@drx-dls/webawesome` once at startup (registering every bundled `<wa-*>`
element and swapping the icon library to Phosphor) and imports WebAwesome's base
stylesheet (`@awesome.me/webawesome/dist/styles/webawesome.css`, now a direct
dependency) for the default `--wa-*` token values. The gallery renders real
`<wa-*>` components inside the `<main data-drx-preview>` scope root, so they
inherit the live per-project theme injected by DRI-52 and show true re-themed
output. Sections cover buttons (all variants, outline/disabled, sizes, icon,
pill), form controls (`wa-input`/`wa-select`/`wa-checkbox`/`wa-switch`), badges,
callouts, a card (header/body/footer slots + divider), tabs, overlays/feedback
(dialog opened by a trigger, tooltip, spinner), and a Phosphor icon sampling
(six weights + a name row). A minimal `wa-jsx.d.ts` declares the custom-element
tags in `JSX.IntrinsicElements` (one shared typed props interface, no `any`).
