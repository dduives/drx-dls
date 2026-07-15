import { describe, expect, it } from "vitest";
import { generateTheme } from "../src/generateTheme.js";
import { emitCss, emitSwift, emitJson } from "../src/emitters/index.js";

describe("custom web fonts", () => {
  it("defaults to no font faces", () => {
    const theme = generateTheme();
    expect(theme.identity.fontFaces).toEqual([]);
  });

  it("passes fontFaces inputs through resolveIdentity", () => {
    const theme = generateTheme({
      fontFaces: [{ family: "Inter", src: "https://x/Inter.woff2" }],
    });
    expect(theme.identity.fontFaces).toHaveLength(1);
    expect(theme.identity.fontFaces[0]!.family).toBe("Inter");
  });

  it("emits no @font-face when there are none", () => {
    expect(emitCss(generateTheme())).not.toContain("@font-face");
  });

  it("emits an @font-face rule before :root", () => {
    const css = emitCss(
      generateTheme({
        fontFaces: [
          { family: "Inter", src: "https://x/Inter.woff2", weight: "400" },
        ],
      }),
    );
    expect(css.indexOf("@font-face")).toBeLessThan(css.indexOf(":root"));
    expect(css).toContain('font-family: "Inter";');
    expect(css).toContain('src: url("https://x/Inter.woff2") format("woff2");');
    expect(css).toContain("font-weight: 400;");
    expect(css).toContain("font-display: swap;");
  });

  it("infers format from extension and strips query/hash", () => {
    const css = emitCss(
      generateTheme({
        fontFaces: [
          { family: "A", src: "https://x/a.woff2?v=1" },
          { family: "B", src: "https://x/b.ttf" },
          { family: "C", src: "https://x/c.otf#frag" },
          { family: "D", src: "https://x/d.unknownext" },
        ],
      }),
    );
    expect(css).toContain('url("https://x/a.woff2?v=1") format("woff2")');
    expect(css).toContain('url("https://x/b.ttf") format("truetype")');
    expect(css).toContain('url("https://x/c.otf#frag") format("opentype")');
    // unknown extension → no format()
    expect(css).toContain('url("https://x/d.unknownext");');
    expect(css).not.toContain("unknownext) format");
  });

  it("passes a full src value through verbatim", () => {
    const full = 'url("a.woff2") format("woff2"), local("Arial")';
    const css = emitCss(
      generateTheme({ fontFaces: [{ family: "A", src: full }] }),
    );
    expect(css).toContain(`src: ${full};`);
  });

  it("honors custom font-display and style", () => {
    const css = emitCss(
      generateTheme({
        fontFaces: [
          {
            family: "A",
            src: "https://x/a.woff2",
            style: "italic",
            display: "fallback",
          },
        ],
      }),
    );
    expect(css).toContain("font-style: italic;");
    expect(css).toContain("font-display: fallback;");
  });

  it("Swift passes font metadata through with nil for missing weight/style", () => {
    const swift = emitSwift(
      generateTheme({
        fontFaces: [
          { family: "Inter", src: "https://x/i.woff2", weight: "700" },
          { family: "Mono", src: "https://x/m.woff2" },
        ],
      }),
    );
    expect(swift).toContain("public enum DRXFonts");
    expect(swift).toContain(
      '(family: "Inter", src: "https://x/i.woff2", weight: "700", style: nil)',
    );
    expect(swift).toContain(
      '(family: "Mono", src: "https://x/m.woff2", weight: nil, style: nil)',
    );
  });

  it("Swift emits an empty customFaces array by default", () => {
    expect(emitSwift(generateTheme())).toContain(
      "public static let customFaces: [(family: String, src: String, weight: String?, style: String?)] = []",
    );
  });

  it("JSON output includes fontFaces", () => {
    const json = JSON.parse(
      emitJson(
        generateTheme({
          fontFaces: [{ family: "Inter", src: "https://x/i.woff2" }],
        }),
      ),
    );
    expect(json.identity.fontFaces).toEqual([
      { family: "Inter", src: "https://x/i.woff2" },
    ]);
  });
});

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

  it("emits @import before any @font-face rules", () => {
    const css = emitCss(
      generateTheme({
        customFontUrl: URL,
        fontFaces: [{ family: "Inter", src: "https://x/i.woff2" }],
      }),
    );
    expect(css.indexOf("@import")).toBeLessThan(css.indexOf("@font-face"));
  });

  it("passes customFontUrl through resolveIdentity and JSON", () => {
    const theme = generateTheme({ customFontUrl: URL });
    expect(theme.identity.customFontUrl).toBe(URL);
    const json = JSON.parse(emitJson(theme));
    expect(json.identity.customFontUrl).toBe(URL);
  });
});
