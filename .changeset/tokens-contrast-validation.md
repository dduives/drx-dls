---
"@drx-dls/tokens": minor
---

Add advisory WCAG contrast validation. `@drx-dls/tokens` now exports
`checkContrast(resolvedTheme)`, which evaluates WCAG 2.1 AA contrast (4.5:1)
for the text-on-fill pairs WebAwesome's default light-mode semantic layer uses
per variant (loud: white/tint-50, normal: tint-30/tint-90, quiet: tint-40/tint-95)
and returns a per-variant pass/fail report plus a flat `violations` list, with a
`formatViolation` helper. `drx-theme build` prints violations as non-blocking
warnings, and Theme Studio surfaces them next to the color pickers. Advisory
only — dark mode, custom palette overrides, and non-text UI contrast are not
checked, and colors are never enforced or rewritten.
