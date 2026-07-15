---
"@drx-dls/tokens": minor
---

Anchor the palette ramp on the exact base hex (DRI-119). The base color per
variant is now the source of truth and is emitted verbatim, instead of being
averaged away into an approximate OKLCH ramp:

- `deriveScale` picks the numbered tint step nearest the base color's OKLCH
  lightness (the **anchor**), emits the base hex **verbatim** at that step, and
  re-interpolates the other steps' lightnesses from the anchor out to the ramp's
  fixed endpoints — so the picked colour appears as a real tint and the ramp
  stays perceptually smooth *through* it (no kink).
- New `--wa-color-{variant}` core token is emitted as the exact base hex, and a
  derived `--wa-color-{variant}-on` (dark on light cores, white on dark) — WA's
  representative-colour tokens, previously not emitted at all (fixes the core
  half of the DRI-115 desync). Mirrored in the Swift emitter as
  `DRXPalette.{variant}` / `{variant}On`.
- `ResolvedTheme` gains `core: Record<VariantName, { base, on, anchorTint }>`.
- New helpers exported: `anchorTintFor(base, tints)` and `deriveOnColor(base)`.

Per-step pins (DRI-99) still take precedence over the anchor.
