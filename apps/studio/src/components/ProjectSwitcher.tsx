import { useRef, useState } from "react";
import { useProjects } from "../state/useProjects";
import { importThemeInputs } from "../lib/importTheme";

/**
 * Top-bar project switcher: lists saved projects and offers
 * create / rename / duplicate / delete / import actions. The active project's
 * inputs drive the whole editor (via ThemeInputsContext).
 */
export function ProjectSwitcher() {
  const {
    projects,
    activeProjectId,
    activeProject,
    selectProject,
    createProject,
    duplicateProject,
    renameProject,
    deleteProject,
    replaceInputs,
  } = useProjects();

  const [open, setOpen] = useState(false);
  const [importErrors, setImportErrors] = useState<string[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRename = (id: string, current: string) => {
    const name = window.prompt("Rename project", current);
    if (name && name.trim()) renameProject(id, name);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete project “${name}”? This cannot be undone.`)) {
      deleteProject(id);
    }
  };

  const handleImportClick = () => {
    setImportErrors(null);
    fileInputRef.current?.click();
  };

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Reset so selecting the same file again re-triggers change.
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
    <div className="relative text-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-1.5 font-medium text-neutral-900 hover:bg-neutral-50"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="max-w-[12rem] truncate">{activeProject.name}</span>
        <span className="text-neutral-400" aria-hidden>
          ▾
        </span>
      </button>

      {open && (
        <>
          {/* Click-away backdrop. */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            role="menu"
            className="absolute right-0 z-20 mt-1 w-72 rounded-md border border-neutral-200 bg-white p-1 shadow-lg"
          >
            <ul className="max-h-64 overflow-y-auto">
              {projects.map((project) => {
                const isActive = project.id === activeProjectId;
                return (
                  <li key={project.id} className="group flex items-center gap-1 rounded-md px-1 hover:bg-neutral-50">
                    <button
                      type="button"
                      onClick={() => {
                        selectProject(project.id);
                        setOpen(false);
                      }}
                      className={`flex-1 truncate rounded px-2 py-1.5 text-left ${
                        isActive ? "font-semibold text-neutral-900" : "text-neutral-700"
                      }`}
                      role="menuitemradio"
                      aria-checked={isActive}
                    >
                      {isActive ? "● " : ""}
                      {project.name}
                    </button>
                    <button
                      type="button"
                      title="Rename"
                      onClick={() => handleRename(project.id, project.name)}
                      className="rounded px-1.5 py-1 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700"
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      title="Duplicate"
                      onClick={() => duplicateProject(project.id)}
                      className="rounded px-1.5 py-1 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700"
                    >
                      ⧉
                    </button>
                    <button
                      type="button"
                      title="Delete"
                      onClick={() => handleDelete(project.id, project.name)}
                      className="rounded px-1.5 py-1 text-neutral-400 hover:bg-neutral-200 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="my-1 border-t border-neutral-200" />

            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={() => {
                  createProject();
                  setOpen(false);
                }}
                className="rounded px-3 py-1.5 text-left text-neutral-700 hover:bg-neutral-50"
              >
                + New project
              </button>
              <button
                type="button"
                onClick={handleImportClick}
                className="rounded px-3 py-1.5 text-left text-neutral-700 hover:bg-neutral-50"
              >
                ↥ Import drx.theme.json…
              </button>
            </div>

            {importErrors && importErrors.length > 0 && (
              <div className="mt-1 rounded-md bg-red-50 p-2 text-xs text-red-700">
                <p className="font-medium">Import failed:</p>
                <ul className="mt-1 list-inside list-disc space-y-0.5">
                  {importErrors.slice(0, 6).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
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
