import { getBaseTokens } from "./generateTheme.js";
import type { ThemeInputs, VariantName } from "./types.js";

/**
 * Schema versioning + validation for imported `drx.theme.json` inputs.
 *
 * `base.tokens.json` declares the current schema `version`. Per-app theme files
 * may declare their own `version`; this module checks an imported file against
 * the current version and shape, and provides a migration hook so older files
 * can be upgraded field-by-field before use.
 *
 * Contract:
 *  - version **newer** than supported  → hard error (file needs newer tooling).
 *  - version **older** than supported  → `needsMigration`, run `migrateThemeInputs`.
 *  - version **absent**                → assumed current (pre-versioning files
 *    predate this feature and share the current shape). Lenient, non-breaking.
 *  - present fields are shape/type-checked; unknown variant keys are errors.
 */

export const CURRENT_SCHEMA_VERSION = getBaseTokens().version;

const VARIANT_NAMES: VariantName[] = [
  "brand",
  "neutral",
  "success",
  "warning",
  "danger",
];

const DEVICE_NAMES = ["web", "ios", "tvos"] as const;

export interface ValidationIssue {
  /** Dotted path to the offending field, e.g. `variants.brand`. */
  path: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  /** The resolved schema version (declared, or assumed current when absent). */
  version: number;
  /** True when the file is older than the current schema and must be migrated. */
  needsMigration: boolean;
  errors: ValidationIssue[];
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

const SCALE_KEYS = [
  "radiusScale",
  "spaceScale",
  "fontSizeScale",
  "borderWidthScale",
] as const;

const FORM_CONTROL_KEYS = [
  "paddingBlock",
  "paddingInline",
  "borderColor",
  "borderWidth",
  "borderStyle",
  "borderRadius",
] as const;

const COMPONENT_COLOR_KEYS = ["badgeBackground", "formControlBackground"] as const;

/** Ignored metadata keys allowed anywhere (JSON authoring aids). */
function isMetaKey(key: string): boolean {
  return key === "$schema" || key === "$comment" || key.startsWith("$");
}

function validateFields(
  json: Record<string, unknown>,
  errors: ValidationIssue[],
): void {
  const { variants, fontFamily, formControl } = json;

  if (variants !== undefined) {
    if (!isPlainObject(variants)) {
      errors.push({ path: "variants", message: "must be an object" });
    } else {
      for (const [key, value] of Object.entries(variants)) {
        if (isMetaKey(key)) continue;
        if (!VARIANT_NAMES.includes(key as VariantName)) {
          errors.push({
            path: `variants.${key}`,
            message: `unknown variant (expected one of ${VARIANT_NAMES.join(", ")})`,
          });
        } else if (typeof value !== "string") {
          errors.push({
            path: `variants.${key}`,
            message: "must be a color string",
          });
        }
      }
    }
  }

  for (const key of SCALE_KEYS) {
    const value = json[key];
    if (value !== undefined && typeof value !== "number") {
      errors.push({ path: key, message: "must be a number" });
    }
  }

  if (fontFamily !== undefined) {
    if (!isPlainObject(fontFamily)) {
      errors.push({ path: "fontFamily", message: "must be an object" });
    } else {
      for (const [key, value] of Object.entries(fontFamily)) {
        if (isMetaKey(key)) continue;
        if (!["body", "heading", "code"].includes(key)) {
          errors.push({
            path: `fontFamily.${key}`,
            message: "unknown slot (expected body, heading, or code)",
          });
        } else if (typeof value !== "string") {
          errors.push({
            path: `fontFamily.${key}`,
            message: "must be a string",
          });
        }
      }
    }
  }

  const { customFontUrl } = json;
  if (customFontUrl !== undefined && typeof customFontUrl !== "string") {
    errors.push({ path: "customFontUrl", message: "must be a string" });
  }

  if (formControl !== undefined) {
    if (!isPlainObject(formControl)) {
      errors.push({ path: "formControl", message: "must be an object" });
    } else {
      for (const [key, value] of Object.entries(formControl)) {
        if (isMetaKey(key)) continue;
        if (!FORM_CONTROL_KEYS.includes(key as (typeof FORM_CONTROL_KEYS)[number])) {
          errors.push({
            path: `formControl.${key}`,
            message: `unknown field (expected one of ${FORM_CONTROL_KEYS.join(", ")})`,
          });
        } else if (typeof value !== "string") {
          errors.push({
            path: `formControl.${key}`,
            message: "must be a string",
          });
        }
      }
    }
  }

  const { components } = json;
  if (components !== undefined) {
    if (!isPlainObject(components)) {
      errors.push({ path: "components", message: "must be an object" });
    } else {
      for (const [key, value] of Object.entries(components)) {
        if (isMetaKey(key)) continue;
        if (
          !COMPONENT_COLOR_KEYS.includes(
            key as (typeof COMPONENT_COLOR_KEYS)[number],
          )
        ) {
          errors.push({
            path: `components.${key}`,
            message: `unknown field (expected one of ${COMPONENT_COLOR_KEYS.join(", ")})`,
          });
        } else if (typeof value !== "string") {
          errors.push({
            path: `components.${key}`,
            message: "must be a color string",
          });
        }
      }
    }
  }

  const { paletteOverrides } = json;
  if (paletteOverrides !== undefined) {
    if (!isPlainObject(paletteOverrides)) {
      errors.push({ path: "paletteOverrides", message: "must be an object" });
    } else {
      for (const [variant, steps] of Object.entries(paletteOverrides)) {
        if (isMetaKey(variant)) continue;
        if (!VARIANT_NAMES.includes(variant as VariantName)) {
          errors.push({
            path: `paletteOverrides.${variant}`,
            message: `unknown variant (expected one of ${VARIANT_NAMES.join(", ")})`,
          });
          continue;
        }
        if (!isPlainObject(steps)) {
          errors.push({
            path: `paletteOverrides.${variant}`,
            message: "must be an object keyed by tint step",
          });
          continue;
        }
        for (const [tint, hex] of Object.entries(steps)) {
          if (isMetaKey(tint)) continue;
          if (typeof hex !== "string") {
            errors.push({
              path: `paletteOverrides.${variant}.${tint}`,
              message: "must be a color string",
            });
          }
        }
      }
    }
  }

  const { devices } = json;
  if (devices !== undefined) {
    if (!isPlainObject(devices)) {
      errors.push({ path: "devices", message: "must be an object" });
    } else {
      for (const [device, knobs] of Object.entries(devices)) {
        if (isMetaKey(device)) continue;
        if (!DEVICE_NAMES.includes(device as (typeof DEVICE_NAMES)[number])) {
          errors.push({
            path: `devices.${device}`,
            message: `unknown device (expected one of ${DEVICE_NAMES.join(", ")})`,
          });
          continue;
        }
        if (!isPlainObject(knobs)) {
          errors.push({
            path: `devices.${device}`,
            message: "must be an object",
          });
          continue;
        }
        for (const [key, value] of Object.entries(knobs)) {
          if (isMetaKey(key)) continue;
          if (!SCALE_KEYS.includes(key as (typeof SCALE_KEYS)[number])) {
            errors.push({
              path: `devices.${device}.${key}`,
              message: `unknown scale knob (expected one of ${SCALE_KEYS.join(", ")})`,
            });
          } else if (typeof value !== "number") {
            errors.push({
              path: `devices.${device}.${key}`,
              message: "must be a number",
            });
          }
        }
      }
    }
  }
}

/**
 * Validate parsed `drx.theme.json` inputs against the current schema. Does not
 * throw — returns a structured result so callers (CLI, Studio import) can show
 * clear messages instead of silently producing a broken theme.
 */
export function validateThemeInputs(json: unknown): ValidationResult {
  const errors: ValidationIssue[] = [];

  if (!isPlainObject(json)) {
    return {
      valid: false,
      version: CURRENT_SCHEMA_VERSION,
      needsMigration: false,
      errors: [{ path: "", message: "theme file must be a JSON object" }],
    };
  }

  let version = CURRENT_SCHEMA_VERSION;
  if (json.version !== undefined) {
    if (typeof json.version !== "number" || !Number.isInteger(json.version)) {
      errors.push({ path: "version", message: "must be an integer" });
    } else {
      version = json.version;
    }
  }

  if (version > CURRENT_SCHEMA_VERSION) {
    errors.push({
      path: "version",
      message: `schema version ${version} is newer than supported (${CURRENT_SCHEMA_VERSION}) — upgrade @drx-dls/tokens`,
    });
  }

  validateFields(json, errors);

  return {
    valid: errors.length === 0,
    version,
    needsMigration: version < CURRENT_SCHEMA_VERSION,
    errors,
  };
}

/** One migration step: transform inputs from version N to N+1. */
type Migration = (input: Record<string, unknown>) => Record<string, unknown>;

/**
 * Registry of migrations keyed by the *source* version. The v1→v2 step is a
 * no-op: the input shape did not change when versioning was introduced. The
 * v2→v3 step (DRI-113) drops the hand-entered `fontFaces` field, superseded by
 * DRI-108's Google Fonts `customFontUrl`. No value is preserved — a legacy
 * `@font-face` family can't be turned into a Google Fonts URL; users re-add the
 * font via the new field. Future schema changes add a step here without
 * touching the migration runner below.
 */
const MIGRATIONS: Record<number, Migration> = {
  1: (input) => input,
  2: (input) => {
    const { fontFaces: _dropped, ...rest } = input;
    return rest;
  },
};

/**
 * Upgrade older theme inputs to the current schema version, applying each
 * registered migration step in order. A no-op for current-version (or absent-
 * version) files today. Throws only if a version gap has no registered step.
 */
export function migrateThemeInputs(json: unknown): ThemeInputs {
  if (!isPlainObject(json)) {
    throw new Error("migrateThemeInputs: theme file must be a JSON object");
  }

  let current: Record<string, unknown> = { ...json };
  let version =
    typeof current.version === "number" && Number.isInteger(current.version)
      ? current.version
      : CURRENT_SCHEMA_VERSION;

  while (version < CURRENT_SCHEMA_VERSION) {
    const step = MIGRATIONS[version];
    if (!step) {
      throw new Error(
        `migrateThemeInputs: no migration registered for schema version ${version} → ${version + 1}`,
      );
    }
    current = step(current);
    version += 1;
  }

  current.version = CURRENT_SCHEMA_VERSION;
  return current as ThemeInputs;
}

/** Human-readable one-line summary of a validation issue. */
export function formatValidationIssue(issue: ValidationIssue): string {
  return issue.path ? `${issue.path}: ${issue.message}` : issue.message;
}
