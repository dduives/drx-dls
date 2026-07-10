import { describe, expect, it } from "vitest";
import { CURRENT_SCHEMA_VERSION } from "@drx-dls/tokens";
import { importThemeInputs } from "../src/lib/importTheme.ts";

describe("import error path", () => {
  it("surfaces a formatted error for malformed JSON", () => {
    const result = importThemeInputs("{ not valid json ");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toMatch(/Invalid JSON/);
  });

  it("rejects unknown variant keys with a path-tagged message", () => {
    const bad = JSON.stringify({ variants: { bogus: "#fff" } });
    const result = importThemeInputs(bad);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    // formatValidationIssue prefixes the dotted path.
    expect(result.errors.some((e) => e.includes("variants.bogus"))).toBe(true);
  });

  it("rejects a file declaring a newer schema version than supported", () => {
    const future = JSON.stringify({ version: CURRENT_SCHEMA_VERSION + 1 });
    const result = importThemeInputs(future);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.some((e) => /newer than supported/.test(e))).toBe(true);
  });

  it("rejects non-numeric device scale knobs", () => {
    const bad = JSON.stringify({ devices: { ios: { radiusScale: "huge" } } });
    const result = importThemeInputs(bad);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.some((e) => e.includes("devices.ios.radiusScale"))).toBe(
      true,
    );
  });

  it("never yields an identity on failure (caller cannot overwrite inputs)", () => {
    // Mirrors ProjectSwitcher.handleFile: it only calls replaceInputs when
    // result.ok is true. A failed import therefore cannot clobber the active
    // project's inputs — there is simply no identity to apply.
    const result = importThemeInputs("[]");
    expect(result.ok).toBe(false);
    expect("identity" in result).toBe(false);
  });
});
