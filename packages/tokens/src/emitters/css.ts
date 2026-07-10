import type { DeviceName, FontFace, ResolvedTheme, VariantName } from "../types.js";
import { resolveColorRef, resolveScales, tintLabel } from "./shared.js";

const FORMAT_BY_EXT: Record<string, string> = {
  woff2: "woff2",
  woff: "woff",
  ttf: "truetype",
  otf: "opentype",
  eot: "embedded-opentype",
  svg: "svg",
};

/** Build the CSS `src:` value for a font face, inferring format from the URL. */
function fontFaceSrc(src: string): string {
  // Already a full src value (url(...)/local(...)) — pass through verbatim.
  if (/\b(url|local)\s*\(/.test(src)) return src;
  const withoutQuery = src.split(/[?#]/)[0] ?? src;
  const ext = withoutQuery.split(".").pop()?.toLowerCase() ?? "";
  const format = FORMAT_BY_EXT[ext];
  const url = `url("${src}")`;
  return format ? `${url} format("${format}")` : url;
}

/** Emit one `@font-face` rule for a custom font. */
function fontFaceRule(face: FontFace): string {
  const lines = [
    `  font-family: "${face.family}";`,
    `  src: ${fontFaceSrc(face.src)};`,
  ];
  if (face.weight) lines.push(`  font-weight: ${face.weight};`);
  if (face.style) lines.push(`  font-style: ${face.style};`);
  lines.push(`  font-display: ${face.display ?? "swap"};`);
  return `@font-face {\n${lines.join("\n")}\n}`;
}

function fontFaceRules(theme: ResolvedTheme): string[] {
  return theme.identity.fontFaces.map(fontFaceRule);
}

function paletteVars(theme: ResolvedTheme): string[] {
  const out: string[] = [];
  for (const [variant, scale] of Object.entries(theme.palette)) {
    for (const { tint, hex } of scale) {
      out.push(`  --wa-color-${variant}-${tintLabel(tint)}: ${hex};`);
    }
  }
  return out;
}

function fontVars(theme: ResolvedTheme): string[] {
  const f = theme.identity.fontFamily;
  return [
    `  --wa-font-family-body: ${f.body};`,
    `  --wa-font-family-heading: ${f.heading};`,
    `  --wa-font-family-code: ${f.code};`,
  ];
}

function formControlVars(theme: ResolvedTheme): string[] {
  const fc = theme.identity.formControl;
  return [
    `  --wa-form-control-padding-block: ${fc.paddingBlock};`,
    `  --wa-form-control-padding-inline: ${fc.paddingInline};`,
    `  --wa-form-control-border-color: ${resolveColorRef(fc.borderColor, theme).css};`,
    `  --wa-form-control-border-width: ${fc.borderWidth};`,
    `  --wa-form-control-border-style: ${fc.borderStyle};`,
    `  --wa-form-control-border-radius: ${fc.borderRadius};`,
  ];
}

function scaleVars(theme: ResolvedTheme, device: DeviceName): string[] {
  const s = resolveScales(theme.identity, theme.devices[device]);
  return [
    `  --wa-border-radius-scale: ${s.radiusScale};`,
    `  --wa-space-scale: ${s.spaceScale};`,
    `  --wa-font-size-scale: ${s.fontSizeScale};`,
    `  --wa-border-width-scale: ${s.borderWidthScale};`,
  ];
}

/**
 * Emit theme.css targeting WebAwesome's --wa-* tokens.
 *
 * Combined (default, no `options.device`): variant palettes (mode-independent)
 * + font families in `:root` with the web scale knobs, and `[data-device]`
 * blocks overriding the global scale knobs for iOS / tvOS.
 *
 * Standalone (`options.device` set): a self-contained file for a single device
 * (e.g. a separate app repo). The chosen device's resolved scale knobs live in
 * `:root` directly and NO `[data-device]` blocks are emitted. `@font-face`
 * rules are still emitted at the top.
 */
export function emitCss(
  theme: ResolvedTheme,
  options: { device?: DeviceName } = {},
): string {
  const { device } = options;
  const blocks: string[] = [];

  blocks.push(
    device
      ? `/* drx-dls theme: ${theme.name} — ${device} — generated, do not edit by hand */`
      : `/* drx-dls theme: ${theme.name} — generated, do not edit by hand */`,
  );

  const faces = fontFaceRules(theme);
  if (faces.length > 0) {
    blocks.push(faces.join("\n\n"));
  }

  blocks.push(
    `:root {\n` +
      [
        ...paletteVars(theme),
        ...fontVars(theme),
        ...formControlVars(theme),
        ...scaleVars(theme, device ?? "web"),
      ].join("\n") +
      `\n}`,
  );

  if (!device) {
    for (const d of ["ios", "tvos"] as DeviceName[]) {
      blocks.push(
        `[data-device="${d}"] {\n` + scaleVars(theme, d).join("\n") + `\n}`,
      );
    }
  }

  return blocks.join("\n\n") + "\n";
}

export type { VariantName };
