import { useThemeInputs } from "../../state/useThemeInputs.ts";
import { ContrastWarnings } from "../ContrastWarnings.tsx";
import { FontFacesEditor } from "../FontFacesEditor.tsx";
import { VariantColorControls } from "./VariantColorControls.tsx";
import { ScaleControls } from "./ScaleControls.tsx";
import { TypographyControls } from "./TypographyControls.tsx";
import { FormControlControls } from "./FormControlControls.tsx";
import { ComponentColorControls } from "./ComponentColorControls.tsx";

/**
 * Left-panel control surface. Every control reads its value from `identity`
 * and writes through the shared context setters (useThemeInputs), which the
 * live preview (DRI-52) reacts to. Fully controlled — no local mirror.
 */
export function ControlPanel() {
  const { reset } = useThemeInputs();

  return (
    <div className="space-y-5">
      <VariantColorControls />
      <ContrastWarnings />
      <ScaleControls />
      <TypographyControls />
      <FontFacesEditor />
      <FormControlControls />
      <ComponentColorControls />
      <button
        type="button"
        onClick={reset}
        className="w-full rounded border border-neutral-200 px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-100"
      >
        Reset to defaults
      </button>
    </div>
  );
}
