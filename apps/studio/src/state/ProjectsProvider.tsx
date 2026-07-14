import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { resolveIdentity } from "@drx-dls/tokens";
import type { Identity } from "@drx-dls/tokens";
import { useThemeInputs } from "./useThemeInputs";
import { ThemeInputsProvider } from "./ThemeInputsProvider";
import { ProjectsContext, type ProjectsContextValue, type Project, type SaveStatus } from "./projectsContext";
import {
  ACTIVE_PROJECT_ID_KEY,
  PROJECTS_KEY,
  newId,
  readJson,
  readString,
  writeJson,
  writeString,
} from "../lib/storage";

function clone<T>(value: T): T {
  try {
    if (typeof structuredClone === "function") return structuredClone(value);
  } catch {
    // fall through
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

function makeProject(name: string, inputs: Identity): Project {
  return { id: newId(), name, inputs, updatedAt: Date.now() };
}

/** Ensure a name is unique within the current list (appends " 2", " 3", …). */
function uniqueName(base: string, projects: Project[]): string {
  const taken = new Set(projects.map((p) => p.name));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base} ${n}`)) n += 1;
  return `${base} ${n}`;
}

/** Minimal runtime guard for a persisted project record. */
function isProject(v: unknown): v is Project {
  if (typeof v !== "object" || v === null) return false;
  const p = v as Record<string, unknown>;
  return (
    typeof p.id === "string" &&
    typeof p.name === "string" &&
    typeof p.updatedAt === "number" &&
    typeof p.inputs === "object" &&
    p.inputs !== null
  );
}

function loadInitialProjects(): Project[] {
  const stored = readJson<unknown>(PROJECTS_KEY);
  if (Array.isArray(stored)) {
    const valid = stored.filter(isProject);
    if (valid.length > 0) return valid;
  }
  // First run (or corrupt storage): seed a single default project.
  return [makeProject("Default", resolveIdentity())];
}

function loadInitialActiveId(projects: Project[]): string {
  const stored = readString(ACTIVE_PROJECT_ID_KEY);
  if (stored && projects.some((p) => p.id === stored)) return stored;
  return projects[0]!.id;
}

/**
 * Owns the projects list + active id + localStorage sync, and composes the
 * existing `ThemeInputsProvider` so the ACTIVE project's `inputs` becomes the
 * single source of truth in `ThemeInputsContext`. Edits made through
 * `useThemeInputs()` flow back and persist into the active project.
 *
 * The editor is remounted (via `seedKey`) only when the active project changes
 * or its inputs are wholesale replaced (import/duplicate-into-active) — ordinary
 * field edits do NOT remount, they just persist.
 */
export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(loadInitialProjects);
  const [activeProjectId, setActiveProjectId] = useState<string>(() =>
    loadInitialActiveId(projects),
  );
  // Bumped to force the editor to re-seed from the active project's inputs.
  const [seedKey, setSeedKey] = useState(0);

  // Autosave indicator state. `writeJson` is synchronous, so we surface a brief
  // "Saving…" phase after each change that settles to "All changes saved" once
  // edits pause — giving users clear feedback that their work is persisted.
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const skipFirstPersist = useRef(true);

  // Persist projects + active id whenever they change.
  useEffect(() => {
    writeJson(PROJECTS_KEY, projects);
    // Don't flash "Saving…" for the initial hydrate-and-write on mount.
    if (skipFirstPersist.current) {
      skipFirstPersist.current = false;
      return;
    }
    setSaveStatus("saving");
    const t = setTimeout(() => {
      setSaveStatus("saved");
      setLastSavedAt(Date.now());
    }, 500);
    return () => clearTimeout(t);
  }, [projects]);
  useEffect(() => {
    writeString(ACTIVE_PROJECT_ID_KEY, activeProjectId);
  }, [activeProjectId]);

  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId) ?? projects[0]!,
    [projects, activeProjectId],
  );

  // Persist an identity edit back into a specific project. Stable identity so
  // the sync bridge effect only fires on real identity changes.
  const persistInputs = useCallback((id: string, inputs: Identity) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, inputs, updatedAt: Date.now() } : p,
      ),
    );
  }, []);

  const selectProject = useCallback((id: string) => {
    setActiveProjectId((prev) => {
      if (prev === id) return prev;
      setSeedKey((k) => k + 1);
      return id;
    });
  }, []);

  const createProject = useCallback((name?: string) => {
    const project = makeProject("Untitled", resolveIdentity());
    setProjects((prev) => {
      project.name = uniqueName(name?.trim() || "Untitled", prev);
      return [...prev, project];
    });
    setActiveProjectId(project.id);
    setSeedKey((k) => k + 1);
    return project.id;
  }, []);

  const duplicateProject = useCallback((id: string, name?: string) => {
    const project = makeProject("Copy", resolveIdentity());
    setProjects((prev) => {
      const source = prev.find((p) => p.id === id);
      if (!source) return prev;
      project.inputs = clone(source.inputs);
      project.name = uniqueName(name?.trim() || `${source.name} copy`, prev);
      return [...prev, project];
    });
    setActiveProjectId(project.id);
    setSeedKey((k) => k + 1);
    return project.id;
  }, []);

  const renameProject = useCallback((id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, name: trimmed, updatedAt: Date.now() } : p,
      ),
    );
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => {
      const remaining = prev.filter((p) => p.id !== id);
      // Never leave the app without a project.
      const next =
        remaining.length > 0
          ? remaining
          : [makeProject("Default", resolveIdentity())];
      setActiveProjectId((active) => {
        if (active !== id) return active;
        setSeedKey((k) => k + 1);
        return next[0]!.id;
      });
      return next;
    });
  }, []);

  const replaceInputs = useCallback((id: string, inputs: Identity) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, inputs, updatedAt: Date.now() } : p,
      ),
    );
    // Re-seed the editor if we replaced the currently active project.
    setActiveProjectId((active) => {
      if (active === id) setSeedKey((k) => k + 1);
      return active;
    });
  }, []);

  const value = useMemo<ProjectsContextValue>(
    () => ({
      projects,
      activeProjectId,
      activeProject,
      saveStatus,
      lastSavedAt,
      selectProject,
      createProject,
      duplicateProject,
      renameProject,
      deleteProject,
      replaceInputs,
    }),
    [
      projects,
      activeProjectId,
      activeProject,
      saveStatus,
      lastSavedAt,
      selectProject,
      createProject,
      duplicateProject,
      renameProject,
      deleteProject,
      replaceInputs,
    ],
  );

  return (
    <ProjectsContext.Provider value={value}>
      <ThemeInputsProvider
        key={`${activeProject.id}:${seedKey}`}
        initialIdentity={activeProject.inputs}
      >
        <ActiveIdentitySync projectId={activeProject.id} persist={persistInputs} />
        {children}
      </ThemeInputsProvider>
    </ProjectsContext.Provider>
  );
}

/**
 * Bridge inside `ThemeInputsProvider`: watches the editor's `identity` and
 * persists it back into the active project. The first run (the initial seed
 * for this mount) is skipped so switching projects doesn't spuriously touch
 * `updatedAt`.
 */
function ActiveIdentitySync({
  projectId,
  persist,
}: {
  projectId: string;
  persist: (id: string, inputs: Identity) => void;
}) {
  const { identity } = useThemeInputs();
  const seeded = useRef(false);

  useEffect(() => {
    if (!seeded.current) {
      seeded.current = true;
      return;
    }
    persist(projectId, identity);
  }, [identity, projectId, persist]);

  return null;
}
