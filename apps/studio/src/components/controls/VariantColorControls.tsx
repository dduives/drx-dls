import { useMemo, useState } from "react";
import type { VariantName } from "@drx-dls/tokens";
import { formatOklch, generateTheme, tintLabel } from "@drx-dls/tokens";
import { useThemeInputs } from "../../state/useThemeInputs.ts";

const VARIANTS: { name: VariantName; label: string }[] = [
  { name: "brand", label: "Brand" },
  { name: "neutral", label: "Neutral" },
  { name: "success", label: "Success" },
  { name: "warning", label: "Warning" },
  { name: "danger", label: "Danger" },
];

/**
 * Short semantic hint per WebAwesome tint step (95 = lightest → 05 = darkest).
 * Advisory labels that mirror how WA's semantic layer tends to consume the ramp
 * (subtle backgrounds at the light end, borders in the middle, solid fills and
 * text at the dark end). Not authoritative — purely to orient the user.
 */
const TINT_HINTS: Record<number, string> = {
  95: "subtle bg",
  90: "bg",
  80: "hover bg",
  70: "border",
  60: "strong border",
  50: "mid",
  40: "solid fill",
  30: "solid hover",
  20: "text on fill",
  10: "text",
  5: "strong text",
};

type Selected = { variant: VariantName; tint: number };

/**
 * Palette editor (DRI-99). Per variant: the prominent base-hex input plus the
 * full numbered ramp as clickable swatches (WA's canonical 95→05 step numbers,
 * each with a semantic hint). Selecting a swatch reveals its hex + OKLCH and an
 * advanced per-step pin/override (an escape hatch over the OKLCH generation).
 * The ramp is the same one `generateTheme` derives for the live preview, so
 * pinned steps and base-color edits are reflected immediately.
 */
export function VariantColorControls() {
  const { identity, setVariantColor, setPaletteOverride, clearPaletteOverride } =
    useThemeInputs();
  const [selected, setSelected] = useState<Selected | null>(null);

  // Same derivation the preview uses — reflects base color + pinned steps.
  const palette = useMemo(() => generateTheme(identity).palette, [identity]);

  const selectedEntry =
    selected && palette[selected.variant].find((s) => s.tint === selected.tint);
  const isPinned = (variant: VariantName, tint: number) =>
    identity.paletteOverrides[variant]?.[tint] !== undefined;

  return (
    <section className="space-y-3">
      <h3 className="text-xs font-semibold text-neutral-700">Colors</h3>
      <ul className="space-y-3">
        {VARIANTS.map(({ name, label }) => {
          const hex = identity.variants[name];
          const scale = palette[name];
          return (
            <li key={name} className="space-y-1.5">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={hex}
                  onChange={(e) => setVariantColor(name, e.target.value)}
                  aria-label={`${label} base color`}
                  className="h-7 w-9 shrink-0 cursor-pointer rounded border border-neutral-200 bg-white p-0.5"
                />
                <span className="flex-1 text-xs font-medium text-neutral-700">
                  {label}
                </span>
                <input
                  type="text"
                  value={hex}
                  onChange={(e) => setVariantColor(name, e.target.value)}
                  aria-label={`${label} base color hex`}
                  className="w-20 rounded border border-neutral-200 px-1.5 py-1 font-mono text-xs"
                />
              </div>

              {/* Numbered ramp: one clickable swatch per tint step, 95 → 05. */}
              <div
                className="flex gap-0.5"
                role="group"
                aria-label={`${label} palette ramp`}
              >
                {scale.map(({ tint, hex: tintHex }) => {
                  const active =
                    selected?.variant === name && selected.tint === tint;
                  const pinned = isPinned(name, tint);
                  return (
                    <button
                      key={tint}
                      type="button"
                      onClick={() =>
                        setSelected(active ? null : { variant: name, tint })
                      }
                      title={`${tintLabel(tint)} · ${TINT_HINTS[tint] ?? ""}${pinned ? " · pinned" : ""}\n${tintHex}`}
                      aria-label={`${label} tint ${tintLabel(tint)}${pinned ? ", pinned" : ""}`}
                      aria-pressed={active}
                      className={`relative flex h-8 flex-1 flex-col items-center justify-end rounded-sm border text-[8px] leading-none ${
                        active
                          ? "border-neutral-900 ring-1 ring-neutral-900"
                          : "border-neutral-200"
                      }`}
                      style={{ backgroundColor: tintHex }}
                    >
                      {pinned && (
                        <span
                          aria-hidden
                          className="absolute right-0.5 top-0.5 h-1 w-1 rounded-full bg-white shadow ring-1 ring-neutral-900"
                        />
                      )}
                      <span className="mb-0.5 rounded-sm bg-white/80 px-0.5 font-mono text-neutral-800">
                        {tintLabel(tint)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Per-step detail + pin/override, shown when a swatch is active. */}
              {selected?.variant === name && selectedEntry && (
                <div className="space-y-1.5 rounded border border-neutral-200 bg-neutral-50 p-2">
                  <div className="flex items-center justify-between text-[11px] text-neutral-700">
                    <span className="font-mono font-semibold">
                      {name}-{tintLabel(selected.tint)}
                    </span>
                    <span className="text-neutral-500">
                      {TINT_HINTS[selected.tint] ?? ""}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5 font-mono text-[11px] text-neutral-600">
                    <span>{selectedEntry.hex}</span>
                    <span>{formatOklch(selectedEntry.hex)}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-0.5">
                    <input
                      type="color"
                      value={
                        /^#[0-9a-fA-F]{6}$/.test(selectedEntry.hex)
                          ? selectedEntry.hex
                          : "#000000"
                      }
                      onChange={(e) =>
                        setPaletteOverride(name, selected.tint, e.target.value)
                      }
                      aria-label={`Pin ${name} tint ${tintLabel(selected.tint)}`}
                      className="h-7 w-9 shrink-0 cursor-pointer rounded border border-neutral-200 bg-white p-0.5"
                    />
                    <span className="flex-1 text-[11px] text-neutral-600">
                      {isPinned(name, selected.tint)
                        ? "Pinned override"
                        : "Pin this step"}
                    </span>
                    {isPinned(name, selected.tint) && (
                      <button
                        type="button"
                        onClick={() => clearPaletteOverride(name, selected.tint)}
                        className="rounded bg-neutral-200 px-1.5 py-0.5 text-[11px] text-neutral-700 hover:bg-neutral-300"
                      >
                        Reset step
                      </button>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
