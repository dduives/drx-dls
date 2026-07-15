import { describe, expect, it } from "vitest";
import { parseGoogleFontUrl } from "../src/lib/parseGoogleFontUrl.ts";

describe("parseGoogleFontUrl", () => {
  it("parses a css2 URL with weight axis", () => {
    const result = parseGoogleFontUrl(
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap",
    );
    expect(result).toEqual({ ok: true, value: { families: ["Inter"] } });
  });

  it("parses multiple css2 family params and decodes '+' to spaces", () => {
    const result = parseGoogleFontUrl(
      "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400&family=Roboto+Mono",
    );
    expect(result).toEqual({
      ok: true,
      value: { families: ["Open Sans", "Roboto Mono"] },
    });
  });

  it("parses the legacy css endpoint with pipe-separated families", () => {
    const result = parseGoogleFontUrl(
      "https://fonts.googleapis.com/css?family=Open+Sans:400,700|Roboto",
    );
    expect(result).toEqual({
      ok: true,
      value: { families: ["Open Sans", "Roboto"] },
    });
  });

  it("de-dupes repeated families", () => {
    const result = parseGoogleFontUrl(
      "https://fonts.googleapis.com/css2?family=Inter:wght@400&family=Inter:wght@700",
    );
    expect(result).toEqual({ ok: true, value: { families: ["Inter"] } });
  });

  it("rejects an empty input", () => {
    const result = parseGoogleFontUrl("   ");
    expect(result.ok).toBe(false);
  });

  it("rejects a malformed URL", () => {
    const result = parseGoogleFontUrl("not a url");
    expect(result.ok).toBe(false);
  });

  it("rejects a non-Google host", () => {
    const result = parseGoogleFontUrl(
      "https://example.com/css2?family=Inter",
    );
    expect(result).toMatchObject({ ok: false });
    if (!result.ok) expect(result.error).toMatch(/fonts\.googleapis\.com/);
  });

  it("rejects a Google URL with no family param", () => {
    const result = parseGoogleFontUrl(
      "https://fonts.googleapis.com/css2?display=swap",
    );
    expect(result.ok).toBe(false);
  });
});
