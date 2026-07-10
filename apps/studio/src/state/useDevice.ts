import { useContext } from "react";
import { DeviceContext, type DeviceContextValue } from "./deviceContext";

/** Read the active device + setter. Must be used within a `<DeviceProvider>`. */
export function useDevice(): DeviceContextValue {
  const ctx = useContext(DeviceContext);
  if (!ctx) {
    throw new Error("useDevice must be used within a <DeviceProvider>");
  }
  return ctx;
}
