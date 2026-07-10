import { useMemo, useState, type ReactNode } from "react";
import { resolveIdentity } from "@drx-dls/tokens";
import type { Identity } from "@drx-dls/tokens";
import { ThemeInputsContext, type ThemeInputsContextValue } from "./context";

export function ThemeInputsProvider({
  children,
  initialIdentity,
}: {
  children: ReactNode;
  /** Optional seed (e.g. a project's stored inputs). Defaults to base.tokens.json. */
  initialIdentity?: Identity;
}) {
  // Loaded once on mount; resolveIdentity() merges over base.tokens.json defaults.
  const defaultIdentity = useMemo(
    () => initialIdentity ?? resolveIdentity(),
    [initialIdentity],
  );
  const [identity, setIdentity] = useState<Identity>(defaultIdentity);

  const value = useMemo<ThemeInputsContextValue>(
    () => ({
      identity,
      setIdentity,
      updateIdentity: (patch) => {
        setIdentity((prev) => ({ ...prev, ...patch }));
      },
      setVariantColor: (variant, hex) => {
        setIdentity((prev) => ({
          ...prev,
          variants: { ...prev.variants, [variant]: hex },
        }));
      },
      setFontFamily: (kind, fontValue) => {
        setIdentity((prev) => ({
          ...prev,
          fontFamily: { ...prev.fontFamily, [kind]: fontValue },
        }));
      },
      setFormControl: (patch) => {
        setIdentity((prev) => ({
          ...prev,
          formControl: { ...prev.formControl, ...patch },
        }));
      },
      setDeviceScale: (device, patch) => {
        setIdentity((prev) => ({
          ...prev,
          devices: {
            ...prev.devices,
            [device]: { ...prev.devices[device], ...patch },
          },
        }));
      },
      setFontFaces: (fontFaces) => {
        setIdentity((prev) => ({ ...prev, fontFaces }));
      },
      reset: () => setIdentity(resolveIdentity()),
    }),
    [identity],
  );

  return (
    <ThemeInputsContext.Provider value={value}>
      {children}
    </ThemeInputsContext.Provider>
  );
}
