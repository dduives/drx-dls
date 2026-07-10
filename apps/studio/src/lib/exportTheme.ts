// Serialize the active project's `Identity` back into a `drx.theme.json`
// (INPUTS ONLY) and produce a drop-in `theme.css` — both using the SAME
// @drx-dls/tokens code as the CLI (no forked copy, no invented tokens).
//
// The JSON shape mirrors `packages/tokens/drx.theme.example.json` exactly:
//   version, variants, radiusScale, spaceScale, fontSizeScale,
//   borderWidthScale, fontFamily, fontFaces, formControl.
// `$comment` annotations from the example are dropped (they are just docs).
// No resolved palette/values are emitted — `Identity` is already inputs-only.
//
// Kept pure/side-effect-free so DRI-64 can unit-test the export → import
// round-trip (`buildThemeJson` → `importThemeInputs` yields the same identity).

import {
  CURRENT_SCHEMA_VERSION,
  emitCss,
  generateTheme,
  type FontFace,
  type Identity,
} from "@drx-dls/tokens";

/**
 * Build the on-disk `drx.theme.json` string for an identity.
 *
 * Emits keys in the same order as `drx.theme.example.json`, tagged with the
 * current schema version (never hardcoded) so the file is future-proof and
 * re-importable via `importThemeInputs`. Pretty-printed (2-space) with a
 * trailing newline, matching the CLI's file style.
 */
export function buildThemeJson(identity: Identity): string {
  // Rebuild each font face so only defined optional keys are serialized and
  // key order stays stable.
  const fontFaces = identity.fontFaces.map((face) => {
    const out: FontFace = { family: face.family, src: face.src };
    if (face.weight !== undefined) out.weight = face.weight;
    if (face.style !== undefined) out.style = face.style;
    if (face.display !== undefined) out.display = face.display;
    return out;
  });

  const doc = {
    version: CURRENT_SCHEMA_VERSION,
    variants: identity.variants,
    radiusScale: identity.radiusScale,
    spaceScale: identity.spaceScale,
    fontSizeScale: identity.fontSizeScale,
    borderWidthScale: identity.borderWidthScale,
    fontFamily: identity.fontFamily,
    fontFaces,
    formControl: identity.formControl,
  };

  return JSON.stringify(doc, null, 2) + "\n";
}

/**
 * Build the drop-in `theme.css` for an identity: the UNSCOPED CLI output an app
 * would ship directly (`:root { … }` + `@font-face` + device blocks). This is
 * intentionally NOT the preview-scoped variant (see `scopedTheme.ts`).
 */
export function buildThemeCss(identity: Identity): string {
  return emitCss(generateTheme(identity));
}
