import type { ColorScheme } from "./types.js";

// ---------------------------------------------------------------------------
// Theme injection
// ---------------------------------------------------------------------------

const THEME_STYLE_ID = "drx-wa-theme";

/**
 * Inject a DRX theme into the document.
 *
 * @param source - Either a CSS string (containing `--wa-` custom properties)
 *                 or a URL / path to a `.css` file.
 *
 * @example
 * ```ts
 * // Inline CSS (e.g. from a bundler import)
 * import themeCSS from "@drx-dls/tokens/theme.css?raw";
 * applyTheme(themeCSS);
 *
 * // Or load from a URL
 * applyTheme("/assets/theme.css");
 * ```
 */
export function applyTheme(source: string): void {
  // Remove any previously injected theme
  document.getElementById(THEME_STYLE_ID)?.remove();

  const isURL =
    source.trimStart().startsWith("http") ||
    source.trimStart().startsWith("/") ||
    source.trimStart().startsWith("./");

  if (isURL) {
    const link = document.createElement("link");
    link.id = THEME_STYLE_ID;
    link.rel = "stylesheet";
    link.href = source.trim();
    document.head.appendChild(link);
  } else {
    const style = document.createElement("style");
    style.id = THEME_STYLE_ID;
    style.textContent = source;
    document.head.appendChild(style);
  }
}

// ---------------------------------------------------------------------------
// Color scheme (light / dark / auto)
// ---------------------------------------------------------------------------

let currentScheme: ColorScheme = "auto";
let mediaQuery: MediaQueryList | null = null;
let mediaHandler: ((e: MediaQueryListEvent) => void) | null = null;

function applyDarkClass(dark: boolean): void {
  const { classList } = document.documentElement;
  classList.toggle("wa-dark", dark);
  classList.toggle("wa-light", !dark);
}

function cleanupAutoListener(): void {
  if (mediaQuery && mediaHandler) {
    mediaQuery.removeEventListener("change", mediaHandler);
    mediaQuery = null;
    mediaHandler = null;
  }
}

/**
 * Set the color scheme for all WebAwesome components.
 *
 * - `"light"` — force light mode (removes `.wa-dark`, adds `.wa-light`)
 * - `"dark"`  — force dark mode  (adds `.wa-dark`, removes `.wa-light`)
 * - `"auto"`  — follow `prefers-color-scheme` media query
 */
export function setColorScheme(mode: ColorScheme): void {
  currentScheme = mode;
  cleanupAutoListener();

  if (mode === "auto") {
    mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    applyDarkClass(mediaQuery.matches);
    mediaHandler = (e) => applyDarkClass(e.matches);
    mediaQuery.addEventListener("change", mediaHandler);
  } else {
    applyDarkClass(mode === "dark");
  }
}

/** Return the currently active color scheme setting. */
export function getColorScheme(): ColorScheme {
  return currentScheme;
}
