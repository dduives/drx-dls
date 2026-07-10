export type Appearance = "light" | "dark";

export type DeviceName = "web" | "ios" | "tvos";

/** The per-app INPUTS. This is what `drx.theme.json` contains. */
export interface Identity {
  /** Accent/brand base color (any CSS color string). */
  accent: string;
  /** Neutral/gray base color. */
  gray: string;
  /** Page background for the dark appearance. */
  backgroundDark: string;
  /** Page background for the light appearance. */
  backgroundLight: string;
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

/** One 12-step scale plus its alpha variant (hex8 strings), for one appearance. */
export interface ScaleSet {
  solid: string[]; // 12 hex strings, index 0 = step 1
  alpha: string[]; // 12 hex8 strings (e.g. #rrggbbaa)
}

export interface ResolvedColors {
  /** scaleName -> ScaleSet */
  scales: Record<string, ScaleSet>;
  /** Text color that sits legibly on the solid (step 9) accent. */
  contrast: string;
  /** Resolved page background. */
  background: string;
  /** Translucent gray surface (panels). */
  graySurface: string;
  /** Translucent accent surface. */
  accentSurface: string;
}

/** Fully resolved theme, consumed by emitters. */
export interface ResolvedTheme {
  name: string;
  identity: Identity;
  colors: Record<Appearance, ResolvedColors>;
  aliases: Record<string, string>;
  devices: Record<DeviceName, DeviceOverride>;
}
