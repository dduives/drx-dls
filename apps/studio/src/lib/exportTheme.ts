// Serialize the active project's `Identity` back into a `drx.theme.json`
// (INPUTS ONLY) and produce a drop-in `theme.css` — both using the SAME
// @drx-dls/tokens code as the CLI (no forked copy, no invented tokens).
//
// The JSON shape mirrors `packages/tokens/drx.theme.example.json` exactly:
//   version, variants, radiusScale, spaceScale, fontSizeScale,
//   borderWidthScale, fontFamily, fontFaces, formControl, devices.
// `$comment` annotations from the example are dropped (they are just docs).
// No resolved palette/values are emitted — `Identity` is already inputs-only.
//
// Kept pure/side-effect-free so DRI-64 can unit-test the export → import
// round-trip (`buildThemeJson` → `importThemeInputs` yields the same identity).

import {
  CURRENT_SCHEMA_VERSION,
  emitCss,
  generateTheme,
  type DeviceName,
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
    // DRI-108: optional Google Fonts URL (web only). Only serialized when set,
    // so themes without a custom font stay clean and re-import unchanged.
    ...(identity.customFontUrl
      ? { customFontUrl: identity.customFontUrl }
      : {}),
    formControl: identity.formControl,
    // DRI-100 / DRI-99: optional override layers. Always present on `Identity`
    // (default `{}`); exported as-is so the file round-trips.
    components: identity.components,
    paletteOverrides: identity.paletteOverrides,
    // Per-device scale multipliers (DRI-54/DRI-66). `Identity.devices` is fully
    // resolved (web/ios/tvos always present); exporting the whole map keeps the
    // file inputs-only and re-importable — `validateThemeInputs` accepts a
    // partial-per-device `devices` object, and this is a superset of that.
    devices: identity.devices,
  };

  return JSON.stringify(doc, null, 2) + "\n";
}

/**
 * Build the drop-in `theme.css` for an identity: the UNSCOPED CLI output an app
 * would ship directly (`:root { … }` + `@font-face` + device blocks). This is
 * intentionally NOT the preview-scoped variant (see `scopedTheme.ts`).
 *
 * Combined (no `device`) → `:root` (web scales) + `[data-device]` blocks.
 * Standalone (`device` set) → a self-contained file for one device with that
 * device's resolved scales baked into `:root` and no `[data-device]` blocks —
 * for dropping into a separate per-device app repo.
 */
export function buildThemeCss(identity: Identity, device?: DeviceName): string {
  return emitCss(generateTheme(identity), device ? { device } : {});
}
