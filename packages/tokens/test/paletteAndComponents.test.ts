import { describe, expect, it } from "vitest";
import { generateTheme } from "../src/generateTheme.js";
import { deriveScale } from "../src/deriveScale.js";
import { emitCss, emitSwift, emitJson } from "../src/emitters/index.js";
import { formatOklch, resolveColorRef } from "../src/emitters/shared.js";
import { validateThemeInputs } from "../src/schema.js";

describe("palette per-step overrides (DRI-99)", () => {
  const tints = [95, 90, 80, 70, 60, 50, 40, 30, 20, 10, 5];

  it("deriveScale pins an overridden tint and derives the rest", () => {
    const withOut = deriveScale("#f59e0b", tints);
    const withIn = deriveScale("#f59e0b", tints, { 40: "#123456" });
    const pinned = withIn.find((s) => s.tint === 40)!;
    expect(pinned.hex).toBe("#123456");
    // Non-pinned steps are unchanged from the pure derivation.
    for (const t of tints) {
      if (t === 40) continue;
      expect(withIn.find((s) => s.tint === t)!.hex).toBe(
        withOut.find((s) => s.tint === t)!.hex,
      );
    }
  });

  it("generateTheme applies paletteOverrides into the resolved palette", () => {
    const theme = generateTheme({
      paletteOverrides: { brand: { 40: "#abcdef" } },
    });
    expect(theme.palette.brand.find((s) => s.tint === 40)!.hex).toBe("#abcdef");
    expect(theme.identity.paletteOverrides.brand?.[40]).toBe("#abcdef");
  });

  it("resolveIdentity defaults paletteOverrides to an empty object", () => {
    expect(generateTheme().identity.paletteOverrides).toEqual({});
  });

  it("emitCss reflects a pinned tint in --wa-color-*", () => {
    const css = emitCss(
      generateTheme({ paletteOverrides: { danger: { 5: "#010203" } } }),
    );
    expect(css).toContain("--wa-color-danger-05: #010203;");
  });

  it("emitSwift reflects a pinned tint in the palette enum", () => {
    const swift = emitSwift(
      generateTheme({ paletteOverrides: { success: { 50: "#0f0f0f" } } }),
    );
    expect(swift).toContain(
      'public static let success50 = Color(drxHex: "#0f0f0f")',
    );
  });
});

describe("component background overrides (DRI-100)", () => {
  it("defaults components to an empty object", () => {
    expect(generateTheme().identity.components).toEqual({});
  });

  it("does not emit override rules/vars when unset", () => {
    const css = emitCss(generateTheme());
    expect(css).not.toContain("--wa-form-control-background-color");
    expect(css).not.toContain("wa-badge {");
  });

  it("emits a form-control background var from a variant-tint ref", () => {
    const css = emitCss(
      generateTheme({ components: { formControlBackground: "neutral-90" } }),
    );
    expect(css).toContain(
      "--wa-form-control-background-color: var(--wa-color-neutral-90);",
    );
  });

  it("emits a form-control background var from a raw hex", () => {
    const css = emitCss(
      generateTheme({ components: { formControlBackground: "#fafafa" } }),
    );
    expect(css).toContain("--wa-form-control-background-color: #fafafa;");
  });

  it("emits a scoped-safe wa-badge rule for badge background", () => {
    const css = emitCss(
      generateTheme({ components: { badgeBackground: "brand-40" } }),
    );
    expect(css).toMatch(/^wa-badge \{/m);
    expect(css).toContain("background-color: var(--wa-color-brand-40);");
  });

  it("emitSwift resolves component overrides to palette hex", () => {
    const theme = generateTheme({
      components: { badgeBackground: "brand-40", formControlBackground: "neutral-90" },
    });
    const swift = emitSwift(theme);
    const badgeHex = resolveColorRef("brand-40", theme).hex;
    const fcHex = resolveColorRef("neutral-90", theme).hex;
    expect(swift).toContain(
      `public static let badgeBackground = Color(drxHex: "${badgeHex}")`,
    );
    expect(swift).toContain(
      `public static let background = Color(drxHex: "${fcHex}")`,
    );
  });

  it("emitJson round-trips the override layers", () => {
    const json = JSON.parse(
      emitJson(
        generateTheme({
          components: { badgeBackground: "brand-40" },
          paletteOverrides: { brand: { 40: "#abcdef" } },
        }),
      ),
    );
    expect(json.identity.components.badgeBackground).toBe("brand-40");
    expect(json.identity.paletteOverrides.brand["40"]).toBe("#abcdef");
  });
});

describe("schema validation for override layers", () => {
  it("accepts valid components + paletteOverrides", () => {
    const result = validateThemeInputs({
      components: { badgeBackground: "brand-40" },
      paletteOverrides: { brand: { 40: "#abcdef" } },
    });
    expect(result.valid).toBe(true);
  });

  it("flags an unknown components field", () => {
    const result = validateThemeInputs({ components: { nope: "#fff" } });
    expect(result.valid).toBe(false);
    expect(result.errors[0]!.path).toBe("components.nope");
  });

  it("flags an unknown paletteOverrides variant", () => {
    const result = validateThemeInputs({ paletteOverrides: { bogus: { 40: "#fff" } } });
    expect(result.valid).toBe(false);
    expect(result.errors[0]!.path).toBe("paletteOverrides.bogus");
  });

  it("flags a non-string override value", () => {
    const result = validateThemeInputs({
      paletteOverrides: { brand: { 40: 123 } },
    });
    expect(result.valid).toBe(false);
    expect(result.errors[0]!.path).toBe("paletteOverrides.brand.40");
  });
});

describe("formatOklch (DRI-99 UI helper)", () => {
  it("formats a hex as an oklch() string", () => {
    expect(formatOklch("#ffffff")).toMatch(/^oklch\(100% 0 0\)$/);
  });

  it("reports lightness %, chroma, and hue", () => {
    const out = formatOklch("#f59e0b");
    expect(out).toMatch(/^oklch\(\d+% [\d.]+ \d+\)$/);
  });
});
