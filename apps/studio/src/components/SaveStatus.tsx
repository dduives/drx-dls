import { useProjects } from "../state/useProjects.ts";

/**
 * Top-bar autosave indicator (DRI-97). Studio has no explicit Save button —
 * every edit is autosaved to localStorage — so this makes the frictionless
 * model discoverable: a live "Saving…" pulse that settles to "All changes
 * saved", removing the "is my work saved?" uncertainty.
 */
export function SaveStatus() {
  const { saveStatus } = useProjects();
  const saving = saveStatus === "saving";

  return (
    <span
      className="flex items-center gap-1.5 text-xs text-neutral-400"
      aria-live="polite"
      title="Changes are saved automatically to this browser."
    >
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${
          saving ? "animate-pulse bg-amber-400" : "bg-emerald-500"
        }`}
        aria-hidden="true"
      />
      {saving ? "Saving…" : "All changes saved"}
    </span>
  );
}
