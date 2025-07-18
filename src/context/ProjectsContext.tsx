import React, { createContext, useContext, useState, useEffect } from "react";
import { Project } from "@/types";
import axios from "axios";

interface ProjectsContextType {
  cvProjects: Project[];
  suggestedProjects: Project[];
  addProjectToPortfolio: (projectId: string, projectUrl?: string) => void;
  addCustomProject: (project: Project) => void;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(
  undefined,
);



export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [cvProjects, setCvProjects] = useState<Project[]>([]);
  const [suggestedProjects, setSuggestedProjects] = useState<Project[]>([]);

  useEffect(() => {
    // fetch real CV  suggestions
    axios
      .get("/cv/me")
      .then(({ data }) => {
        const { projects, suggested_projects } = data.parsed;

        // map CV projects
        setCvProjects(
          projects.map((p: any, i: number) => ({
            id:           `cv-${i}`,
            title:        p.name,
            description:  p.description,
            tags:         ["completed", ...p.tools.map((t: string) => t.toLowerCase())],
            requiredTools:p.tools,
            projectUrl:   Array.isArray(p.link) ? p.link[0] : p.link || undefined,
          }))
        );

        // map suggested projects
        setSuggestedProjects(
          suggested_projects.map((sp: any, i: number) => ({
            id:             sp.id.toString(),
            title:          sp.name,
            description:    sp.description,
            tags:           [sp.difficulty, ...sp.tools.map((t: string) => t.toLowerCase())],
            difficulty:     sp.difficulty,
            requiredTools:  sp.tools,
            tasks: (sp.tasks as string[]).map((t, j) => ({
              id:        `${sp.id}-task-${j}`,
              title:     t,
              completed: false,
            })),
          }))
        );
      })
      .catch((_) => {
        // optionally fallback / toast
      });
  }, []);

  const addProjectToPortfolio = (projectId: string, projectUrl?: string) => {
    // Find the project in suggested projects
    const projectToMove = suggestedProjects.find((p) => p.id === projectId);

    if (projectToMove) {
      // Create a completed version of the project
      const completedProject: Project = {
        ...projectToMove,
        tags: [
          "completed",
          ...projectToMove.tags.filter((tag) => tag !== "custom"),
        ],
        projectUrl: projectUrl, // Add the provided URL
      };

      // Add to CV projects and remove from suggested projects
      const newCvProjects = [completedProject, ...cvProjects];
      const newSuggestedProjects = suggestedProjects.filter(
        (p) => p.id !== projectId,
      );

      setCvProjects(newCvProjects);
      setSuggestedProjects(newSuggestedProjects);

      // Update localStorage
      localStorage.setItem("cvProjects", JSON.stringify(newCvProjects));
      localStorage.setItem(
        "suggestedProjects",
        JSON.stringify(newSuggestedProjects),
      );
    }
  };

  const addCustomProject = (project: Project) => {
    const newSuggestedProjects = [project, ...suggestedProjects];
    setSuggestedProjects(newSuggestedProjects);
    localStorage.setItem(
      "suggestedProjects",
      JSON.stringify(newSuggestedProjects),
    );
  };

  return (
    <ProjectsContext.Provider
      value={{
        cvProjects,
        suggestedProjects,
        addProjectToPortfolio,
        addCustomProject,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectsContext);

  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectsProvider");
  }

  return context;
}
