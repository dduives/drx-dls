import { describe, expect, it } from "vitest";
import { generateTheme } from "../src/generateTheme.js";
import {
  checkContrast,
  formatViolation,
  AA_NORMAL_TEXT,
  type ContrastViolation,
} from "../src/contrast.js";
import type { ResolvedTheme, TintScale, VariantName } from "../src/types.js";

const VARIANTS: VariantName[] = [
  "brand",
  "neutral",
  "success",
  "warning",
  "danger",
];

/** Build a ResolvedTheme whose every variant uses the same tint→hex map. */
function themeWithTints(tintHex: Record<number, string>): ResolvedTheme {
  const scale: TintScale[] = Object.entries(tintHex).map(([tint, hex]) => ({
    tint: Number(tint),
    hex,
  }));
  const palette = Object.fromEntries(
    VARIANTS.map((v) => [v, scale]),
  ) as Record<VariantName, TintScale[]>;
  return {
    name: "test",
    identity: {} as ResolvedTheme["identity"],
    tints: scale.map((t) => t.tint),
    palette,
    devices: {} as ResolvedTheme["devices"],
  };
}

describe("checkContrast", () => {
  it("evaluates 3 semantic pairs per variant (loud/normal/quiet)", () => {
    const report = checkContrast(generateTheme());
    expect(report.variants).toHaveLength(5);
    for (const v of report.variants) {
      expect(v.pairs.map((p) => p.role)).toEqual([
        "loud",
        "normal",
        "quiet",
      ]);
      expect(v.pairs.map((p) => p.bgTint)).toEqual([50, 90, 95]);
      expect(v.pairs.map((p) => p.fgTint)).toEqual(["white", 30, 40]);
    }
  });

  it("uses AA normal-text threshold (4.5:1) for every pair", () => {
    const report = checkContrast(generateTheme());
    for (const v of report.variants) {
      for (const p of v.pairs) {
        expect(p.minRatio).toBe(AA_NORMAL_TEXT);
        expect(p.ratio).toBeGreaterThanOrEqual(1);
        expect(p.ratio).toBeLessThanOrEqual(21);
      }
    }
  });

  it("report.passes is true iff there are no violations", () => {
    const report = checkContrast(generateTheme());
    expect(report.passes).toBe(report.violations.length === 0);
  });

  it("violations are exactly the failing pairs, tagged with variant", () => {
    const report = checkContrast(generateTheme());
    const failingFromVariants = report.variants.flatMap((v) =>
      v.pairs.filter((p) => !p.passes).map((p) => ({ variant: v.variant, ...p })),
    );
    expect(report.violations).toHaveLength(failingFromVariants.length);
    for (const v of report.violations) {
      expect(v.passes).toBe(false);
      expect(VARIANTS).toContain(v.variant);
    }
  });

  it("passes cleanly for a high-contrast palette (dark fills, near-white bg)", () => {
    // tint 50 dark → white passes; tint 30 dark on tint 90 light → passes;
    // tint 40 dark on tint 95 light → passes.
    const report = checkContrast(
      themeWithTints({
        50: "#000000",
        90: "#ffffff",
        30: "#000000",
        95: "#ffffff",
        40: "#000000",
      }),
    );
    expect(report.passes).toBe(true);
    expect(report.violations).toHaveLength(0);
  });

  it("flags a low-contrast palette (light fills everywhere)", () => {
    const report = checkContrast(
      themeWithTints({
        50: "#ffffff",
        90: "#fefefe",
        30: "#fdfdfd",
        95: "#ffffff",
        40: "#fcfcfc",
      }),
    );
    expect(report.passes).toBe(false);
    // all 3 pairs fail for all 5 variants
    expect(report.violations).toHaveLength(15);
  });

  it("skips pairs whose tints are absent from the palette", () => {
    const report = checkContrast(themeWithTints({ 50: "#000000" }));
    // only the "loud" pair (white on tint 50) is evaluable
    for (const v of report.variants) {
      expect(v.pairs).toHaveLength(1);
      expect(v.pairs[0]!.role).toBe("loud");
    }
  });
});

describe("formatViolation", () => {
  it("produces a readable one-line summary", () => {
    const v: ContrastViolation = {
      variant: "brand",
      role: "quiet",
      fgTint: 40,
      bgTint: 95,
      fg: "#b36a00",
      bg: "#fff2d9",
      ratio: 3.81,
      minRatio: 4.5,
      passes: false,
    };
    expect(formatViolation(v)).toBe(
      "brand quiet: tint 40 on tint 95 = 3.81:1 (needs 4.5:1)",
    );
  });

  it("renders the literal white foreground", () => {
    const v: ContrastViolation = {
      variant: "warning",
      role: "loud",
      fgTint: "white",
      bgTint: 50,
      fg: "#ffffff",
      bg: "#cf9c00",
      ratio: 3.13,
      minRatio: 4.5,
      passes: false,
    };
    expect(formatViolation(v)).toBe(
      "warning loud: white on tint 50 = 3.13:1 (needs 4.5:1)",
    );
  });
});
