import Color from "colorjs.io";
import type { ResolvedTheme, TintScale, VariantName } from "./types.js";

/**
 * WCAG contrast validation for a resolved theme.
 *
 * Designers pick arbitrary base colors that drive the OKLCH tint-ramp
 * derivation; nothing else checks whether the resulting ramp yields legible
 * text on the surfaces WebAwesome's semantic layer actually pairs it with.
 *
 * We mirror WebAwesome's *default light-mode* semantic mapping (see
 * `styles/themes/default.css`) — for each variant, three text-on-fill pairs:
 *
 *   role    text (on-*)              surface (fill-*)
 *   ------  -----------------------  ---------------------
 *   loud    white                    tint 50
 *   normal  tint 30                  tint 90
 *   quiet   tint 40                  tint 95
 *
 * This is advisory only: results are surfaced as warnings, never hard errors.
 * Dark mode, custom palette overrides, and non-text UI contrast (borders,
 * focus rings) are NOT checked.
 */

/** WCAG 2.1 AA thresholds. */
export const AA_NORMAL_TEXT = 4.5;
export const AA_LARGE_TEXT = 3;

export type ContrastRole = "loud" | "normal" | "quiet";

/** A single text/surface pair evaluated for one variant. */
export interface ContrastPair {
  role: ContrastRole;
  /** Foreground tint number, or "white" for the literal WA `on-loud` value. */
  fgTint: number | "white";
  /** Background (surface) tint number. */
  bgTint: number;
  /** Resolved foreground hex. */
  fg: string;
  /** Resolved background hex. */
  bg: string;
  /** WCAG 2.1 contrast ratio (1..21), rounded to 2 decimals. */
  ratio: number;
  /** Minimum ratio required for this pair to pass (AA normal text). */
  minRatio: number;
  passes: boolean;
}

/** Contrast results for one variant. */
export interface VariantContrast {
  variant: VariantName;
  pairs: ContrastPair[];
  /** True when every pair meets its threshold. */
  passes: boolean;
}

/** A failing pair, tagged with its variant, for flat reporting. */
export interface ContrastViolation extends ContrastPair {
  variant: VariantName;
}

/** Full contrast report for a resolved theme. */
export interface ContrastReport {
  /** True when every checked pair across every variant passes. */
  passes: boolean;
  variants: VariantContrast[];
  /** Flattened failing pairs (empty when `passes` is true). */
  violations: ContrastViolation[];
}

/** WebAwesome default light-mode text/surface pairs, per variant. */
const SEMANTIC_PAIRS: {
  role: ContrastRole;
  fgTint: number | "white";
  bgTint: number;
}[] = [
  { role: "loud", fgTint: "white", bgTint: 50 },
  { role: "normal", fgTint: 30, bgTint: 90 },
  { role: "quiet", fgTint: 40, bgTint: 95 },
];

function hexForTint(scale: TintScale[], tint: number): string | undefined {
  return scale.find((t) => t.tint === tint)?.hex;
}

function ratio(fg: string, bg: string): number {
  const value = new Color(bg).contrast(new Color(fg), "WCAG21");
  return Math.round(value * 100) / 100;
}

/**
 * Evaluate WCAG 2.1 contrast for a resolved theme against WebAwesome's default
 * light-mode text/surface pairs. Advisory — callers should surface `violations`
 * as warnings, not errors.
 */
export function checkContrast(theme: ResolvedTheme): ContrastReport {
  const variants: VariantContrast[] = [];
  const violations: ContrastViolation[] = [];

  for (const variant of Object.keys(theme.palette) as VariantName[]) {
    const scale = theme.palette[variant];
    const pairs: ContrastPair[] = [];

    for (const spec of SEMANTIC_PAIRS) {
      const fg =
        spec.fgTint === "white" ? "#ffffff" : hexForTint(scale, spec.fgTint);
      const bg = hexForTint(scale, spec.bgTint);
      if (fg === undefined || bg === undefined) continue;

      const r = ratio(fg, bg);
      const minRatio = AA_NORMAL_TEXT;
      const pair: ContrastPair = {
        role: spec.role,
        fgTint: spec.fgTint,
        bgTint: spec.bgTint,
        fg,
        bg,
        ratio: r,
        minRatio,
        passes: r >= minRatio,
      };
      pairs.push(pair);
      if (!pair.passes) violations.push({ variant, ...pair });
    }

    variants.push({
      variant,
      pairs,
      passes: pairs.every((p) => p.passes),
    });
  }

  return {
    passes: violations.length === 0,
    variants,
    violations,
  };
}

/** One-line human-readable summary of a single violation. */
export function formatViolation(v: ContrastViolation): string {
  const fg = v.fgTint === "white" ? "white" : `tint ${v.fgTint}`;
  return `${v.variant} ${v.role}: ${fg} on tint ${v.bgTint} = ${v.ratio}:1 (needs ${v.minRatio}:1)`;
}
