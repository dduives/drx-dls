import type { ScaleKnobs } from "@drx-dls/tokens";
import { useThemeInputs } from "../../state/useThemeInputs.ts";

const KNOBS: { key: keyof ScaleKnobs; label: string }[] = [
  { key: "radiusScale", label: "Radius" },
  { key: "spaceScale", label: "Spacing" },
  { key: "fontSizeScale", label: "Font size" },
  { key: "borderWidthScale", label: "Border width" },
];

// These are multipliers centered on 1.0 (base.tokens.json neutral default).
// 0.5–2.0 covers half → double at a fine 0.05 step for smooth preview tuning.
const MIN = 0.5;
const MAX = 2;
const STEP = 0.05;

/**
 * Sliders for the four global scale knobs. Each maps 1:1 onto a WebAwesome
 * --wa-*-scale token; written through `updateIdentity`.
 */
export function ScaleControls() {
  const { identity, updateIdentity } = useThemeInputs();

  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold text-neutral-700">Scale</h3>
      <ul className="space-y-2">
        {KNOBS.map(({ key, label }) => {
          const value = identity[key];
          return (
            <li key={key} className="space-y-0.5">
              <div className="flex items-center justify-between text-xs text-neutral-700">
                <span>{label}</span>
                <span className="font-mono text-neutral-500">
                  {value.toFixed(2)}×
                </span>
              </div>
              <input
                type="range"
                min={MIN}
                max={MAX}
                step={STEP}
                value={value}
                onChange={(e) =>
                  updateIdentity({ [key]: Number(e.target.value) })
                }
                aria-label={`${label} scale`}
                className="w-full cursor-pointer accent-neutral-700"
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
