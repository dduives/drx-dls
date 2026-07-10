import { createContext } from "react";
import type { DeviceName } from "@drx-dls/tokens";

/**
 * The device the designer is currently editing/previewing (DRI-54). This is UI
 * state — NOT part of Identity. The palette/typography/form-control identity is
 * shared across all devices; only the four scale knobs vary per device. The
 * active device drives three things:
 *   1. which scale knobs `ScaleControls` targets (web → global knobs; ios/tvos
 *      → `identity.devices[device]`),
 *   2. the preview root's `data-device` attribute (activates DRI-52's scoped
 *      device override blocks) + chrome swap, and
 *   3. which standalone per-device CSS the export cluster emits by default.
 */
export interface DeviceContextValue {
  device: DeviceName;
  setDevice: (device: DeviceName) => void;
}

export const DeviceContext = createContext<DeviceContextValue | null>(null);
