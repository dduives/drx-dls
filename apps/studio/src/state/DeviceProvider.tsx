import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { DeviceName } from "@drx-dls/tokens";
import { ACTIVE_DEVICE_KEY, readString, writeString } from "../lib/storage";
import { DeviceContext, type DeviceContextValue } from "./deviceContext";

const DEVICE_NAMES: readonly DeviceName[] = ["web", "ios", "tvos"];
const DEFAULT_DEVICE: DeviceName = "web";

function readInitialDevice(): DeviceName {
  const stored = readString(ACTIVE_DEVICE_KEY);
  return DEVICE_NAMES.includes(stored as DeviceName)
    ? (stored as DeviceName)
    : DEFAULT_DEVICE;
}

/**
 * Owns the active-device UI state (DRI-54). Provided high in the tree (around
 * `App`, inside `ProjectsProvider`) so `PlatformToggle`, `ScaleControls`, the
 * preview pane, and `ExportControls` all read the same single source of truth.
 *
 * The selection is a single global choice persisted to localStorage (DRI-67):
 * it seeds from storage (defaulting to `"web"` when absent/invalid) and writes
 * back on change, so a designer returns to the device they were editing.
 */
export function DeviceProvider({ children }: { children: ReactNode }) {
  const [device, setDevice] = useState<DeviceName>(readInitialDevice);

  useEffect(() => {
    writeString(ACTIVE_DEVICE_KEY, device);
  }, [device]);

  const value = useMemo<DeviceContextValue>(
    () => ({ device, setDevice }),
    [device],
  );

  return (
    <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>
  );
}
