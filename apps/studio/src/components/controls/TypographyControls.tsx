import { useState } from "react";
import type { Identity } from "@drx-dls/tokens";
import { useThemeInputs } from "../../state/useThemeInputs.ts";

const SLOTS: { kind: keyof Identity["fontFamily"]; label: string }[] = [
  { kind: "heading", label: "Heading" },
  { kind: "body", label: "Body" },
  { kind: "code", label: "Code" },
];

// Curated default font stacks. "System UI" and "Monospace" match the
// base.tokens.json defaults exactly so a fresh project maps to a named option
// rather than falling through to "Custom".
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

const CUSTOM_VALUE = "__custom__";

/**
 * Font-family pickers for heading / body / code (DRI-95). Heading leads the
 * panel (DRI-110), then body, then code. Each slot is a dropdown of curated
 * defaults (incl. Inter) plus any custom `@font-face` families added in the
 * FontFacesEditor (DRI-92), with a "Custom…" escape hatch that reveals a
 * free-text field for an arbitrary CSS font-family stack.
 */
export function TypographyControls() {
  const { identity, setFontFamily } = useThemeInputs();

  // Custom families registered via the font-faces editor become selectable.
  const customFamilies = Array.from(
    new Set(
      identity.fontFaces
        .map((f) => f.family.trim())
        .filter((family) => family.length > 0),
    ),
  );
  const customOptions = customFamilies.map((family) => ({
    label: family,
    value: `'${family}', sans-serif`,
  }));

  const allOptions = [...DEFAULT_FONTS, ...customOptions];

  // Track which slots the user has explicitly put into free-text mode.
  const [customSlots, setCustomSlots] = useState<
    Partial<Record<keyof Identity["fontFamily"], boolean>>
  >({});

  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold text-neutral-700">Typography</h3>
      <ul className="space-y-1.5">
        {SLOTS.map(({ kind, label }) => {
          const current = identity.fontFamily[kind];
          const matched = allOptions.some((o) => o.value === current);
          const isCustom = customSlots[kind] ?? !matched;
          const selectValue = isCustom ? CUSTOM_VALUE : current;

          return (
            <li key={kind} className="space-y-0.5">
              <label className="text-xs text-neutral-700" htmlFor={`ff-${kind}`}>
                {label}
              </label>
              <select
                id={`ff-${kind}`}
                value={selectValue}
                onChange={(e) => {
                  const next = e.target.value;
                  if (next === CUSTOM_VALUE) {
                    setCustomSlots((prev) => ({ ...prev, [kind]: true }));
                    return;
                  }
                  setCustomSlots((prev) => ({ ...prev, [kind]: false }));
                  setFontFamily(kind, next);
                }}
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
                  <optgroup label="Custom fonts">
                    {customOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </optgroup>
                )}
                <option value={CUSTOM_VALUE}>Custom…</option>
              </select>
              {isCustom && (
                <input
                  type="text"
                  value={current}
                  onChange={(e) => setFontFamily(kind, e.target.value)}
                  placeholder="font-family stack"
                  aria-label={`${label} custom font-family stack`}
                  className="w-full rounded border border-neutral-200 px-1.5 py-1 text-xs"
                />
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
