import type { ColorScheme } from "@drx-dls/webawesome";
import { useColorScheme } from "../../state/useColorScheme.ts";

const MODES: ColorScheme[] = ["light", "dark", "auto"];

/**
 * Preview-only light/dark/auto toggle. Writes to the shared
 * `ColorSchemeProvider` (DRI-91), which keeps WebAwesome's `<html>` class in
 * sync and exposes the resolved scheme so `App` can stamp `.wa-light`/`.wa-dark`
 * onto the preview root (making WA recompute its derived tokens from the scoped
 * preview inputs). Mode is NOT part of Identity — the palette is
 * mode-independent.
 */
export function ModeToggle() {
  const { scheme, setScheme } = useColorScheme();

  return (
    <div
      role="group"
      aria-label="Preview color scheme"
      className="inline-flex overflow-hidden rounded border border-neutral-200 text-xs"
    >
      {MODES.map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => setScheme(m)}
          className={
            "px-2 py-1 capitalize " +
            (scheme === m
              ? "bg-neutral-800 text-white"
              : "bg-white text-neutral-600 hover:bg-neutral-100")
          }
        >
          {m}
        </button>
      ))}
    </div>
  );
}
