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
 * Per-component-family background overrides (DRI-100). An optional layer on top
 * of the palette: when set, they steer the fill of a specific WebAwesome
 * component family independently of the global semantic mapping. Each value is
 * a raw hex (`#rrggbb`) or a variant-tint reference (`neutral-70`) — the same
 * encoding as `FormControlTokens.borderColor`. Omit a field to keep
 * WebAwesome's default (per-variant `fill-loud` for badges, surface for form
 * controls).
 */
export interface ComponentColorTokens {
  /** Overrides `wa-badge` background (WA default: `--wa-color-{variant}-fill-loud`). */
  badgeBackground?: string;
  /** Overrides `--wa-form-control-background-color` (WA default: surface). */
  formControlBackground?: string;
}

/**
 * Optional per-step palette pins (DRI-99). Advanced escape hatch: pin a specific
 * variant tint to an exact hex, overriding the OKLCH-derived value for that one
 * step. Keyed by variant, then by tint step number (as it appears in `tints`,
 * e.g. `40`). Unpinned steps keep the generated ramp value.
 */
export type PaletteOverrides = Partial<
  Record<VariantName, Record<number, string>>
>;

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
  /**
   * Optional custom web font loaded from a Google Fonts stylesheet URL
   * (web only, DRI-108). Emitted as an `@import` in the generated CSS so the
   * font loads at runtime; reference the family from the `fontFamily` stacks
   * above. Native platforms ignore it. Absent when unused.
   */
  customFontUrl?: string;
  /** Form-control component-group overrides (--wa-form-control-*). */
  formControl: FormControlTokens;
  /**
   * Optional per-component background overrides (badges, form controls).
   * Always present after `resolveIdentity` (defaults to `{}`); each field is
   * itself optional and only emitted when set.
   */
  components: ComponentColorTokens;
  /**
   * Optional per-step palette pins. Always present after `resolveIdentity`
   * (defaults to `{}`). Pinned steps override the OKLCH-derived tint hex.
   */
  paletteOverrides: PaletteOverrides;
  /**
   * Fully resolved per-device scale multipliers, always present after
   * `resolveIdentity`. Base structure (`base.tokens.json` `devices`) deep-merged
   * with any per-app `ThemeInputs.devices` overrides (per device, per knob).
   * The palette/typography identity is shared across devices — only these scale
   * knobs differ. `resolveScales(identity, identity.devices[device])` gives the
   * effective per-device scale.
   */
  devices: Record<DeviceName, DeviceOverride>;
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
  Omit<
    Identity,
    "variants" | "fontFamily" | "formControl" | "components" | "devices"
  >
> & {
  /** Schema version this file targets (see `base.tokens.json` `version`). */
  version?: number;
  variants?: Partial<Record<VariantName, string>>;
  fontFamily?: Partial<Identity["fontFamily"]>;
  formControl?: Partial<FormControlTokens>;
  /** Per-component background overrides (badges, form controls). */
  components?: Partial<ComponentColorTokens>;
  /**
   * Per-app overrides of the device scale multipliers. Shared palette/typography
   * across devices; only component sizes (scale knobs) vary per device. Merged
   * over the base structure per device, per knob — missing knobs fall back to the
   * base device value.
   */
  devices?: Partial<Record<DeviceName, Partial<ScaleKnobs>>>;
};

/** A resolved 11-tint scale for one variant: tint number -> hex. */
export interface TintScale {
  tint: number;
  hex: string;
}

/**
 * The per-variant core color (DRI-119). `base` is the exact brand hex, emitted
 * verbatim as WebAwesome's `--wa-color-{variant}` core token; `on` is its
 * derived readable on-color (`--wa-color-{variant}-on`); `anchorTint` is the
 * numbered ramp step the base color landed on (surfaced in Studio).
 */
export interface VariantCore {
  base: string;
  on: string;
  anchorTint: number;
}

/** Fully resolved theme, consumed by emitters. */
export interface ResolvedTheme {
  name: string;
  identity: Identity;
  tints: number[];
  /** variant -> ordered tint scale. */
  palette: Record<VariantName, TintScale[]>;
  /** variant -> core color (exact base hex + on-color + anchor step). */
  core: Record<VariantName, VariantCore>;
  devices: Record<DeviceName, DeviceOverride>;
}
