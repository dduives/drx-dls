import { describe, expect, it } from "vitest";
import {
  resolveIdentity,
  validateThemeInputs,
  CURRENT_SCHEMA_VERSION,
  type Identity,
} from "@drx-dls/tokens";
import { buildThemeJson } from "../src/lib/exportTheme.ts";
import { importThemeInputs } from "../src/lib/importTheme.ts";

// Exercises variants, scale knobs, typography, a custom Google Font URL,
// form-control overrides, AND per-device scale overrides — the latter must
// survive the round-trip (DRI-64 requirement).
function richIdentity(): Identity {
  return resolveIdentity({
    variants: { brand: "#3b82f6", success: "#15803d" },
    radiusScale: 1.4,
    spaceScale: 0.85,
    fontSizeScale: 1.1,
    borderWidthScale: 1.0,
    fontFamily: { body: "Inter, sans-serif", heading: "Lexend, sans-serif" },
    customFontUrl:
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap",
    formControl: { borderRadius: "0.5rem", borderColor: "brand-40" },
    devices: {
      ios: { radiusScale: 1.25, fontSizeScale: 1.06 },
      tvos: { spaceScale: 1.5, fontSizeScale: 1.7 },
    },
  });
}

describe("export → import round-trip", () => {
  it("buildThemeJson → importThemeInputs yields an identical identity", () => {
    const identity = richIdentity();
    const result = importThemeInputs(buildThemeJson(identity));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    // NOTE (tokens behavior, not weakening): `buildThemeJson` writes the schema
    // `version`, and tokens' `resolveIdentity` spreads `...inputs`, so it echoes
    // that `version` onto the resolved object (the `Identity` type doesn't
    // declare it). A freshly-resolved identity has no `version`, so the only
    // difference after a round-trip is that harmless echoed tag. Assert every
    // real input field is preserved, and that the tag is exactly the schema
    // version.
    const { version, ...roundTripped } = result.identity as typeof result.identity & {
      version?: number;
    };
    expect(roundTripped).toEqual(identity);
    expect(version).toBe(CURRENT_SCHEMA_VERSION);
  });

  it("preserves per-device scale overrides through the round-trip", () => {
    const identity = richIdentity();
    const result = importThemeInputs(buildThemeJson(identity));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.identity.devices.ios.radiusScale).toBe(1.25);
    expect(result.identity.devices.tvos.spaceScale).toBe(1.5);
    expect(result.identity.devices.tvos.fontSizeScale).toBe(1.7);
    // Untouched knobs fall back to the base device values, not web's.
    expect(result.identity.devices).toEqual(identity.devices);
  });

  it("exported JSON passes validateThemeInputs", () => {
    const parsed = JSON.parse(buildThemeJson(richIdentity()));
    const validation = validateThemeInputs(parsed);
    expect(validation.valid).toBe(true);
    expect(validation.errors).toEqual([]);
    expect(validation.needsMigration).toBe(false);
  });

  it("export → import → export is idempotent", () => {
    const identity = richIdentity();
    const json1 = buildThemeJson(identity);
    const result = importThemeInputs(json1);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const json2 = buildThemeJson(result.identity);
    expect(json2).toBe(json1);
  });
});
