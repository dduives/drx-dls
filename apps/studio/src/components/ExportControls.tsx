import { useRef, useState } from "react";
import { useProjects } from "../state/useProjects.ts";
import { useThemeInputs } from "../state/useThemeInputs.ts";
import { importThemeInputs } from "../lib/importTheme.ts";
import { buildThemeCss, buildThemeJson } from "../lib/exportTheme.ts";

/** Slugify a project name into a safe filename prefix (empty → no prefix). */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Trigger a client-side download of `content` as `filename` with `mime`. */
function downloadFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Top-bar export/import cluster (DRI-55):
 *   - Export  → downloads the active project's inputs as `drx.theme.json`
 *               (INPUTS ONLY, matches drx.theme.example.json, re-importable).
 *   - CSS     → secondary download of the generated drop-in `theme.css`.
 *   - Import  → file picker for a `.json`; validated via `importThemeInputs`
 *               (shared with DRI-58) and routed through `replaceInputs` so the
 *               editor + live preview re-seed from the imported identity.
 *
 * Single source of truth: export reads the current `identity`; import overwrites
 * the active project's inputs. No validation is reimplemented here.
 */
export function ExportControls() {
  const { identity } = useThemeInputs();
  const { activeProject, activeProjectId, replaceInputs } = useProjects();

  const [importErrors, setImportErrors] = useState<string[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const prefix = slugify(activeProject.name);
  const fileBase = prefix ? `${prefix}.drx.theme` : "drx.theme";

  const handleExportJson = () => {
    downloadFile(
      `${fileBase}.json`,
      buildThemeJson(identity),
      "application/json",
    );
  };

  const handleExportCss = () => {
    const cssBase = prefix ? `${prefix}.theme` : "theme";
    downloadFile(`${cssBase}.css`, buildThemeCss(identity), "text/css");
  };

  const handleImportClick = () => {
    setImportErrors(null);
    fileInputRef.current?.click();
  };

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Reset so re-selecting the same file re-triggers change.
    event.target.value = "";
    if (!file) return;
    const text = await file.text();
    const result = importThemeInputs(text);
    if (result.ok) {
      setImportErrors(null);
      replaceInputs(activeProjectId, result.identity);
    } else {
      setImportErrors(result.errors);
    }
  };

  return (
    <div className="relative inline-flex items-center gap-1">
      <button
        type="button"
        onClick={handleExportJson}
        title="Download drx.theme.json (inputs only)"
        className="rounded-md border border-neutral-300 bg-neutral-800 px-2.5 py-1 text-xs font-medium text-white hover:bg-neutral-700"
      >
        Export
      </button>
      <button
        type="button"
        onClick={handleExportCss}
        title="Download the generated theme.css"
        className="rounded-md border border-neutral-300 bg-white px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
      >
        Export CSS
      </button>
      <button
        type="button"
        onClick={handleImportClick}
        title="Import a drx.theme.json into this project"
        className="rounded-md border border-neutral-300 bg-white px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
      >
        Import
      </button>

      {importErrors && importErrors.length > 0 && (
        <div
          role="alert"
          className="absolute right-0 top-full z-30 mt-1 w-72 rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700 shadow-lg"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium">Import failed:</p>
            <button
              type="button"
              onClick={() => setImportErrors(null)}
              className="text-red-400 hover:text-red-700"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
          <ul className="mt-1 list-inside list-disc space-y-0.5">
            {importErrors.slice(0, 6).map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
