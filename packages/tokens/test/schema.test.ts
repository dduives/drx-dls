import { describe, it, expect } from "vitest";
import {
  validateThemeInputs,
  migrateThemeInputs,
  formatValidationIssue,
  CURRENT_SCHEMA_VERSION,
} from "../src/schema.js";

describe("validateThemeInputs", () => {
  it("accepts a well-formed inputs object", () => {
    const result = validateThemeInputs({
      version: CURRENT_SCHEMA_VERSION,
      variants: { brand: "#123456", danger: "#ff0000" },
      radiusScale: 1.2,
      fontFamily: { body: "Inter", heading: "Inter" },
      formControl: { borderRadius: "0.5rem" },
    });
    expect(result.valid).toBe(true);
    expect(result.needsMigration).toBe(false);
    expect(result.errors).toEqual([]);
    expect(result.version).toBe(CURRENT_SCHEMA_VERSION);
  });

  it("treats an absent version as current (lenient, non-breaking)", () => {
    const result = validateThemeInputs({ variants: { brand: "#123456" } });
    expect(result.valid).toBe(true);
    expect(result.version).toBe(CURRENT_SCHEMA_VERSION);
    expect(result.needsMigration).toBe(false);
  });

  it("hard-errors when the version is newer than supported", () => {
    const result = validateThemeInputs({
      version: CURRENT_SCHEMA_VERSION + 1,
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.path === "version")).toBe(true);
  });

  it("flags an older version as needing migration (still valid shape)", () => {
    const result = validateThemeInputs({
      version: CURRENT_SCHEMA_VERSION - 1,
      variants: { brand: "#123456" },
    });
    expect(result.valid).toBe(true);
    expect(result.needsMigration).toBe(true);
    expect(result.version).toBe(CURRENT_SCHEMA_VERSION - 1);
  });

  it("rejects a non-object theme file", () => {
    expect(validateThemeInputs([]).valid).toBe(false);
    expect(validateThemeInputs("nope").valid).toBe(false);
    expect(validateThemeInputs(null).valid).toBe(false);
  });

  it("rejects unknown variant keys and non-string colors", () => {
    const result = validateThemeInputs({
      variants: { brand: 123, bogus: "#fff" },
    });
    expect(result.valid).toBe(false);
    const paths = result.errors.map((e) => e.path);
    expect(paths).toContain("variants.brand");
    expect(paths).toContain("variants.bogus");
  });

  it("rejects non-numeric scale knobs", () => {
    const result = validateThemeInputs({ radiusScale: "big" });
    expect(result.valid).toBe(false);
    expect(result.errors[0].path).toBe("radiusScale");
  });

  it("accepts a string customFontUrl and rejects a non-string", () => {
    expect(
      validateThemeInputs({
        customFontUrl:
          "https://fonts.googleapis.com/css2?family=Inter&display=swap",
      }).valid,
    ).toBe(true);
    const bad = validateThemeInputs({ customFontUrl: 123 });
    expect(bad.valid).toBe(false);
    expect(bad.errors.some((e) => e.path === "customFontUrl")).toBe(true);
  });

  it("rejects unknown formControl fields", () => {
    const result = validateThemeInputs({ formControl: { bogus: "x" } });
    expect(result.valid).toBe(false);
    expect(result.errors[0].path).toBe("formControl.bogus");
  });

  it("ignores $-prefixed metadata keys", () => {
    const result = validateThemeInputs({
      $schema: "./x.json",
      $comment: "hi",
      variants: { $note: "ignored", brand: "#123456" },
    });
    expect(result.valid).toBe(true);
  });

  it("requires an integer version when present", () => {
    const result = validateThemeInputs({ version: 1.5 });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.path === "version")).toBe(true);
  });
});

describe("migrateThemeInputs", () => {
  it("stamps the current version for older files (no dropped fields present)", () => {
    const migrated = migrateThemeInputs({
      version: CURRENT_SCHEMA_VERSION - 1,
      variants: { brand: "#123456" },
    });
    expect(migrated.version).toBe(CURRENT_SCHEMA_VERSION);
    expect(migrated.variants).toEqual({ brand: "#123456" });
  });

  it("drops fontFaces when migrating a v2 theme to v3 (DRI-113)", () => {
    const migrated = migrateThemeInputs({
      version: 2,
      variants: { brand: "#123456" },
      fontFamily: { body: "Inter", heading: "Inter", code: "mono" },
      fontFaces: [{ family: "Inter", src: "https://x/inter.woff2" }],
    }) as Record<string, unknown>;
    expect(migrated.version).toBe(CURRENT_SCHEMA_VERSION);
    expect(migrated.fontFaces).toBeUndefined();
    // Everything else survives untouched.
    expect(migrated.variants).toEqual({ brand: "#123456" });
    expect(migrated.fontFamily).toEqual({
      body: "Inter",
      heading: "Inter",
      code: "mono",
    });
  });

  it("re-validates a migrated v2 theme cleanly under v3 (round-trip)", () => {
    const migrated = migrateThemeInputs({
      version: 2,
      variants: { brand: "#123456" },
      fontFaces: [{ family: "Inter", src: "https://x/inter.woff2" }],
    });
    const result = validateThemeInputs(migrated);
    expect(result.valid).toBe(true);
    expect(result.needsMigration).toBe(false);
    expect(result.version).toBe(CURRENT_SCHEMA_VERSION);
  });

  it("leaves current-version inputs untouched (aside from version)", () => {
    const migrated = migrateThemeInputs({
      variants: { brand: "#abcdef" },
    });
    expect(migrated.version).toBe(CURRENT_SCHEMA_VERSION);
    expect(migrated.variants).toEqual({ brand: "#abcdef" });
  });

  it("throws when a version gap has no registered migration", () => {
    expect(() =>
      migrateThemeInputs({ version: CURRENT_SCHEMA_VERSION - 5 }),
    ).toThrow(/no migration registered/);
  });
});

describe("formatValidationIssue", () => {
  it("prefixes the path when present", () => {
    expect(formatValidationIssue({ path: "variants.brand", message: "bad" })).toBe(
      "variants.brand: bad",
    );
  });

  it("omits the prefix for root-level issues", () => {
    expect(formatValidationIssue({ path: "", message: "bad file" })).toBe(
      "bad file",
    );
  });
});
