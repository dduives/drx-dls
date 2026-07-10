import { oklch, rgb, formatHex, converter, clampChroma } from "culori";
import type { Appearance, AlphaColor, ScaleSet } from "./types.js";

/**
 * Generate a 12-step color scale from a single base color, following Radix
 * Colors step semantics (1 = app bg … 9 = solid/brand … 12 = high-contrast text).
 *
 * NOTE: this is a principled OKLCH ramp that approximates Radix's tuned scales.
 * It anchors step 9 to the exact base color so brand fidelity is preserved.
 * A future refinement can drop in a faithful port of Radix's `generateRadixColors`
 * (APCA-tuned against reference scales) behind this same signature.
 */

const toOklch = converter("oklch");

// Target OKLCH lightness per step (index 0 = step 1).
const L_DARK = [
  0.178, 0.213, 0.253, 0.285, 0.318, 0.36, 0.415, 0.49, 0.6, 0.66, 0.77, 0.925,
];
const L_LIGHT = [
  0.994, 0.982, 0.958, 0.933, 0.907, 0.877, 0.836, 0.775, 0.6, 0.56, 0.52,
  0.29,
];

// Chroma multiplier per step (relative to the base color's chroma). Low at the
// near-neutral background end, peaking around the solid steps.
const C_CURVE = [
  0.12, 0.18, 0.3, 0.42, 0.54, 0.66, 0.78, 0.9, 1.0, 1.0, 0.92, 0.6,
];

const SOLID_STEP = 8; // index of step 9

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

export function generateScale(base: string, appearance: Appearance): string[] {
  const baseOk = toOklch(base);
  if (!baseOk) throw new Error(`Invalid color: ${base}`);

  const hue = baseOk.h ?? 0;
  const baseChroma = baseOk.c ?? 0;
  const targetL = appearance === "dark" ? L_DARK : L_LIGHT;

  return targetL.map((l, i) => {
    // Anchor step 9 to the exact base color for brand fidelity.
    if (i === SOLID_STEP) {
      return formatHex(clampChroma({ ...baseOk, mode: "oklch" }, "oklch"))!;
    }
    const c = clamp01(baseChroma * (C_CURVE[i] ?? 1));
    const color = clampChroma(
      { mode: "oklch" as const, l: clamp01(l), c, h: hue },
      "oklch",
    );
    return formatHex(color)!;
  });
}

/**
 * Derive an alpha color that, composited over `bg`, renders the same as `target`.
 * Mirrors Radix's approach: pick the per-channel extreme (0 or 255) and solve
 * for the smallest alpha that reproduces the target over the background.
 */
export function toAlpha(target: string, bg: string): AlphaColor {
  const t = rgb(target);
  const b = rgb(bg);
  if (!t || !b) throw new Error(`Invalid color in alpha derivation`);

  const channels: Array<"r" | "g" | "b"> = ["r", "g", "b"];
  // For each channel choose foreground extreme and required alpha.
  let alpha = 0;
  for (const ch of channels) {
    const tc = t[ch];
    const bc = b[ch];
    const fg = tc > bc ? 1 : 0;
    if (fg !== bc) {
      const a = (tc - bc) / (fg - bc);
      if (a > alpha) alpha = a;
    }
  }
  alpha = clamp01(alpha);

  // Recompose the solid color for this alpha over the background.
  const solve = (tc: number, bc: number): number => {
    if (alpha === 0) return tc;
    return clamp01((tc - bc * (1 - alpha)) / alpha);
  };
  const solid = {
    mode: "rgb" as const,
    r: solve(t.r, b.r),
    g: solve(t.g, b.g),
    b: solve(t.b, b.b),
  };
  const hex = formatHex(solid)!;
  const r255 = Math.round(solid.r * 255);
  const g255 = Math.round(solid.g * 255);
  const b255 = Math.round(solid.b * 255);
  return {
    hex,
    alpha: Math.round(alpha * 1000) / 1000,
    rgba: `rgba(${r255}, ${g255}, ${b255}, ${Math.round(alpha * 1000) / 1000})`,
  };
}

/** Build a full solid + alpha ScaleSet for one base color and appearance. */
export function generateScaleSet(base: string, appearance: Appearance): ScaleSet {
  const solid = generateScale(base, appearance);
  const bg = solid[0]!;
  const alpha = solid.map((step) => toAlpha(step, bg));
  return { solid, alpha };
}
