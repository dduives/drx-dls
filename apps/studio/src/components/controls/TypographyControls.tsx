import type { Identity } from "@drx-dls/tokens";
import { useThemeInputs } from "../../state/useThemeInputs.ts";

const SLOTS: { kind: keyof Identity["fontFamily"]; label: string }[] = [
  { kind: "body", label: "Body" },
  { kind: "heading", label: "Heading" },
  { kind: "code", label: "Code" },
];

/**
 * Font-family stacks for body / heading / code. Free-text CSS font-family
 * values; reference any custom `@font-face` families added below by name.
 */
export function TypographyControls() {
  const { identity, setFontFamily } = useThemeInputs();

  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold text-neutral-700">Typography</h3>
      <ul className="space-y-1.5">
        {SLOTS.map(({ kind, label }) => (
          <li key={kind} className="space-y-0.5">
            <label className="text-xs text-neutral-700" htmlFor={`ff-${kind}`}>
              {label}
            </label>
            <input
              id={`ff-${kind}`}
              type="text"
              value={identity.fontFamily[kind]}
              onChange={(e) => setFontFamily(kind, e.target.value)}
              placeholder="font-family stack"
              className="w-full rounded border border-neutral-200 px-1.5 py-1 text-xs"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
