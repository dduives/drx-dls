import Color from "colorjs.io";
import type {
  DeviceOverride,
  Identity,
  ResolvedTheme,
  ScaleKnobs,
  VariantName,
} from "../types.js";

/** Compose identity scale knobs with a device's overrides (multiplicative). */
export function resolveScales(
  identity: Identity,
  device: DeviceOverride,
): ScaleKnobs {
  const round = (n: number) => Math.round(n * 1000) / 1000;
  return {
    radiusScale: round(identity.radiusScale * device.radiusScale),
    spaceScale: round(identity.spaceScale * device.spaceScale),
    fontSizeScale: round(identity.fontSizeScale * device.fontSizeScale),
    borderWidthScale: round(identity.borderWidthScale * device.borderWidthScale),
  };
}

/** Two-digit WebAwesome tint label: 95 -> "95", 5 -> "05". */
export function tintLabel(tint: number): string {
  return String(tint).padStart(2, "0");
}

const TINT_REF = /^([a-z]+)-(\d{1,2})$/;

/**
 * Resolve a color reference that is either a raw hex (`#rrggbb`) or a
 * variant-tint reference (`neutral-70`). Returns both a CSS value (a linked
 * `var(--wa-color-…)` for tint refs, or the hex itself) and the resolved hex
 * (for emitters without CSS custom-property support, e.g. Swift).
 */
export function resolveColorRef(
  ref: string,
  theme: ResolvedTheme,
): { css: string; hex: string } {
  if (ref.startsWith("#")) return { css: ref, hex: ref };

  const match = TINT_REF.exec(ref);
  if (match) {
    const variant = match[1] as VariantName;
    const tint = Number(match[2]);
    const scale = theme.palette[variant];
    if (scale) {
      const entry = scale.find((s) => s.tint === tint);
      if (entry) {
        return {
          css: `var(--wa-color-${variant}-${tintLabel(tint)})`,
          hex: entry.hex,
        };
      }
    }
  }

  // Unrecognized reference — pass through unchanged.
  return { css: ref, hex: ref };
}

/**
 * Format a color as a short human-readable OKLCH string for tooling/UI display
 * (e.g. the Studio palette ramp): `oklch(66% 0.15 41)`. Lightness as a
 * percentage, chroma to 3 decimals, hue rounded to a whole degree.
 */
export function formatOklch(color: string): string {
  const oklch = new Color(color).to("oklch");
  const [l, c, h] = oklch.coords;
  const lPct = Math.round((l || 0) * 100);
  const chroma = Math.round((c || 0) * 1000) / 1000;
  const hue = h == null || Number.isNaN(h) ? 0 : Math.round(h);
  return `oklch(${lPct}% ${chroma} ${hue})`;
}
