import type { DeviceOverride, Identity } from "../types.js";

/** Parse an alias target like "accent.9" -> { scale, step }. */
export function parseAlias(ref: string): { scale: string; step: number } {
  const [scale, stepStr] = ref.split(".");
  const step = Number(stepStr);
  if (!scale || !Number.isInteger(step) || step < 1 || step > 12) {
    throw new Error(`Invalid alias target: "${ref}" (expected e.g. "accent.9")`);
  }
  return { scale, step };
}

/** Resolved metric values for one device. */
export interface DeviceMetrics {
  radius: number;
  fontSizeBase: number;
  spacingBase: number;
  spacingScale: number;
  focusRingWidth: number;
  safeArea: number;
  touchTarget: number;
}

export function resolveDeviceMetrics(
  identity: Identity,
  device: DeviceOverride,
): DeviceMetrics {
  return {
    radius: Math.round(identity.radius * device.radiusScale),
    fontSizeBase: Math.round(device.fontSizeBase * identity.typeScale),
    spacingBase: device.spacingBase,
    spacingScale: device.spacingScale,
    focusRingWidth: device.focusRingWidth,
    safeArea: device.safeArea,
    touchTarget: device.touchTarget ?? 0,
  };
}
