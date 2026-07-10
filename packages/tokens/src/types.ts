export type Appearance = "light" | "dark";

export type DeviceName = "web" | "ios" | "tvos";

/** The per-app INPUTS. This is what `drx.theme.json` contains. */
export interface Identity {
  /** Accent/brand base color (any CSS color string). */
  accent: string;
  /** Neutral/gray base color. */
  gray: string;
  /** Default appearance for the app. */
  appearance: Appearance;
  /** Base corner radius in px (before per-device scaling). */
  radius: number;
  /** Type scale multiplier. */
  typeScale: number;
  fontFamily: { sans: string; mono: string };
}

export interface DeviceOverride {
  radiusScale: number;
  fontSizeBase: number;
  spacingBase: number;
  spacingScale: number;
  focusRingWidth: number;
  safeArea: number;
  touchTarget?: number;
}

/** The STRUCTURE — shape of `base.tokens.json`. */
export interface BaseTokens {
  version: number;
  name: string;
  identity: Identity;
  scales: string[];
  aliases: Record<string, string>;
  devices: Record<DeviceName, DeviceOverride>;
}

/** A partial identity override, as loaded from a per-app `drx.theme.json`. */
export type ThemeInputs = Partial<Identity> & {
  fontFamily?: Partial<Identity["fontFamily"]>;
};

export interface AlphaColor {
  /** Solid color the alpha is based on. */
  hex: string;
  /** Alpha 0..1. */
  alpha: number;
  /** Precomposed rgba() string over the scale's step-1 background. */
  rgba: string;
}

/** One 12-step scale plus its alpha variant, for one appearance. */
export interface ScaleSet {
  solid: string[]; // 12 hex strings, index 0 = step 1
  alpha: AlphaColor[]; // 12 alpha colors
}

export interface ResolvedColors {
  /** scaleName -> ScaleSet */
  scales: Record<string, ScaleSet>;
}

/** Fully resolved theme, consumed by emitters. */
export interface ResolvedTheme {
  name: string;
  identity: Identity;
  colors: Record<Appearance, ResolvedColors>;
  aliases: Record<string, string>;
  devices: Record<DeviceName, DeviceOverride>;
}
