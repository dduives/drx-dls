import Color from "colorjs.io";
import type { TintScale } from "./types.js";

/**
 * Derive a WebAwesome-style tint scale from a single base color.
 *
 * Holds the base hue, ramps OKLCH lightness across the tint steps (95 ≈ white,
 * 05 ≈ black), and scales chroma with a curve that peaks mid-scale. The result
 * is gamut-mapped to sRGB. Neutral (near-zero-chroma) bases ramp cleanly to gray.
 *
 * The ramp is **anchored on the exact base hex** (DRI-119): the base color's
 * OKLCH lightness picks the nearest numbered step, and that step emits the base
 * hex **verbatim** (no OKLCH round-trip). The other steps' lightnesses are
 * re-interpolated from the anchor out to the ramp's fixed endpoints, so the
 * picked colour appears as a real tint and the ramp stays smooth *through* it
 * instead of kinking around an off-curve anchor.
 */

// Target OKLCH lightness per standard tint step.
const L_BY_TINT: Record<number, number> = {
  95: 0.972,
  90: 0.94,
  80: 0.875,
  70: 0.8,
  60: 0.73,
  50: 0.66,
  40: 0.59,
  30: 0.515,
  20: 0.435,
  10: 0.335,
  5: 0.255,
};

// Chroma multiplier (relative to the base color's chroma) per tint step.
const C_BY_TINT: Record<number, number> = {
  95: 0.25,
  90: 0.4,
  80: 0.6,
  70: 0.8,
  60: 0.95,
  50: 1.0,
  40: 1.0,
  30: 0.95,
  20: 0.85,
  10: 0.7,
  5: 0.5,
};

/** Interpolate a per-tint target from a lookup map for off-scale tints. */
function lookup(map: Record<number, number>, tint: number): number {
  if (map[tint] !== undefined) return map[tint]!;
  const keys = Object.keys(map)
    .map(Number)
    .sort((a, b) => a - b);
  const lo = keys.filter((k) => k <= tint).pop() ?? keys[0]!;
  const hi = keys.find((k) => k >= tint) ?? keys[keys.length - 1]!;
  if (lo === hi) return map[lo]!;
  const t = (tint - lo) / (hi - lo);
  return map[lo]! + t * (map[hi]! - map[lo]!);
}

/** Normalize any CSS color to a `#rrggbb` sRGB hex string. */
function toHex(color: string): string {
  return new Color(color).to("srgb").toString({ format: "hex" });
}

/**
 * The tint step whose nominal lightness sits closest to the base color's OKLCH
 * lightness — i.e. the step the picked colour actually lands on (DRI-119). The
 * base hex is emitted verbatim at this step and the ramp is anchored through it.
 */
export function anchorTintFor(base: string, tints: number[]): number {
  const baseL = new Color(base).to("oklch").coords[0] || 0;
  let best = tints[0]!;
  let bestDelta = Infinity;
  for (const tint of tints) {
    const delta = Math.abs(lookup(L_BY_TINT, tint) - baseL);
    if (delta < bestDelta) {
      bestDelta = delta;
      best = tint;
    }
  }
  return best;
}

/**
 * WebAwesome-style on-color for a core hex (DRI-119 step 5): a dark on-color
 * when the core is light, white when the core is dark. Chooses whichever of
 * black/white yields the higher WCAG contrast against the base, so the
 * `--wa-color-{variant}-on` pairing is legible for the real brand colour.
 */
export function deriveOnColor(base: string): string {
  const b = new Color(base);
  const onWhite = b.contrast(new Color("#ffffff"), "WCAG21");
  const onBlack = b.contrast(new Color("#000000"), "WCAG21");
  return onWhite >= onBlack ? "#ffffff" : "#000000";
}

export function deriveScale(
  base: string,
  tints: number[],
  overrides: Record<number, string> = {},
): TintScale[] {
  const oklch = new Color(base).to("oklch");
  const baseL = oklch.coords[0] || 0;
  const baseC = oklch.coords[1] || 0;
  const baseH = Number.isNaN(oklch.coords[2]) ? 0 : oklch.coords[2];

  const anchor = anchorTintFor(base, tints);
  const baseHex = toHex(base);

  // Fixed ramp endpoints (lightest/darkest tint) keep their nominal lightness;
  // the anchor is pinned at the base color's lightness. Each side of the anchor
  // is a linear rescale of the nominal L-curve so the ramp passes smoothly
  // through the anchor without a visible kink.
  const lightEnd = Math.max(...tints);
  const darkEnd = Math.min(...tints);
  const anchorNominalL = lookup(L_BY_TINT, anchor);
  const lightEndL = lookup(L_BY_TINT, lightEnd);
  const darkEndL = lookup(L_BY_TINT, darkEnd);

  const anchoredL = (tint: number): number => {
    if (tint === anchor) return baseL;
    const nominal = lookup(L_BY_TINT, tint);
    if (tint > anchor) {
      const span = lightEndL - anchorNominalL;
      if (span <= 0) return baseL;
      const f = (nominal - anchorNominalL) / span;
      return baseL + f * (lightEndL - baseL);
    }
    const span = anchorNominalL - darkEndL;
    if (span <= 0) return baseL;
    const f = (nominal - darkEndL) / span;
    return darkEndL + f * (baseL - darkEndL);
  };

  return tints.map((tint) => {
    // A pinned step (DRI-99) wins over the derived value.
    const pinned = overrides[tint];
    if (typeof pinned === "string" && pinned.length > 0) {
      return { tint, hex: pinned };
    }
    // The anchor step emits the picked colour verbatim (no round-trip loss).
    if (tint === anchor) {
      return { tint, hex: baseHex };
    }
    const L = anchoredL(tint);
    const C = baseC * lookup(C_BY_TINT, tint);
    const color = new Color("oklch", [L, C, baseH]);
    color.toGamut({ space: "srgb" });
    const hex = color.to("srgb").toString({ format: "hex" });
    return { tint, hex };
  });
}
