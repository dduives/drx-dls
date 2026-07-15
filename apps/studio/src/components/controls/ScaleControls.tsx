import type { ScaleKnobs } from "@drx-dls/tokens";
import { useThemeInputs } from "../../state/useThemeInputs.ts";
import { useDevice } from "../../state/useDevice.ts";

// Labelled by function (following WebAwesome's own theme builder), each with a
// one-line hint clarifying that the knob scales the whole token scale
// proportionally. See DRI-106.
const KNOBS: { key: keyof ScaleKnobs; label: string; hint: string }[] = [
  {
    key: "radiusScale",
    label: "Roundness",
    hint: "Scales every corner radius proportionally.",
  },
  {
    key: "spaceScale",
    label: "Spacing",
    hint: "Scales all spacing tokens proportionally.",
  },
  {
    key: "fontSizeScale",
    label: "Type scale",
    hint: "Scales the whole type scale proportionally.",
  },
  {
    key: "borderWidthScale",
    label: "Border width",
    hint: "Scales all border widths proportionally.",
  },
];

// These are multipliers centered on 1.0 (base.tokens.json neutral default).
// 0.5–2.0 covers half → double at a fine 0.05 step for smooth preview tuning.
const MIN = 0.5;
const MAX = 2;
const STEP = 0.05;

/**
 * Sliders for the four scale knobs, device-aware (DRI-54). The palette and
 * typography identity is shared across devices — only these scale knobs vary:
 *   - active device = **web** -> edit the top-level global knobs
 *     (`identity.radiusScale` etc) via `updateIdentity`. This is the web
 *     baseline; ios/tvos multipliers compose on top of it.
 *   - active device = ios or tvos -> edit the per-device multiplier at
 *     `identity.devices[device].<knob>` via `setDeviceScale`.
 * Each knob maps 1:1 onto a WebAwesome --wa-*-scale token.
 */
export function ScaleControls() {
  const { identity, updateIdentity, setDeviceScale } = useThemeInputs();
  const { device } = useDevice();
  const isWeb = device === "web";

  const heading = isWeb ? "Scale — Web (global)" : `Scale — ${device}`;
  const hint = isWeb
    ? "Global baseline knobs, shared as the web scale."
    : "Per-device multiplier over the web baseline.";

  return (
    <section className="space-y-2">
      <div>
        <h3 className="text-xs font-semibold text-neutral-700">{heading}</h3>
        <p className="text-[11px] text-neutral-400">{hint}</p>
      </div>
      <ul className="space-y-2">
        {KNOBS.map(({ key, label, hint: knobHint }) => {
          const value = isWeb ? identity[key] : identity.devices[device][key];
          return (
            <li key={key} className="space-y-0.5">
              <div className="flex items-center justify-between text-xs text-neutral-700">
                <span>{label}</span>
                <span className="font-mono text-neutral-500">
                  ×{value.toFixed(2)}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">{knobHint}</p>
              <input
                type="range"
                min={MIN}
                max={MAX}
                step={STEP}
                value={value}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  if (isWeb) {
                    updateIdentity({ [key]: next });
                  } else {
                    setDeviceScale(device, { [key]: next });
                  }
                }}
                aria-label={`${label} scale (${device})`}
                className="w-full cursor-pointer accent-neutral-700"
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
