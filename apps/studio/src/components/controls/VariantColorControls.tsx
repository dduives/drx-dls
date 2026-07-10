import type { VariantName } from "@drx-dls/tokens";
import { useThemeInputs } from "../../state/useThemeInputs.ts";

const VARIANTS: { name: VariantName; label: string }[] = [
  { name: "brand", label: "Brand" },
  { name: "neutral", label: "Neutral" },
  { name: "success", label: "Success" },
  { name: "warning", label: "Warning" },
  { name: "danger", label: "Danger" },
];

/**
 * Color pickers for the five WebAwesome variants. Each writes its base hex
 * through `setVariantColor`; the generator derives the 11-tint scale from it.
 */
export function VariantColorControls() {
  const { identity, setVariantColor } = useThemeInputs();

  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold text-neutral-700">Colors</h3>
      <ul className="space-y-1.5">
        {VARIANTS.map(({ name, label }) => {
          const hex = identity.variants[name];
          return (
            <li key={name} className="flex items-center gap-2">
              <input
                type="color"
                value={hex}
                onChange={(e) => setVariantColor(name, e.target.value)}
                aria-label={`${label} base color`}
                className="h-7 w-9 shrink-0 cursor-pointer rounded border border-neutral-200 bg-white p-0.5"
              />
              <span className="flex-1 text-xs text-neutral-700">{label}</span>
              <input
                type="text"
                value={hex}
                onChange={(e) => setVariantColor(name, e.target.value)}
                aria-label={`${label} base color hex`}
                className="w-20 rounded border border-neutral-200 px-1.5 py-1 font-mono text-xs"
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
