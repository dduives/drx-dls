import { useState } from "react";
import type { Identity } from "@drx-dls/tokens";
import { useThemeInputs } from "../../state/useThemeInputs.ts";
import { parseGoogleFontUrl } from "../../lib/parseGoogleFontUrl.ts";

type Slot = keyof Identity["fontFamily"];

const SLOTS: { kind: Slot; label: string }[] = [
  { kind: "heading", label: "Heading" },
  { kind: "body", label: "Body" },
  { kind: "code", label: "Code" },
];

// Curated default font stacks. "System UI" and "Monospace" match the
// base.tokens.json defaults exactly so a fresh project maps to a named option
// rather than falling through to a blank select.
const DEFAULT_FONTS: { label: string; value: string }[] = [
  { label: "Inter", value: "'Inter', ui-sans-serif, system-ui, sans-serif" },
  {
    label: "System UI",
    value: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  },
  { label: "Roboto", value: "'Roboto', ui-sans-serif, system-ui, sans-serif" },
  { label: "Helvetica / Arial", value: "'Helvetica Neue', Arial, sans-serif" },
  { label: "Georgia (serif)", value: "Georgia, 'Times New Roman', serif" },
  {
    label: "Monospace",
    value: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace",
  },
];

// The base default stack a slot falls back to when its custom font goes away.
const DEFAULT_STACK: Record<Slot, string> = {
  heading: DEFAULT_FONTS[1]!.value, // System UI
  body: DEFAULT_FONTS[1]!.value, // System UI
  code: DEFAULT_FONTS[5]!.value, // Monospace
};

/** CSS font-family stack for a custom family loaded via Google Fonts. */
function familyStack(family: string): string {
  return `'${family}', sans-serif`;
}

/** True for a stack produced by `familyStack` (a bare custom-font stack). */
function isCustomStack(value: string): boolean {
  return /^'[^']+', sans-serif$/.test(value);
}

/**
 * Font-family pickers for heading / body / code (DRI-95). Heading leads the
 * panel (DRI-110), then body, then code. Each slot is a plain dropdown of
 * curated defaults (incl. Inter) plus the family loaded from the single custom
 * font (DRI-108).
 *
 * Custom fonts use ONE shared control (not per-slot): paste a
 * `fonts.googleapis.com` stylesheet URL, load it once, then assign the parsed
 * family to any slot via the normal dropdowns. One custom font at a time — a
 * new URL replaces the previous one, and removing it clears it everywhere.
 */
export function TypographyControls() {
  const { identity, setFontFamily, setCustomFontUrl } = useThemeInputs();

  // The single custom font's parsed families become selectable in every slot.
  const customFamilies = (() => {
    if (!identity.customFontUrl) return [];
    const parsed = parseGoogleFontUrl(identity.customFontUrl);
    return parsed.ok ? parsed.value.families : [];
  })();
  const customOptions = customFamilies.map((family) => ({
    label: family,
    value: familyStack(family),
  }));
  const allValues = new Set([
    ...DEFAULT_FONTS.map((o) => o.value),
    ...customOptions.map((o) => o.value),
  ]);

  const [urlDraft, setUrlDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Reset any slot pointing at a custom-font stack that is no longer available
  // (its family isn't in `validValues`) back to that slot's default, so a slot
  // never dangles on a font that isn't loaded.
  const resetStaleSlots = (validValues: Set<string>) => {
    for (const { kind } of SLOTS) {
      const value = identity.fontFamily[kind];
      if (isCustomStack(value) && !validValues.has(value)) {
        setFontFamily(kind, DEFAULT_STACK[kind]);
      }
    }
  };

  const loadFont = () => {
    const draft = urlDraft.trim();
    const parsed = parseGoogleFontUrl(draft);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    // Replacing an existing custom font: drop any slot still using the old one.
    const nextValues = new Set([
      ...DEFAULT_FONTS.map((o) => o.value),
      ...parsed.value.families.map((f) => familyStack(f)),
    ]);
    resetStaleSlots(nextValues);
    setCustomFontUrl(draft);
    setUrlDraft("");
    setError(null);
  };

  const removeFont = () => {
    // Nothing but the defaults remain valid after removal.
    resetStaleSlots(new Set(DEFAULT_FONTS.map((o) => o.value)));
    setCustomFontUrl("");
    setUrlDraft("");
    setError(null);
  };

  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold text-neutral-700">Typography</h3>
      <ul className="space-y-1.5">
        {SLOTS.map(({ kind, label }) => {
          const current = identity.fontFamily[kind];
          const selectValue = allValues.has(current) ? current : "";

          return (
            <li key={kind} className="space-y-0.5">
              <label className="text-xs text-neutral-700" htmlFor={`ff-${kind}`}>
                {label}
              </label>
              <select
                id={`ff-${kind}`}
                value={selectValue}
                onChange={(e) => setFontFamily(kind, e.target.value)}
                className="w-full rounded border border-neutral-200 bg-white px-1.5 py-1 text-xs"
              >
                <optgroup label="Defaults">
                  {DEFAULT_FONTS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </optgroup>
                {customOptions.length > 0 && (
                  <optgroup label="Custom font">
                    {customOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </li>
          );
        })}
      </ul>

      <div className="space-y-1 border-t border-neutral-100 pt-2">
        <p className="text-xs font-medium text-neutral-700">Custom font</p>
        {customOptions.length > 0 && (
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-xs text-neutral-600">
              Loaded: {customFamilies.join(", ")}
            </span>
            <button
              type="button"
              onClick={removeFont}
              className="shrink-0 rounded border border-neutral-200 px-2 py-0.5 text-[11px] text-neutral-600 hover:bg-neutral-50"
            >
              Remove
            </button>
          </div>
        )}
        <input
          type="url"
          value={urlDraft}
          onChange={(e) => {
            setUrlDraft(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") loadFont();
          }}
          placeholder="https://fonts.googleapis.com/css2?family=…"
          aria-label="Custom font Google Fonts URL"
          className="w-full rounded border border-neutral-200 px-1.5 py-1 text-xs"
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button
          type="button"
          onClick={loadFont}
          className="w-full rounded bg-neutral-800 px-2 py-1 text-xs font-medium text-white hover:bg-neutral-700"
        >
          Load font
        </button>
        <p className="text-[11px] text-neutral-400">
          Paste a Google Fonts stylesheet URL, then pick the loaded family in any
          dropdown above. One custom font at a time — a new URL replaces it.
        </p>
      </div>
    </section>
  );
}
