import { createContext } from "react";
import type { ColorScheme } from "@drx-dls/webawesome";

/**
 * The preview color scheme the designer is currently evaluating (DRI-91). This
 * is UI state — NOT part of Identity — because the DRX palette is
 * mode-independent (WebAwesome's semantic layer maps the 11-tint ramp to
 * light/dark roles).
 *
 * `scheme` is the user's choice (`light`/`dark`/`auto`); `resolvedDark` is the
 * effective boolean after resolving `auto` against `prefers-color-scheme`.
 *
 * Why this is lifted into context (DRI-91): WebAwesome declares its semantic
 * role tokens (`--wa-color-brand-fill-loud: var(--wa-color-brand-50)`) and
 * scale-derived tokens (`--wa-space-m: calc(var(--wa-space-scale) * 1rem)`) on
 * the element carrying the color-scheme class (`.wa-light`/`.wa-dark`). Those
 * `var()`/`calc()` expressions resolve against that same element's inputs. Our
 * live preview overrides the *input* tokens (palette tints, scale knobs) scoped
 * to the preview root, so the scheme class must sit on that same root for the
 * derived tokens to recompute from the scoped inputs. `App` therefore needs the
 * resolved scheme to put the class on the preview `<main>`.
 */
export interface ColorSchemeContextValue {
  scheme: ColorScheme;
  resolvedDark: boolean;
  setScheme: (scheme: ColorScheme) => void;
}

export const ColorSchemeContext = createContext<ColorSchemeContextValue | null>(
  null,
);
