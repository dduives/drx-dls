import { useContext } from "react";
import {
  ColorSchemeContext,
  type ColorSchemeContextValue,
} from "./colorSchemeContext";

/**
 * Read the preview color scheme + setter. Must be used within a
 * `<ColorSchemeProvider>`.
 */
export function useColorScheme(): ColorSchemeContextValue {
  const ctx = useContext(ColorSchemeContext);
  if (!ctx) {
    throw new Error(
      "useColorScheme must be used within a <ColorSchemeProvider>",
    );
  }
  return ctx;
}
