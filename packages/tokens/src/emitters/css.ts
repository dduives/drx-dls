import type { DeviceName, ResolvedTheme, VariantName } from "../types.js";
import { resolveScales, tintLabel } from "./shared.js";

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
 * Emit theme.css targeting WebAwesome's --wa-* tokens: variant palettes
 * (mode-independent) + font families in :root with the web scale knobs, and
 * [data-device] blocks overriding the global scale knobs for iOS / tvOS.
 */
export function emitCss(theme: ResolvedTheme): string {
  const blocks: string[] = [];

  blocks.push(
    `/* drx-dls theme: ${theme.name} — generated, do not edit by hand */`,
  );

  blocks.push(
    `:root {\n` +
      [
        ...paletteVars(theme),
        ...fontVars(theme),
        ...scaleVars(theme, "web"),
      ].join("\n") +
      `\n}`,
  );

  for (const device of ["ios", "tvos"] as DeviceName[]) {
    blocks.push(
      `[data-device="${device}"] {\n` +
        scaleVars(theme, device).join("\n") +
        `\n}`,
    );
  }

  return blocks.join("\n\n") + "\n";
}

export type { VariantName };
