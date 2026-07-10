import { describe, expect, it } from "vitest";
import { generateTheme } from "../src/generateTheme.js";
import { emitCss, emitSwift, emitJson } from "../src/emitters/index.js";
import { resolveColorRef } from "../src/emitters/shared.js";

describe("form-control token group", () => {
  it("resolveIdentity includes formControl defaults", () => {
    const theme = generateTheme();
    expect(theme.identity.formControl).toMatchObject({
      paddingBlock: "0.5em",
      paddingInline: "1em",
      borderColor: "neutral-70",
      borderWidth: "1px",
      borderStyle: "solid",
      borderRadius: "0.375rem",
    });
  });

  it("merges partial formControl inputs over defaults", () => {
    const theme = generateTheme({
      formControl: { borderRadius: "1rem", borderColor: "#abcdef" },
    });
    expect(theme.identity.formControl.borderRadius).toBe("1rem");
    expect(theme.identity.formControl.borderColor).toBe("#abcdef");
    // untouched fields keep defaults
    expect(theme.identity.formControl.paddingBlock).toBe("0.5em");
  });

  it("emitCss outputs all --wa-form-control-* vars", () => {
    const css = emitCss(generateTheme());
    expect(css).toContain("--wa-form-control-padding-block: 0.5em;");
    expect(css).toContain("--wa-form-control-padding-inline: 1em;");
    expect(css).toContain("--wa-form-control-border-width: 1px;");
    expect(css).toContain("--wa-form-control-border-style: solid;");
    expect(css).toContain("--wa-form-control-border-radius: 0.375rem;");
  });

  it("emitCss links a variant-tint borderColor to a var(--wa-color-*)", () => {
    const css = emitCss(generateTheme());
    expect(css).toContain(
      "--wa-form-control-border-color: var(--wa-color-neutral-70);",
    );
  });

  it("emitCss passes a raw hex borderColor through unchanged", () => {
    const css = emitCss(generateTheme({ formControl: { borderColor: "#123456" } }));
    expect(css).toContain("--wa-form-control-border-color: #123456;");
  });

  it("emitSwift resolves a variant-tint borderColor to the palette hex", () => {
    const theme = generateTheme();
    const swift = emitSwift(theme);
    const expectedHex = resolveColorRef("neutral-70", theme).hex;
    expect(swift).toContain("public enum DRXFormControl {");
    expect(swift).toContain(
      `public static let borderColor = Color(drxHex: "${expectedHex}")`,
    );
    expect(swift).toContain('public static let paddingBlock = "0.5em"');
  });

  it("emitJson includes the resolved formControl group", () => {
    const json = JSON.parse(emitJson(generateTheme()));
    expect(json.identity.formControl.borderColor).toBe("neutral-70");
    expect(json.identity.formControl.borderRadius).toBe("0.375rem");
  });
});

describe("resolveColorRef", () => {
  it("returns hex unchanged for a hex input", () => {
    const theme = generateTheme();
    expect(resolveColorRef("#ff0000", theme)).toEqual({
      css: "#ff0000",
      hex: "#ff0000",
    });
  });

  it("maps a variant-tint ref to a css var and palette hex", () => {
    const theme = generateTheme();
    const brand50 = theme.palette.brand.find((s) => s.tint === 50)!;
    expect(resolveColorRef("brand-50", theme)).toEqual({
      css: "var(--wa-color-brand-50)",
      hex: brand50.hex,
    });
  });

  it("pads single-digit tints in the css var label", () => {
    const theme = generateTheme();
    expect(resolveColorRef("neutral-5", theme).css).toBe(
      "var(--wa-color-neutral-05)",
    );
  });

  it("passes an unrecognized ref through unchanged", () => {
    const theme = generateTheme();
    expect(resolveColorRef("not-a-color", theme)).toEqual({
      css: "not-a-color",
      hex: "not-a-color",
    });
  });
});
