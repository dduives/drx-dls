import { createContext } from "react";
import type { Identity } from "@drx-dls/tokens";

/**
 * A named theme project: one independent `Identity` inputs instance. A designer
 * keeps several side-by-side (e.g. `driesflix`, `food.zess.io`) and flips
 * between them; the ACTIVE project's `inputs` is what the rest of the app edits
 * (via `ThemeInputsContext`).
 */
export interface Project {
  id: string;
  name: string;
  inputs: Identity;
  updatedAt: number;
}

/**
 * Autosave lifecycle for the "All changes saved" indicator. Studio persists
 * every edit to localStorage; `"saving"` is shown briefly after a change and
 * settles back to `"saved"` once writes pause.
 */
export type SaveStatus = "saved" | "saving";

export interface ProjectsContextValue {
  projects: Project[];
  activeProjectId: string;
  activeProject: Project;

  /** Autosave status for the top-bar indicator. */
  saveStatus: SaveStatus;
  /** Epoch ms of the last successful persist, or null before the first save. */
  lastSavedAt: number | null;

  /** Make an existing project active (loads its inputs into the editor). */
  selectProject: (id: string) => void;
  /** Create a fresh project from base.tokens.json defaults; returns its id. */
  createProject: (name?: string) => string;
  /** Deep-copy an existing project's inputs into a new project; returns its id. */
  duplicateProject: (id: string, name?: string) => string;
  /** Rename a project. */
  renameProject: (id: string, name: string) => void;
  /** Delete a project. If it was active, another becomes active. */
  deleteProject: (id: string) => void;
  /**
   * Overwrite a project's inputs (e.g. after importing a validated
   * `drx.theme.json`). If it's the active project the editor re-seeds.
   */
  replaceInputs: (id: string, inputs: Identity) => void;
}

export const ProjectsContext = createContext<ProjectsContextValue | null>(null);
