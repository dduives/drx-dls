import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { ColorScheme } from "@drx-dls/webawesome";
import { getColorScheme, setColorScheme } from "@drx-dls/webawesome/theme";
import {
  ColorSchemeContext,
  type ColorSchemeContextValue,
} from "./colorSchemeContext";

const DARK_QUERY = "(prefers-color-scheme: dark)";

function resolveDark(scheme: ColorScheme): boolean {
  if (scheme === "auto") {
    return (
      typeof window !== "undefined" && window.matchMedia(DARK_QUERY).matches
    );
  }
  return scheme === "dark";
}

/**
 * Owns the preview color-scheme UI state (DRI-91), seeded from the current
 * WebAwesome scheme. Provided high in the tree (around `App`) so both
 * `ModeToggle` (writer) and the preview pane in `App` (reader — it stamps the
 * resolved `.wa-light`/`.wa-dark` class onto the preview root) share one source
 * of truth.
 *
 * It also keeps `@drx-dls/webawesome`'s `<html>` classes in sync via
 * `setColorScheme`, preserving the prior global behavior for the Studio chrome,
 * and tracks `prefers-color-scheme` changes while in `auto`.
 */
export function ColorSchemeProvider({ children }: { children: ReactNode }) {
  const [scheme, setScheme] = useState<ColorScheme>(() => getColorScheme());
  const [resolvedDark, setResolvedDark] = useState<boolean>(() =>
    resolveDark(scheme),
  );

  useEffect(() => {
    // Keep WebAwesome's global <html> class in sync (chrome components).
    setColorScheme(scheme);
    setResolvedDark(resolveDark(scheme));

    if (scheme !== "auto") return;

    // Track system preference while following `auto`.
    const mql = window.matchMedia(DARK_QUERY);
    const onChange = (e: MediaQueryListEvent) => setResolvedDark(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [scheme]);

  const value = useMemo<ColorSchemeContextValue>(
    () => ({ scheme, resolvedDark, setScheme }),
    [scheme, resolvedDark],
  );

  return (
    <ColorSchemeContext.Provider value={value}>
      {children}
    </ColorSchemeContext.Provider>
  );
}
