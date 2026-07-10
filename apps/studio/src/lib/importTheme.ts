// Import an existing `drx.theme.json` into a full `Identity`.
//
// Flow (per DRI-63 schema tooling):
//   parse JSON → validateThemeInputs → (if needsMigration) migrateThemeInputs
//   → resolveIdentity(inputs) → full Identity.
// On any failure we return a discriminated error result with human-readable
// messages and NEVER produce an identity, so callers can refuse to overwrite.

import {
  resolveIdentity,
  validateThemeInputs,
  migrateThemeInputs,
  formatValidationIssue,
} from "@drx-dls/tokens";
import type { Identity, ThemeInputs } from "@drx-dls/tokens";

export type ImportResult =
  | { ok: true; identity: Identity }
  | { ok: false; errors: string[] };

/** Parse + validate + migrate + resolve raw JSON text into a full Identity. */
export function importThemeInputs(rawText: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, errors: [`Invalid JSON: ${message}`] };
  }

  const result = validateThemeInputs(parsed);
  if (!result.valid) {
    return {
      ok: false,
      errors: result.errors.map(formatValidationIssue),
    };
  }

  let inputs: ThemeInputs;
  try {
    inputs = result.needsMigration
      ? migrateThemeInputs(parsed)
      : (parsed as ThemeInputs);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, errors: [`Migration failed: ${message}`] };
  }

  try {
    return { ok: true, identity: resolveIdentity(inputs) };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, errors: [`Could not resolve theme: ${message}`] };
  }
}
