import type { DeviceOverride, Identity, ScaleKnobs } from "../types.js";

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
