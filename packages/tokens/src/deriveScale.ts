import Color from "colorjs.io";
import type { TintScale } from "./types.js";

/**
 * Derive a WebAwesome-style tint scale from a single base color.
 *
 * Holds the base hue, ramps OKLCH lightness across the tint steps (95 ≈ white,
 * 05 ≈ black), and scales chroma with a curve that peaks mid-scale. The result
 * is gamut-mapped to sRGB. Neutral (near-zero-chroma) bases ramp cleanly to gray.
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

export function deriveScale(
  base: string,
  tints: number[],
  overrides: Record<number, string> = {},
): TintScale[] {
  const oklch = new Color(base).to("oklch");
  const baseC = oklch.coords[1] || 0;
  const baseH = Number.isNaN(oklch.coords[2]) ? 0 : oklch.coords[2];

  return tints.map((tint) => {
    // A pinned step (DRI-99) wins over the OKLCH-derived value.
    const pinned = overrides[tint];
    if (typeof pinned === "string" && pinned.length > 0) {
      return { tint, hex: pinned };
    }
    const L = lookup(L_BY_TINT, tint);
    const C = baseC * lookup(C_BY_TINT, tint);
    const color = new Color("oklch", [L, C, baseH]);
    color.toGamut({ space: "srgb" });
    const hex = color.to("srgb").toString({ format: "hex" });
    return { tint, hex };
  });
}
