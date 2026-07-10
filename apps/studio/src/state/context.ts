import { createContext } from "react";
import type {
  DeviceName,
  FontFace,
  FormControlTokens,
  Identity,
  ScaleKnobs,
  VariantName,
} from "@drx-dls/tokens";

/**
 * The single source of truth for the theme being edited. Mirrors
 * @drx-dls/tokens' `Identity` shape exactly — no duplicate/derived copies.
 * Every control panel field reads/writes through this context; the live
 * preview pipeline (studio-live-preview) reads `identity` and feeds it
 * straight into `generateTheme()`.
 */
export interface ThemeInputsContextValue {
  identity: Identity;
  /** Replace the whole identity (e.g. when switching/importing a project). */
  setIdentity: (identity: Identity) => void;
  /** Patch top-level scale knobs (radiusScale, spaceScale, etc). */
  updateIdentity: (
    patch: Partial<Omit<Identity, "variants" | "fontFamily">>,
  ) => void;
  /** Set a single variant's base color. */
  setVariantColor: (variant: VariantName, hex: string) => void;
  /** Set a single font-family slot (body/heading/code). */
  setFontFamily: (kind: keyof Identity["fontFamily"], value: string) => void;
  /** Patch the form-control token group (immutable merge over prev.formControl). */
  setFormControl: (patch: Partial<FormControlTokens>) => void;
  /**
   * Patch the per-device scale multipliers for one device (immutable merge over
   * `prev.devices[device]`). Colors/typography/form-control stay shared across
   * devices — only these four scale knobs vary. `web` edits usually go through
   * `updateIdentity` (the global baseline knobs); this targets `ios`/`tvos`.
   */
  setDeviceScale: (device: DeviceName, patch: Partial<ScaleKnobs>) => void;
  /** Replace the custom `@font-face` list (web font loading). */
  setFontFaces: (fontFaces: FontFace[]) => void;
  /** Reset to base.tokens.json defaults. */
  reset: () => void;
}

export const ThemeInputsContext =
  createContext<ThemeInputsContextValue | null>(null);
