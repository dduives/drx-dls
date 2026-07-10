import { useState } from "react";
import type { ColorScheme } from "@drx-dls/webawesome";
import { getColorScheme, setColorScheme } from "@drx-dls/webawesome";

const MODES: ColorScheme[] = ["light", "dark", "auto"];

/**
 * Preview-only light/dark/auto toggle. Delegates to `setColorScheme` from
 * @drx-dls/webawesome (toggles `.wa-dark`/`.wa-light` on <html>). Mode is NOT
 * part of Identity — the palette is mode-independent — so it's tracked in
 * local state only, seeded from the current scheme.
 */
export function ModeToggle() {
  const [mode, setMode] = useState<ColorScheme>(() => getColorScheme());

  const select = (next: ColorScheme) => {
    setColorScheme(next);
    setMode(next);
  };

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
          onClick={() => select(m)}
          className={
            "px-2 py-1 capitalize " +
            (mode === m
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
