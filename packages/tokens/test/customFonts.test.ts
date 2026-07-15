import { describe, expect, it } from "vitest";
import { generateTheme } from "../src/generateTheme.js";
import { emitCss, emitJson } from "../src/emitters/index.js";

describe("custom font via Google Fonts URL (DRI-108)", () => {
  const URL =
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap";

  it("emits no @import when no customFontUrl is set", () => {
    expect(emitCss(generateTheme())).not.toContain("@import");
  });

  it("emits an @import for the custom font URL, before :root", () => {
    const css = emitCss(generateTheme({ customFontUrl: URL }));
    expect(css).toContain(`@import url("${URL}");`);
    expect(css.indexOf("@import")).toBeLessThan(css.indexOf(":root"));
  });

  it("emits the @import as the very first rule (before any comment content)", () => {
    const css = emitCss(generateTheme({ customFontUrl: URL }));
    // An @import must precede every rule except @charset; a leading comment is
    // allowed. Assert nothing rule-like appears before it.
    const importIdx = css.indexOf("@import");
    expect(importIdx).toBeGreaterThan(-1);
    expect(css.slice(0, importIdx)).not.toContain("{");
  });

  it("passes customFontUrl through resolveIdentity and JSON", () => {
    const theme = generateTheme({ customFontUrl: URL });
    expect(theme.identity.customFontUrl).toBe(URL);
    const json = JSON.parse(emitJson(theme));
    expect(json.identity.customFontUrl).toBe(URL);
  });
});
