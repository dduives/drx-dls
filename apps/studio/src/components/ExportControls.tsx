import { useRef, useState } from "react";
import type { DeviceName } from "@drx-dls/tokens";
import { useProjects } from "../state/useProjects.ts";
import { useThemeInputs } from "../state/useThemeInputs.ts";
import { useDevice } from "../state/useDevice.ts";
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
 *               (INPUTS ONLY, matches drx.theme.example.json incl. `devices`,
 *               re-importable).
 *   - CSS     → per-device standalone drop-in files (`theme.web.css`,
 *               `theme.ios.css`, `theme.tvos.css`) — each self-contained via
 *               `emitCss(theme, { device })` for a separate per-device app repo.
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
  const { device } = useDevice();

  const [importErrors, setImportErrors] = useState<string[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const prefix = slugify(activeProject.name);
  const fileBase = prefix ? `${prefix}.drx.theme` : "drx.theme";
  const cssBase = prefix ? `${prefix}.theme` : "theme";

  const handleExportJson = () => {
    downloadFile(
      `${fileBase}.json`,
      buildThemeJson(identity),
      "application/json",
    );
  };

  // Standalone, self-contained CSS for one device (scales baked into :root).
  const handleExportDeviceCss = (dev: DeviceName) => {
    downloadFile(
      `${cssBase}.${dev}.css`,
      buildThemeCss(identity, dev),
      "text/css",
    );
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

  const DEVICE_CSS: { dev: DeviceName; label: string }[] = [
    { dev: "web", label: "Web" },
    { dev: "ios", label: "iOS" },
    { dev: "tvos", label: "tvOS" },
  ];

  return (
    <div className="relative inline-flex items-center gap-1">
      <button
        type="button"
        onClick={handleExportJson}
        title="Download drx.theme.json (inputs only, incl. per-device scales)"
        className="rounded-md border border-neutral-300 bg-neutral-800 px-2.5 py-1 text-xs font-medium text-white hover:bg-neutral-700"
      >
        Export
      </button>
      <div
        role="group"
        aria-label="Download standalone CSS per device"
        className="inline-flex items-center overflow-hidden rounded-md border border-neutral-300"
      >
        <span className="px-2 py-1 text-[11px] text-neutral-500">CSS</span>
        {DEVICE_CSS.map(({ dev, label }) => (
          <button
            key={dev}
            type="button"
            onClick={() => handleExportDeviceCss(dev)}
            title={`Download standalone ${label} theme.${dev}.css`}
            className={
              "border-l border-neutral-200 px-2 py-1 text-xs font-medium " +
              (device === dev
                ? "bg-neutral-100 text-neutral-900"
                : "bg-white text-neutral-700 hover:bg-neutral-50")
            }
          >
            {label}
          </button>
        ))}
      </div>
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
