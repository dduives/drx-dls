import { describe, expect, it } from "vitest";
import Color from "colorjs.io";
import { generateTheme } from "../src/generateTheme.js";
import {
  anchorTintFor,
  deriveOnColor,
  deriveScale,
} from "../src/deriveScale.js";
import { emitCss, emitSwift } from "../src/emitters/index.js";
import type { VariantName } from "../src/types.js";

const tints = [95, 90, 80, 70, 60, 50, 40, 30, 20, 10, 5];
const VARIANTS: VariantName[] = [
  "brand",
  "neutral",
  "success",
  "warning",
  "danger",
];

/** Normalize a color to the same #rrggbb form the emitters use. */
const hex = (c: string) => new Color(c).to("srgb").toString({ format: "hex" });

describe("ramp anchoring on the exact base hex (DRI-119)", () => {
  it("anchorTintFor picks the step nearest the base's OKLCH lightness", () => {
    // A near-white base lands high on the ramp; near-black lands low.
    expect(anchorTintFor("#ffffff", tints)).toBe(95);
    expect(anchorTintFor("#000000", tints)).toBe(5);
    // A mid-lightness brand amber lands mid/upper ramp.
    expect(anchorTintFor("#f59e0b", tints)).toBe(70);
  });

  it("deriveScale emits the base hex verbatim at the anchor step", () => {
    const base = "#f59e0b";
    const anchor = anchorTintFor(base, tints);
    const scale = deriveScale(base, tints);
    const at = scale.find((s) => s.tint === anchor)!;
    expect(at.hex).toBe(hex(base));
  });

  it("keeps the ramp lightness monotonic through the anchor (no kink)", () => {
    // 95 (lightest) → 05 (darkest): OKLCH L must strictly decrease.
    const scale = deriveScale("#dc2626", tints);
    const ls = scale.map((s) => new Color(s.hex).to("oklch").coords[0]);
    for (let i = 1; i < ls.length; i++) {
      expect(ls[i]!).toBeLessThan(ls[i - 1]!);
    }
  });

  it("a pinned step still wins over the anchor", () => {
    const anchor = anchorTintFor("#f59e0b", tints);
    const scale = deriveScale("#f59e0b", tints, { [anchor]: "#123456" });
    expect(scale.find((s) => s.tint === anchor)!.hex).toBe("#123456");
  });
});

describe("core color model (DRI-119)", () => {
  it("exposes base/on/anchorTint for every variant, base = anchored tint", () => {
    const theme = generateTheme();
    for (const v of VARIANTS) {
      const core = theme.core[v];
      expect(core.base).toBe(hex(theme.identity.variants[v]));
      expect(core.anchorTint).toBe(anchorTintFor(theme.identity.variants[v], tints));
      const anchored = theme.palette[v].find((s) => s.tint === core.anchorTint)!;
      expect(anchored.hex).toBe(core.base);
    }
  });

  it("deriveOnColor is dark for light cores and white for dark cores", () => {
    expect(deriveOnColor("#ffffff")).toBe("#000000");
    expect(deriveOnColor("#000000")).toBe("#ffffff");
  });
});

describe("core token emission (DRI-119 / subsumes DRI-115 core half)", () => {
  it("emitCss emits --wa-color-{variant} and -on from the exact base hex", () => {
    const css = emitCss(generateTheme({ variants: { brand: "#f59e0b" } }));
    expect(css).toContain("--wa-color-brand: #f59e0b;");
    expect(css).toContain("--wa-color-brand-on: #000000;");
  });

  it("emitSwift emits the core color and its on-color", () => {
    const swift = emitSwift(generateTheme({ variants: { brand: "#f59e0b" } }));
    expect(swift).toContain('public static let brand = Color(drxHex: "#f59e0b")');
    expect(swift).toContain('public static let brandOn = Color(drxHex: "#000000")');
  });
});
