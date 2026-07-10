export type DeviceName = "web" | "ios" | "tvos";

export type VariantName =
  | "brand"
  | "neutral"
  | "success"
  | "warning"
  | "danger";

/** Global scale knobs — map 1:1 onto WebAwesome's --wa-*-scale tokens. */
export interface ScaleKnobs {
  radiusScale: number;
  spaceScale: number;
  fontSizeScale: number;
  borderWidthScale: number;
}

/** The per-app INPUTS. This is what `drx.theme.json` contains. */
export interface Identity extends ScaleKnobs {
  /** Base color per WebAwesome variant. */
  variants: Record<VariantName, string>;
  fontFamily: { body: string; heading: string; code: string };
}

/** Per-device scale overrides. */
export type DeviceOverride = ScaleKnobs;

/** The STRUCTURE — shape of `base.tokens.json`. */
export interface BaseTokens {
  version: number;
  name: string;
  identity: Identity;
  /** Tint step numbers, light→dark (e.g. 95..5). */
  tints: number[];
  devices: Record<DeviceName, DeviceOverride>;
}

/** A partial identity override, as loaded from a per-app `drx.theme.json`. */
export type ThemeInputs = Partial<Omit<Identity, "variants" | "fontFamily">> & {
  variants?: Partial<Record<VariantName, string>>;
  fontFamily?: Partial<Identity["fontFamily"]>;
};

/** A resolved 11-tint scale for one variant: tint number -> hex. */
export interface TintScale {
  tint: number;
  hex: string;
}

/** Fully resolved theme, consumed by emitters. */
export interface ResolvedTheme {
  name: string;
  identity: Identity;
  tints: number[];
  /** variant -> ordered tint scale. */
  palette: Record<VariantName, TintScale[]>;
  devices: Record<DeviceName, DeviceOverride>;
}
