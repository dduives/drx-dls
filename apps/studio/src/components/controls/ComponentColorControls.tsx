import type { ComponentColorTokens, VariantName } from "@drx-dls/tokens";
import { tintLabel } from "@drx-dls/tokens";
import { useThemeInputs } from "../../state/useThemeInputs.ts";

const VARIANTS: VariantName[] = [
  "brand",
  "neutral",
  "success",
  "warning",
  "danger",
];

// Tint steps per the token model, light → dark. tintLabel() pads to 2 digits.
const TINTS = [95, 90, 80, 70, 60, 50, 40, 30, 20, 10, 5];

// `variant-tint` reference, e.g. "brand-40" / "neutral-05".
const TINT_REF = /^([a-z]+)-(\d{1,2})$/;

const FIELDS: {
  key: keyof ComponentColorTokens;
  label: string;
  defaultRef: string;
  hint: string;
}[] = [
  {
    key: "badgeBackground",
    label: "Badge background",
    defaultRef: "brand-40",
    hint: "WA default: per-variant loud fill",
  },
  {
    key: "formControlBackground",
    label: "Form control background",
    defaultRef: "neutral-95",
    hint: "WA default: surface",
  },
];

/**
 * A color reference control for an OPTIONAL override (DRI-100). Value is either
 * a `variant-tint` palette reference (variant × tint dropdowns, e.g. "brand-40")
 * or a raw `#rrggbb` hex. When unset, the field shows an "Add override" affordance
 * and the emitter keeps WebAwesome's default. Sourced from the palette so it
 * respects the numbered ramp (no hardcoded hex unless the user chooses hex mode).
 */
function ColorRefField({
  label,
  hint,
  value,
  defaultRef,
  onChange,
  onClear,
}: {
  label: string;
  hint: string;
  value: string | undefined;
  defaultRef: string;
  onChange: (v: string) => void;
  onClear: () => void;
}) {
  const isSet = value !== undefined && value !== "";

  if (!isSet) {
    return (
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs text-neutral-700">{label}</span>
          <span className="text-[11px] text-neutral-400">{hint}</span>
        </div>
        <button
          type="button"
          onClick={() => onChange(defaultRef)}
          className="rounded bg-neutral-200 px-1.5 py-0.5 text-[11px] text-neutral-700 hover:bg-neutral-300"
        >
          Add override
        </button>
      </div>
    );
  }

  const match = TINT_REF.exec(value);
  const isHex = value.startsWith("#");
  const isRef = !isHex && match !== null;
  const variant = (isRef ? (match![1] as VariantName) : "brand") as VariantName;
  const tint = isRef ? Number(match![2]) : 40;

  const setRef = (v: VariantName, t: number) => onChange(`${v}-${tintLabel(t)}`);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-700">{label}</span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() =>
              onChange(isRef ? "#3b82f6" : `${variant}-${tintLabel(tint)}`)
            }
            className="rounded bg-neutral-200 px-1.5 py-0.5 text-[11px] text-neutral-700 hover:bg-neutral-300"
          >
            {isRef ? "Use hex" : "Use palette"}
          </button>
          <button
            type="button"
            onClick={onClear}
            aria-label={`Remove ${label} override`}
            className="rounded bg-neutral-200 px-1.5 py-0.5 text-[11px] text-neutral-700 hover:bg-neutral-300"
          >
            Clear
          </button>
        </div>
      </div>
      {isRef ? (
        <div className="flex gap-1">
          <select
            value={variant}
            onChange={(e) => setRef(e.target.value as VariantName, tint)}
            aria-label={`${label} variant`}
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
            aria-label={`${label} tint`}
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
            value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#3b82f6"}
            onChange={(e) => onChange(e.target.value)}
            aria-label={`${label} hex`}
            className="h-7 w-9 shrink-0 cursor-pointer rounded border border-neutral-200 bg-white p-0.5"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-label={`${label} hex value`}
            className="w-full rounded border border-neutral-200 px-1.5 py-1 font-mono text-xs"
          />
        </div>
      )}
    </div>
  );
}

/**
 * "Component Colors" subsection (DRI-100). Optional per-family background
 * overrides for badges and form controls, layered over the palette-driven WA
 * defaults. Each is sourced from the numbered palette ramp (or a raw hex) and
 * reflected live in the preview.
 */
export function ComponentColorControls() {
  const { identity, setComponentColor } = useThemeInputs();
  const comp = identity.components;

  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold text-neutral-700">
        Component Colors
      </h3>
      <ul className="space-y-2.5">
        {FIELDS.map(({ key, label, defaultRef, hint }) => (
          <li key={key}>
            <ColorRefField
              label={label}
              hint={hint}
              value={comp[key]}
              defaultRef={defaultRef}
              onChange={(v) => setComponentColor({ [key]: v })}
              onClear={() => setComponentColor({ [key]: undefined })}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
