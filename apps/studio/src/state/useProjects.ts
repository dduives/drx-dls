import { useContext } from "react";
import { ProjectsContext, type ProjectsContextValue } from "./projectsContext";

export function useProjects(): ProjectsContextValue {
  const ctx = useContext(ProjectsContext);
  if (!ctx) {
    throw new Error("useProjects must be used within a <ProjectsProvider>");
  }
  return ctx;
}
