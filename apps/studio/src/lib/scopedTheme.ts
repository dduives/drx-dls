import { emitCss, generateTheme, type Identity } from "@drx-dls/tokens";

/**
 * The scope root selector + stable style element id shared by the live
 * preview. `data-drx-preview` lives on the SAME element that DRI-54's platform
 * toggle sets `data-device` on, so device blocks scope correctly (see below).
 */
export const PREVIEW_SCOPE_ATTR = "data-drx-preview";
export const PREVIEW_SCOPE_SELECTOR = `[${PREVIEW_SCOPE_ATTR}]`;
export const PREVIEW_STYLE_ID = "drx-preview-theme";

/**
 * Rewrite the (well-formed, known) CSS emitted by `emitCss` so its theme vars
 * apply only inside the preview pane instead of globally.
 *
 * `emitCss` emits, in order: a leading comment, optional `@font-face` rules,
 * a `:root { … }` block, then `[data-device="ios"] { … }` /
 * `[data-device="tvos"] { … }` blocks. We:
 *   - rewrite the top-level `:root {` to `${scope} {` (scope the vars), and
 *   - prefix each `[data-device="…"] {` with `${scope}` so the device overrides
 *     apply when `data-device` is set on the scope root itself
 *     (`${scope}[data-device="ios"] { … }`).
 *
 * `@font-face` rules are left untouched — they must stay at the top level
 * (`@font-face` cannot be nested under a selector). The transform is a targeted
 * replace keyed on the exact block-start prefixes `emitCss` produces; those
 * prefixes only occur at block starts in the generated output, so this is safe.
 */
export function scopeThemeCss(css: string, scopeSelector: string): string {
  return css
    .replace(/^:root \{/m, `${scopeSelector} {`)
    .replace(
      /^\[data-device="(ios|tvos)"\] \{/gm,
      `${scopeSelector}[data-device="$1"] {`,
    );
}

/**
 * Pure end-to-end helper: `identity` → resolved theme → CSS → preview-scoped
 * CSS. Uses the same `generateTheme`/`emitCss` as the CLI (no forked copy).
 * Kept pure/side-effect-free for unit testing (DRI-64).
 */
export function buildScopedThemeCss(
  identity: Identity,
  scopeSelector: string = PREVIEW_SCOPE_SELECTOR,
): string {
  return scopeThemeCss(emitCss(generateTheme(identity)), scopeSelector);
}
