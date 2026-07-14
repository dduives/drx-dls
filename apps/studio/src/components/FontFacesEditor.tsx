import { useState } from "react";
import { useThemeInputs } from "../state/useThemeInputs.ts";
import type { FontFace } from "@drx-dls/tokens";

const EMPTY_DRAFT: FontFace = { family: "", src: "", weight: "400", style: "" };

/**
 * Custom web-font loader (URL-only). Each row is one `@font-face` — paste a
 * direct font-file URL (`.woff2`/`.woff`/`.ttf`/`.otf`, e.g. a Google Fonts
 * file URL) plus optional weight/style. These export into `drx.theme.json` as
 * `fontFaces` and emit `@font-face` rules in the generated CSS. Reference the
 * `family` name from the font-family stacks (studio-controls) to apply it.
 *
 * New faces are entered in an explicit draft form and only committed to
 * `identity.fontFaces` on "Add font" (DRI-92) — after validation — so it's
 * clear when a face is persisted. Already-added faces stay editable inline.
 */
export function FontFacesEditor() {
  const { identity, setFontFaces } = useThemeInputs();
  const faces = identity.fontFaces;

  const [draft, setDraft] = useState<FontFace>(EMPTY_DRAFT);
  const [error, setError] = useState<string | null>(null);

  const updateDraft = (patch: Partial<FontFace>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
    if (error) setError(null);
  };

  const addFont = () => {
    const family = draft.family.trim();
    const src = draft.src.trim();
    if (!family) {
      setError("Family name is required.");
      return;
    }
    if (!src) {
      setError("Font file URL is required.");
      return;
    }
    if (
      faces.some((f) => f.family.trim().toLowerCase() === family.toLowerCase())
    ) {
      setError(`A font named "${family}" already exists.`);
      return;
    }

    const face: FontFace = { family, src };
    const weight = draft.weight?.trim();
    const style = draft.style?.trim();
    if (weight) face.weight = weight;
    if (style) face.style = style;

    setFontFaces([...faces, face]);
    setDraft(EMPTY_DRAFT);
    setError(null);
  };

  const update = (index: number, patch: Partial<FontFace>) => {
    setFontFaces(faces.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  };
  const remove = (index: number) => {
    setFontFaces(faces.filter((_, i) => i !== index));
  };

  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold text-neutral-700">Custom fonts</h3>

      {/* Draft form — nothing is committed until "Add font" is clicked. */}
      <div className="space-y-1 rounded-md border border-dashed border-neutral-300 bg-neutral-50 p-2">
        <input
          type="text"
          value={draft.family}
          onChange={(e) => updateDraft({ family: e.target.value })}
          placeholder="Family name (e.g. Inter)"
          className="w-full rounded border border-neutral-200 px-1.5 py-1 text-xs"
        />
        <input
          type="url"
          value={draft.src}
          onChange={(e) => updateDraft({ src: e.target.value })}
          placeholder="Font file URL (.woff2)"
          className="w-full rounded border border-neutral-200 px-1.5 py-1 text-xs"
        />
        <div className="flex gap-1">
          <input
            type="text"
            value={draft.weight ?? ""}
            onChange={(e) => updateDraft({ weight: e.target.value })}
            placeholder="weight"
            className="w-1/2 rounded border border-neutral-200 px-1.5 py-1 text-xs"
          />
          <input
            type="text"
            value={draft.style ?? ""}
            onChange={(e) => updateDraft({ style: e.target.value })}
            placeholder="style"
            className="w-1/2 rounded border border-neutral-200 px-1.5 py-1 text-xs"
          />
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button
          type="button"
          onClick={addFont}
          className="w-full rounded bg-neutral-800 px-2 py-1 text-xs font-medium text-white hover:bg-neutral-700"
        >
          Add font
        </button>
      </div>

      {faces.length === 0 ? (
        <p className="text-xs text-neutral-400">
          No custom fonts yet. Enter a family name and a direct font-file URL
          (woff2) above, then click{" "}
          <span className="font-medium">Add font</span> to emit an @font-face
          rule.
        </p>
      ) : (
        <ul className="space-y-2">
          {faces.map((face, i) => (
            <li
              key={i}
              className="space-y-1 rounded-md border border-neutral-200 p-2"
            >
              <input
                type="text"
                value={face.family}
                onChange={(e) => update(i, { family: e.target.value })}
                placeholder="Family name (e.g. Inter)"
                className="w-full rounded border border-neutral-200 px-1.5 py-1 text-xs"
              />
              <input
                type="url"
                value={face.src}
                onChange={(e) => update(i, { src: e.target.value })}
                placeholder="Font file URL (.woff2)"
                className="w-full rounded border border-neutral-200 px-1.5 py-1 text-xs"
              />
              <div className="flex gap-1">
                <input
                  type="text"
                  value={face.weight ?? ""}
                  onChange={(e) => update(i, { weight: e.target.value })}
                  placeholder="weight"
                  className="w-1/2 rounded border border-neutral-200 px-1.5 py-1 text-xs"
                />
                <input
                  type="text"
                  value={face.style ?? ""}
                  onChange={(e) => update(i, { style: e.target.value })}
                  placeholder="style"
                  className="w-1/2 rounded border border-neutral-200 px-1.5 py-1 text-xs"
                />
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-xs text-red-600 hover:underline"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
