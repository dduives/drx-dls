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
  // Loaded once on mount. Always re-resolve through resolveIdentity() so a
  // persisted/seed identity is normalized against base.tokens.json defaults —
  // this backfills fields added in later schema revisions (e.g. paletteOverrides,
  // components) that older stored projects won't have.
  const defaultIdentity = useMemo(
    () => resolveIdentity(initialIdentity),
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
      setComponentColor: (patch) => {
        setIdentity((prev) => {
          const components = { ...prev.components, ...patch };
          // Drop keys explicitly cleared to `undefined` so the emitter falls
          // back to WebAwesome defaults instead of emitting an empty override.
          for (const key of Object.keys(patch) as (keyof typeof patch)[]) {
            if (patch[key] === undefined) delete components[key];
          }
          return { ...prev, components };
        });
      },
      setPaletteOverride: (variant, tint, hex) => {
        setIdentity((prev) => ({
          ...prev,
          paletteOverrides: {
            ...prev.paletteOverrides,
            [variant]: { ...(prev.paletteOverrides[variant] ?? {}), [tint]: hex },
          },
        }));
      },
      clearPaletteOverride: (variant, tint) => {
        setIdentity((prev) => {
          const forVariant = { ...(prev.paletteOverrides[variant] ?? {}) };
          delete forVariant[tint];
          const paletteOverrides = { ...prev.paletteOverrides };
          if (Object.keys(forVariant).length > 0) {
            paletteOverrides[variant] = forVariant;
          } else {
            delete paletteOverrides[variant];
          }
          return { ...prev, paletteOverrides };
        });
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
      setCustomFontUrl: (url) => {
        setIdentity((prev) => {
          const next = { ...prev };
          const trimmed = url.trim();
          if (trimmed) next.customFontUrl = trimmed;
          else delete next.customFontUrl;
          return next;
        });
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
