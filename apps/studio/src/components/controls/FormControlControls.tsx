import type { FormControlTokens, VariantName } from "@drx-dls/tokens";
import { tintLabel } from "@drx-dls/tokens";
import { useThemeInputs } from "../../state/useThemeInputs.ts";

const VARIANTS: VariantName[] = [
  "brand",
  "neutral",
  "success",
  "warning",
  "danger",
];

// Tint steps per the token model, light → dark. tintLabel() pads to 2 digits
// so tint 5 encodes as "05" (matches base.tokens.json's "neutral-70" form).
const TINTS = [95, 90, 80, 70, 60, 50, 40, 30, 20, 10, 5];

// `variant-tint` reference, e.g. "neutral-70" / "brand-05".
const TINT_REF = /^([a-z]+)-(\d{1,2})$/;

const TEXT_FIELDS: { key: keyof FormControlTokens; label: string }[] = [
  { key: "paddingBlock", label: "Padding block" },
  { key: "paddingInline", label: "Padding inline" },
  { key: "borderWidth", label: "Border width" },
  { key: "borderRadius", label: "Border radius" },
];

const BORDER_STYLES = ["solid", "dashed", "dotted", "double", "none"];

/**
 * Border-color picker. Values are either a `variant-tint` palette reference
 * (variant dropdown × tint dropdown, e.g. "neutral-70") or a raw `#rrggbb`
 * hex. A mode toggle switches between the two encodings.
 */
function BorderColorControl() {
  const { identity, setFormControl } = useThemeInputs();
  const value = identity.formControl.borderColor;
  const match = TINT_REF.exec(value);
  const isHex = value.startsWith("#");
  // Treat anything that isn't a valid `variant-tint` ref as hex mode.
  const isRef = !isHex && match !== null;

  const variant = (isRef ? (match![1] as VariantName) : "neutral") as VariantName;
  const tint = isRef ? Number(match![2]) : 70;

  const setRef = (v: VariantName, t: number) => {
    setFormControl({ borderColor: `${v}-${tintLabel(t)}` });
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-700">Border color</span>
        <button
          type="button"
          onClick={() =>
            setFormControl({
              borderColor: isRef ? "#71717a" : `${variant}-${tintLabel(tint)}`,
            })
          }
          className="rounded bg-neutral-200 px-1.5 py-0.5 text-[11px] text-neutral-700 hover:bg-neutral-300"
        >
          {isRef ? "Use hex" : "Use palette"}
        </button>
      </div>
      {isRef ? (
        <div className="flex gap-1">
          <select
            value={variant}
            onChange={(e) => setRef(e.target.value as VariantName, tint)}
            aria-label="Border color variant"
            className="flex-1 rounded border border-neutral-200 px-1 py-1 text-xs"
          >
            {VARIANTS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          <select
            value={tint}
            onChange={(e) => setRef(variant, Number(e.target.value))}
            aria-label="Border color tint"
            className="w-20 rounded border border-neutral-200 px-1 py-1 text-xs"
          >
            {TINTS.map((t) => (
              <option key={t} value={t}>
                {tintLabel(t)}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#71717a"}
            onChange={(e) => setFormControl({ borderColor: e.target.value })}
            aria-label="Border color hex"
            className="h-7 w-9 shrink-0 cursor-pointer rounded border border-neutral-200 bg-white p-0.5"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => setFormControl({ borderColor: e.target.value })}
            aria-label="Border color hex value"
            className="w-full rounded border border-neutral-200 px-1.5 py-1 font-mono text-xs"
          />
        </div>
      )}
    </div>
  );
}

/**
 * "Form Controls" subsection — direct passthrough overrides for WebAwesome's
 * --wa-form-control-* token group (distinct from the global scale sliders).
 */
export function FormControlControls() {
  const { identity, setFormControl } = useThemeInputs();
  const fc = identity.formControl;

  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold text-neutral-700">Form Controls</h3>
      <ul className="space-y-1.5">
        {TEXT_FIELDS.map(({ key, label }) => (
          <li key={key} className="space-y-0.5">
            <label className="text-xs text-neutral-700" htmlFor={`fc-${key}`}>
              {label}
            </label>
            <input
              id={`fc-${key}`}
              type="text"
              value={fc[key]}
              onChange={(e) => setFormControl({ [key]: e.target.value })}
              placeholder="CSS value"
              className="w-full rounded border border-neutral-200 px-1.5 py-1 font-mono text-xs"
            />
          </li>
        ))}
        <li className="space-y-0.5">
          <label className="text-xs text-neutral-700" htmlFor="fc-borderStyle">
            Border style
          </label>
          <select
            id="fc-borderStyle"
            value={fc.borderStyle}
            onChange={(e) => setFormControl({ borderStyle: e.target.value })}
            className="w-full rounded border border-neutral-200 px-1 py-1 text-xs"
          >
            {BORDER_STYLES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </li>
        <li>
          <BorderColorControl />
        </li>
      </ul>
    </section>
  );
}
