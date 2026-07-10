import { useMemo, useState, type ReactNode } from "react";
import type { DeviceName } from "@drx-dls/tokens";
import { DeviceContext, type DeviceContextValue } from "./deviceContext";

/**
 * Owns the active-device UI state (DRI-54). Provided high in the tree (around
 * `App`, inside `ProjectsProvider`) so `PlatformToggle`, `ScaleControls`, the
 * preview pane, and `ExportControls` all read the same single source of truth.
 * Defaults to `"web"`. Selection is intentionally not persisted (nice-to-have).
 */
export function DeviceProvider({ children }: { children: ReactNode }) {
  const [device, setDevice] = useState<DeviceName>("web");

  const value = useMemo<DeviceContextValue>(
    () => ({ device, setDevice }),
    [device],
  );

  return (
    <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>
  );
}
