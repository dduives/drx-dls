/**
 * Phosphor Icons as the WebAwesome default icon library.
 *
 * WebAwesome ships with Font Awesome as its `default` icon library, but the
 * Pro families (Chisel, Etch, Duotone, Sharp, …) are paywalled — only the
 * ~2000 Free icons resolve without a kit token. We replace the `default`
 * (and internal `system`) libraries with Phosphor Icons (MIT, 1200+ glyphs,
 * 6 weights) so every `<wa-icon>` renders a fully-open icon set.
 *
 * SVGs are served from jsDelivr (pinned version) — no bundler asset config,
 * no webfont, works identically in the plain-ESM demo and in Vite (Studio).
 *
 * @see https://phosphoricons.com — icon browser + names
 */

import { registerIconLibrary } from "@awesome.me/webawesome/dist/components/icon/library.js";

/** Pinned Phosphor asset version. Bump alongside the `@phosphor-icons/core` devDependency. */
export const PHOSPHOR_VERSION = "2.1.1";

const CDN_BASE = `https://cdn.jsdelivr.net/npm/@phosphor-icons/core@${PHOSPHOR_VERSION}/assets`;

/** The six Phosphor weights. */
export type PhosphorWeight =
  | "thin"
  | "light"
  | "regular"
  | "bold"
  | "fill"
  | "duotone";

/**
 * Map a WebAwesome `variant`/`family` token to a Phosphor weight.
 *
 * WebAwesome's classic variants are thin/light/regular/solid; when no variant
 * is set it passes `"solid"`. We map that (and unknown values) to Phosphor's
 * canonical `regular` weight. The three Phosphor-only weights (bold/fill/
 * duotone) are addressable directly via the `variant` attribute, e.g.
 * `<wa-icon name="heart" variant="fill">`.
 */
const WEIGHT_ALIASES: Record<string, PhosphorWeight> = {
  thin: "thin",
  light: "light",
  regular: "regular",
  solid: "regular",
  bold: "bold",
  fill: "fill",
  duotone: "duotone",
};

function resolveWeight(variant?: string, family?: string): PhosphorWeight {
  return (
    (variant && WEIGHT_ALIASES[variant]) ||
    (family && WEIGHT_ALIASES[family]) ||
    "regular"
  );
}

/**
 * Build a jsDelivr URL for a Phosphor icon.
 *
 * Regular-weight files are `{name}.svg`; every other weight suffixes the
 * weight, e.g. `{name}-fill.svg`.
 */
function phosphorUrl(name: string, weight: PhosphorWeight): string {
  const file = weight === "regular" ? `${name}.svg` : `${name}-${weight}.svg`;
  return `${CDN_BASE}/${weight}/${file}`;
}

/**
 * WebAwesome's internal `system` library names → Phosphor names.
 *
 * WebAwesome components (select carets, dialog close, checkbox check, media
 * controls, tree grips, …) request icons from the `system` library using
 * Font Awesome names. Phosphor uses different names for many of these, so we
 * translate. Names verified present in `@phosphor-icons/core`. Anything not
 * listed falls through to the requested name unchanged.
 */
const SYSTEM_NAME_MAP: Record<string, string> = {
  // Chevrons / carets
  "chevron-down": "caret-down",
  "chevron-left": "caret-left",
  "chevron-right": "caret-right",
  // Marks
  check: "check",
  xmark: "x",
  "circle-xmark": "x-circle",
  "circle-question": "question",
  minus: "minus",
  indeterminate: "minus",
  plus: "plus",
  circle: "circle",
  star: "star",
  // Layout / misc chrome
  compress: "arrows-in",
  expand: "arrows-out",
  "ellipsis-vertical": "dots-three-vertical",
  "grip-vertical": "dots-six-vertical",
  eyedropper: "eyedropper",
  eye: "eye",
  "eye-slash": "eye-slash",
  gauge: "gauge",
  gear: "gear",
  calendar: "calendar-blank",
  clock: "clock",
  copy: "copy",
  upload: "upload-simple",
  user: "user",
  // Media controls
  play: "play",
  "play-circle": "play-circle",
  pause: "pause",
  backward: "rewind",
  forward: "fast-forward",
  "backward-step": "skip-back",
  "forward-step": "skip-forward",
  "picture-in-picture": "picture-in-picture",
  "closed-captioning": "closed-captioning",
  "closed-captioning-slash": "closed-captioning",
  volume: "speaker-high",
  "volume-low": "speaker-low",
  "volume-xmark": "speaker-x",
  // File types
  file: "file",
  "file-audio": "file-audio",
  "file-code": "file-code",
  "file-excel": "file-xls",
  "file-image": "file-image",
  "file-pdf": "file-pdf",
  "file-powerpoint": "file-ppt",
  "file-video": "file-video",
  "file-word": "file-doc",
  "file-zipper": "file-zip",
};

/** Ensure the icon inherits the current text color (Phosphor SVGs already do). */
function mutator(svg: SVGElement): void {
  svg.setAttribute("fill", "currentColor");
}

let registered = false;

/**
 * Register Phosphor Icons as WebAwesome's `default` and `system` icon
 * libraries, replacing the Font Awesome defaults.
 *
 * Idempotent — safe to call multiple times (and it is called by
 * {@link registerAll}). Call it before the first `<wa-icon>` renders.
 *
 * @example
 * ```ts
 * import { registerPhosphorIcons } from "@drx-dls/webawesome";
 * registerPhosphorIcons();
 * // <wa-icon name="heart"></wa-icon>            → Phosphor regular
 * // <wa-icon name="heart" variant="fill"></wa-icon> → Phosphor fill
 * ```
 */
export function registerPhosphorIcons(): void {
  if (registered) return;
  registered = true;

  // User-facing icons: <wa-icon name="..."> uses the "default" library.
  registerIconLibrary("default", {
    resolver: (name, family, variant) =>
      phosphorUrl(name, resolveWeight(variant, family)),
    mutator,
  });

  // Internal component chrome (carets, close buttons, checks, media, …).
  registerIconLibrary("system", {
    resolver: (name, family, variant) =>
      phosphorUrl(SYSTEM_NAME_MAP[name] ?? name, resolveWeight(variant, family)),
    mutator,
  });
}

/** Alias for {@link registerPhosphorIcons}. */
export const registerIcons = registerPhosphorIcons;
