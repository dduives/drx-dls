import { useThemeInputs } from "../state/useThemeInputs.ts";
import type { FontFace } from "@drx-dls/tokens";

/**
 * Custom web-font loader (URL-only). Each row is one `@font-face` — paste a
 * direct font-file URL (`.woff2`/`.woff`/`.ttf`/`.otf`, e.g. a Google Fonts
 * file URL) plus optional weight/style. These export into `drx.theme.json` as
 * `fontFaces` and emit `@font-face` rules in the generated CSS. Reference the
 * `family` name from the font-family stacks (studio-controls) to apply it.
 */
export function FontFacesEditor() {
  const { identity, setFontFaces } = useThemeInputs();
  const faces = identity.fontFaces;

  const update = (index: number, patch: Partial<FontFace>) => {
    setFontFaces(faces.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  };
  const add = () => {
    setFontFaces([...faces, { family: "", src: "", weight: "400" }]);
  };
  const remove = (index: number) => {
    setFontFaces(faces.filter((_, i) => i !== index));
  };

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-neutral-700">Custom fonts</h3>
        <button
          type="button"
          onClick={add}
          className="rounded bg-neutral-200 px-2 py-0.5 text-xs text-neutral-700 hover:bg-neutral-300"
        >
          + Add
        </button>
      </div>

      {faces.length === 0 ? (
        <p className="text-xs text-neutral-400">
          No custom fonts. Add a direct font-file URL (woff2) to emit an
          @font-face rule.
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
