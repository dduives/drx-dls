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

/**
 * Direct overrides for WebAwesome's --wa-form-control-* component-group tokens
 * (shared by inputs, selects, textareas, and partially buttons). These are
 * passed through untouched — no OKLCH derivation. `borderColor` may be a raw
 * hex (`#rrggbb`) or a variant-tint reference (`neutral-70`), which the CSS
 * emitter links to `var(--wa-color-neutral-70)` and the Swift emitter resolves
 * to the palette hex.
 */
export interface FormControlTokens {
  paddingBlock: string;
  paddingInline: string;
  borderColor: string;
  borderWidth: string;
  borderStyle: string;
  borderRadius: string;
}

/**
 * A single custom web font to load via a CSS `@font-face` rule (web only).
 * `family` is the name apps reference from `fontFamily.{body,heading,code}`.
 */
export interface FontFace {
  /** The `font-family` name this face defines (e.g. "Inter"). */
  family: string;
  /**
   * Font source. Either a bare URL (`.woff2`/`.woff`/`.ttf`/`.otf` — the CSS
   * emitter infers `format(...)` from the extension and wraps it in `url(...)`),
   * a `data:` URL, or a full CSS `src` value (containing `url(`/`local(`), which
   * is passed through verbatim.
   */
  src: string;
  /** Optional `font-weight` (e.g. "400", "700", or a range "400 700"). */
  weight?: string;
  /** Optional `font-style` (normal | italic | oblique). */
  style?: string;
  /** Optional `font-display` strategy; defaults to "swap". */
  display?: string;
}

/** The per-app INPUTS. This is what `drx.theme.json` contains. */
export interface Identity extends ScaleKnobs {
  /** Base color per WebAwesome variant. */
  variants: Record<VariantName, string>;
  fontFamily: { body: string; heading: string; code: string };
  /**
   * Optional custom web fonts to load. Each entry emits one `@font-face` rule
   * (web/CSS only). Reference the loaded `family` name from the `fontFamily`
   * stacks above. Native platforms load fonts in the app repo — Swift/JSON
   * emitters pass this metadata through as-is.
   */
  fontFaces: FontFace[];
  /** Form-control component-group overrides (--wa-form-control-*). */
  formControl: FormControlTokens;
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
export type ThemeInputs = Partial<
  Omit<Identity, "variants" | "fontFamily" | "formControl">
> & {
  /** Schema version this file targets (see `base.tokens.json` `version`). */
  version?: number;
  variants?: Partial<Record<VariantName, string>>;
  fontFamily?: Partial<Identity["fontFamily"]>;
  formControl?: Partial<FormControlTokens>;
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
