import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { resolveIdentity } from "@drx-dls/tokens";
import { ProjectsProvider } from "../src/state/ProjectsProvider.tsx";
import { useProjects } from "../src/state/useProjects.ts";
import { useThemeInputs } from "../src/state/useThemeInputs.ts";
import {
  ACTIVE_PROJECT_ID_KEY,
  PROJECTS_KEY,
  readJson,
  readString,
} from "../src/lib/storage.ts";
import { importThemeInputs } from "../src/lib/importTheme.ts";
import type { Project } from "../src/state/projectsContext.ts";

// Consume both contexts at once so a single renderHook drives the whole editor.
function useStudio() {
  return { projects: useProjects(), theme: useThemeInputs() };
}

const wrapper = ({ children }: { children: ReactNode }) => (
  <ProjectsProvider>{children}</ProjectsProvider>
);

function render() {
  return renderHook(() => useStudio(), { wrapper });
}

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  localStorage.clear();
});

describe("first-run seeding", () => {
  it("seeds a single 'Default' project from base.tokens.json defaults", () => {
    const { result } = render();
    expect(result.current.projects.projects).toHaveLength(1);
    expect(result.current.projects.activeProject.name).toBe("Default");
    // The seeded inputs are the resolved base identity.
    expect(result.current.theme.identity).toEqual(resolveIdentity());
  });

  it("persists the seeded project + active id to localStorage", () => {
    const { result } = render();
    const persisted = readJson<Project[]>(PROJECTS_KEY);
    expect(persisted).toHaveLength(1);
    expect(readString(ACTIVE_PROJECT_ID_KEY)).toBe(
      result.current.projects.activeProjectId,
    );
  });
});

describe("create / switch / duplicate / delete", () => {
  it("creates a new project and makes it active", () => {
    const { result } = render();
    const firstId = result.current.projects.activeProjectId;

    act(() => {
      result.current.projects.createProject("Driesflix");
    });

    expect(result.current.projects.projects).toHaveLength(2);
    expect(result.current.projects.activeProject.name).toBe("Driesflix");
    expect(result.current.projects.activeProjectId).not.toBe(firstId);
  });

  it("switches back to a previous project", () => {
    const { result } = render();
    const firstId = result.current.projects.activeProjectId;
    act(() => {
      result.current.projects.createProject("Second");
    });
    act(() => {
      result.current.projects.selectProject(firstId);
    });
    expect(result.current.projects.activeProjectId).toBe(firstId);
    expect(result.current.projects.activeProject.name).toBe("Default");
  });

  it("duplicates a project with an independent (deep-copied) inputs snapshot", () => {
    const { result } = render();
    const sourceId = result.current.projects.activeProjectId;

    // Give the source a distinctive edit first.
    act(() => {
      result.current.theme.setVariantColor("brand", "#123456");
    });

    act(() => {
      result.current.projects.duplicateProject(sourceId, "Clone");
    });
    const cloneId = result.current.projects.activeProjectId;

    expect(result.current.projects.projects).toHaveLength(2);
    expect(cloneId).not.toBe(sourceId);
    expect(result.current.theme.identity.variants.brand).toBe("#123456");

    // Editing the clone must NOT mutate the source (deep copy).
    act(() => {
      result.current.theme.setVariantColor("brand", "#abcdef");
    });
    const source = result.current.projects.projects.find((p) => p.id === sourceId)!;
    expect(source.inputs.variants.brand).toBe("#123456");
  });

  it("deletes a non-active project without changing the active one", () => {
    const { result } = render();
    const firstId = result.current.projects.activeProjectId;
    act(() => {
      result.current.projects.createProject("ToDelete");
    });
    const secondId = result.current.projects.activeProjectId;
    act(() => {
      result.current.projects.selectProject(firstId);
    });
    act(() => {
      result.current.projects.deleteProject(secondId);
    });
    expect(result.current.projects.projects).toHaveLength(1);
    expect(result.current.projects.activeProjectId).toBe(firstId);
  });
});

describe("delete-last-project re-seed", () => {
  it("re-seeds a fresh Default project when the last one is deleted", () => {
    const { result } = render();
    const onlyId = result.current.projects.activeProjectId;

    act(() => {
      result.current.projects.deleteProject(onlyId);
    });

    expect(result.current.projects.projects).toHaveLength(1);
    const reseeded = result.current.projects.activeProject;
    expect(reseeded.name).toBe("Default");
    expect(reseeded.id).not.toBe(onlyId); // a brand-new project
    expect(result.current.projects.activeProjectId).toBe(reseeded.id);
    expect(result.current.theme.identity).toEqual(resolveIdentity());
  });
});

describe("persistence across a reload", () => {
  it("restores the projects list, active id, and edited inputs from localStorage", () => {
    // First session: create a second project and edit its accent.
    const first = render();
    act(() => {
      first.result.current.projects.createProject("Persisted");
    });
    act(() => {
      first.result.current.theme.setVariantColor("brand", "#0ea5e9");
    });
    const persistedId = first.result.current.projects.activeProjectId;
    // Unmount = close the tab. State is gone; only localStorage remains.
    first.unmount();

    // Second session: a fresh provider re-instantiates purely from storage.
    const second = render();
    expect(second.result.current.projects.projects).toHaveLength(2);
    expect(second.result.current.projects.activeProjectId).toBe(persistedId);
    expect(second.result.current.projects.activeProject.name).toBe("Persisted");
    expect(second.result.current.theme.identity.variants.brand).toBe("#0ea5e9");
  });
});

describe("import guard (point 7 at the state level)", () => {
  it("a failed import leaves the active project's inputs untouched", () => {
    const { result } = render();
    const before = result.current.theme.identity;

    // Mirror ProjectSwitcher.handleFile: only replaceInputs on success.
    const importResult = importThemeInputs("{ definitely not json ");
    act(() => {
      if (importResult.ok) {
        result.current.projects.replaceInputs(
          result.current.projects.activeProjectId,
          importResult.identity,
        );
      }
    });

    expect(importResult.ok).toBe(false);
    expect(result.current.theme.identity).toEqual(before);
  });

  it("a successful import replaces the active project's inputs", () => {
    const { result } = render();
    const activeId = result.current.projects.activeProjectId;
    const good = importThemeInputs(
      JSON.stringify({ variants: { brand: "#ff0000" } }),
    );
    expect(good.ok).toBe(true);
    if (!good.ok) return;
    act(() => {
      result.current.projects.replaceInputs(activeId, good.identity);
    });
    expect(result.current.theme.identity.variants.brand).toBe("#ff0000");
  });
});
