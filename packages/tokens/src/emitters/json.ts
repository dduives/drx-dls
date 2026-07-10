import type { ResolvedTheme } from "../types.js";

/** Emit the fully resolved theme as pretty JSON (for any consumer / debugging). */
export function emitJson(theme: ResolvedTheme): string {
  return JSON.stringify(theme, null, 2) + "\n";
}
