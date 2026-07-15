import { describe, expect, it } from "vitest";
import {
  emitCss,
  generateTheme,
  resolveIdentity,
  type Identity,
} from "@drx-dls/tokens";
import { buildThemeCss, buildThemeJson } from "../src/lib/exportTheme.ts";

// A representative non-default identity that exercises every input group so the
// parity check is meaningful (not just the base defaults).
function sampleIdentity(): Identity {
  return resolveIdentity({
    variants: { brand: "#3b82f6", danger: "#b91c1c" },
    radiusScale: 1.3,
    spaceScale: 0.9,
    fontFamily: { body: "Inter, sans-serif" },
    customFontUrl:
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap",
    formControl: { borderRadius: "0.5rem" },
    devices: { ios: { radiusScale: 1.25 }, tvos: { fontSizeScale: 1.7 } },
  });
}

describe("generator parity (Studio ↔ tokens CLI)", () => {
  it("buildThemeCss uses the same generateTheme + emitCss as the CLI (combined)", () => {
    const identity = sampleIdentity();
    // The CLI does: generateTheme(inputs) → emitCss(theme). Studio must be
    // byte-identical for the same inputs (guards "no forked copy").
    const cliCss = emitCss(generateTheme(identity));
    expect(buildThemeCss(identity)).toBe(cliCss);
  });

  it("round-trips through the on-disk drx.theme.json exactly like the CLI would", () => {
    const identity = sampleIdentity();
    // Studio export → JSON on disk → the CLI's loadInputs parses that JSON and
    // feeds it straight into generateTheme. Reproduce that path and confirm the
    // resulting CSS matches Studio's own export.
    const parsedInputs = JSON.parse(buildThemeJson(identity));
    const cliCss = emitCss(generateTheme(parsedInputs));
    expect(cliCss).toBe(buildThemeCss(identity));
  });

  it("matches the CLI per-device standalone output", () => {
    const identity = sampleIdentity();
    for (const device of ["web", "ios", "tvos"] as const) {
      const cliCss = emitCss(generateTheme(identity), { device });
      expect(buildThemeCss(identity, device)).toBe(cliCss);
    }
  });
});
