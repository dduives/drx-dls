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

/** CSS font-family stack for a custom family loaded via Google Fonts. */
function familyStack(family: string): string {
  return `'${family}', sans-serif`;
}

/**
 * Font-family pickers for heading / body / code (DRI-95). Heading leads the
 * panel (DRI-110), then body, then code. Each slot is a dropdown of curated
 * defaults (incl. Inter) plus any family loaded from a Google Fonts URL, with a
 * "Custom…" option (DRI-108) that reveals a single URL field: paste a
 * `fonts.googleapis.com` stylesheet link and the family is parsed out, loaded
 * into the preview (via the emitted `@import`), and registered as selectable.
 * One custom font at a time — a new URL replaces the previous one.
 */
export function TypographyControls() {
  const { identity, setFontFamily, setCustomFontUrl } = useThemeInputs();

  // Families registered via the current custom-font URL become selectable.
  const customFamilies = (() => {
    if (!identity.customFontUrl) return [];
    const parsed = parseGoogleFontUrl(identity.customFontUrl);
    return parsed.ok ? parsed.value.families : [];
  })();
  const customOptions = customFamilies.map((family) => ({
    label: family,
    value: familyStack(family),
  }));

  const allOptions = [...DEFAULT_FONTS, ...customOptions];

  // Per-slot UI state: which slots are in "paste a URL" mode, the draft URL,
  // and any inline validation error.
  const [customSlots, setCustomSlots] = useState<Partial<Record<Slot, boolean>>>(
    {},
  );
  const [urlDrafts, setUrlDrafts] = useState<Partial<Record<Slot, string>>>({});
  const [errors, setErrors] = useState<Partial<Record<Slot, string | null>>>({});

  const openCustom = (kind: Slot) => {
    setCustomSlots((prev) => ({ ...prev, [kind]: true }));
    setUrlDrafts((prev) => ({ ...prev, [kind]: identity.customFontUrl ?? "" }));
    setErrors((prev) => ({ ...prev, [kind]: null }));
  };

  const loadFont = (kind: Slot) => {
    const draft = (urlDrafts[kind] ?? "").trim();
    const parsed = parseGoogleFontUrl(draft);
    if (!parsed.ok) {
      setErrors((prev) => ({ ...prev, [kind]: parsed.error }));
      return;
    }
    setCustomFontUrl(draft);
    setFontFamily(kind, familyStack(parsed.value.families[0]!));
    setErrors((prev) => ({ ...prev, [kind]: null }));
    setCustomSlots((prev) => ({ ...prev, [kind]: false }));
  };

  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold text-neutral-700">Typography</h3>
      <ul className="space-y-1.5">
        {SLOTS.map(({ kind, label }) => {
          const current = identity.fontFamily[kind];
          const matched = allOptions.some((o) => o.value === current);
          const isCustom = customSlots[kind] === true;
          const selectValue = matched && !isCustom ? current : CUSTOM_VALUE;
          const error = errors[kind];

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
                    openCustom(kind);
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
                <div className="space-y-1">
                  <input
                    type="url"
                    value={urlDrafts[kind] ?? ""}
                    onChange={(e) => {
                      const next = e.target.value;
                      setUrlDrafts((prev) => ({ ...prev, [kind]: next }));
                      if (error) setErrors((prev) => ({ ...prev, [kind]: null }));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") loadFont(kind);
                    }}
                    placeholder="https://fonts.googleapis.com/css2?family=…"
                    aria-label={`${label} Google Fonts URL`}
                    className="w-full rounded border border-neutral-200 px-1.5 py-1 text-xs"
                  />
                  {error && <p className="text-xs text-red-600">{error}</p>}
                  <button
                    type="button"
                    onClick={() => loadFont(kind)}
                    className="w-full rounded bg-neutral-800 px-2 py-1 text-xs font-medium text-white hover:bg-neutral-700"
                  >
                    Load font
                  </button>
                  <p className="text-[11px] text-neutral-400">
                    Paste a Google Fonts stylesheet URL. The family loads in the
                    preview and becomes selectable above.
                  </p>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
