import React, { createContext, useContext, useState, useEffect } from "react";
import { Project } from "@/types";

interface ProjectsContextType {
  cvProjects: Project[];
  suggestedProjects: Project[];
  addProjectToPortfolio: (projectId: string, projectUrl?: string) => void;
  addCustomProject: (project: Project) => void;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(
  undefined,
);

// Mock data for CV-extracted projects (projects user has already worked on)
const initialCvProjects: Project[] = [
  {
    id: "cv-1",
    title: "E-commerce Platform Development",
    description:
      "Developed a full-stack e-commerce platform with React frontend and Node.js backend, featuring user authentication, product catalog, shopping cart, and payment integration.",
    tags: ["completed", "fullstack", "react", "nodejs", "mongodb"],
    difficulty: "hard",
    requiredTools: ["React", "Node.js", "MongoDB", "Stripe API", "JWT"],
    projectUrl: "https://github.com/user/ecommerce-platform",
  },
  {
    id: "cv-2",
    title: "Task Management Dashboard",
    description:
      "Built a responsive task management dashboard for team collaboration with real-time updates, drag-and-drop functionality, and user role management.",
    tags: ["completed", "frontend", "react", "typescript"],
    difficulty: "medium",
    requiredTools: ["React", "TypeScript", "Redux", "Socket.io", "CSS"],
    projectUrl: "https://taskmanager-demo.netlify.app",
  },
  {
    id: "cv-3",
    title: "Personal Portfolio Website",
    description:
      "Created a modern, responsive portfolio website showcasing projects and skills with smooth animations and optimized performance.",
    tags: ["completed", "frontend", "portfolio", "html", "css"],
    difficulty: "easy",
    requiredTools: ["HTML", "CSS", "JavaScript", "GSAP", "Git"],
    // No projectUrl for this one to test the disabled state
  },
];

// Mock data for suggested projects
const initialSuggestedProjects: Project[] = [
  {
    id: "1",
    title: "Build a Personal Portfolio Website",
    description:
      "Create a responsive portfolio website showcasing your skills and projects using modern web technologies.",
    tags: ["frontend", "beginner", "html", "css", "javascript"],
    difficulty: "easy",
    requiredTools: ["HTML", "CSS", "JavaScript", "Git"],
  },
  {
    id: "2",
    title: "Task Management API",
    description:
      "Develop a RESTful API for managing tasks with authentication, task creation, assignment, and status tracking.",
    tags: ["backend", "intermediate", "api", "database"],
    difficulty: "medium",
    requiredTools: ["Node.js", "Express", "MongoDB", "JWT"],
  },
  {
    id: "3",
    title: "E-commerce Product Page",
    description:
      "Build an interactive product page with image gallery, product variants, and shopping cart functionality.",
    tags: ["frontend", "intermediate", "react", "ui/ux"],
    difficulty: "medium",
    requiredTools: ["React", "CSS", "State Management"],
  },
  {
    id: "4",
    title: "Weather App with Geolocation",
    description:
      "Create a weather application that shows current weather and forecast based on user's location.",
    tags: ["frontend", "beginner", "api", "javascript"],
    difficulty: "easy",
    requiredTools: ["HTML", "CSS", "JavaScript", "Weather API"],
  },
  {
    id: "5",
    title: "Real-time Chat Application",
    description:
      "Build a real-time chat application with private messaging, group chats, and online status indicators.",
    tags: ["fullstack", "advanced", "websockets", "database"],
    difficulty: "hard",
    requiredTools: ["React", "Node.js", "Socket.io", "MongoDB"],
  },
];

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [cvProjects, setCvProjects] = useState<Project[]>([]);
  const [suggestedProjects, setSuggestedProjects] = useState<Project[]>([]);

  useEffect(() => {
    // Load projects from localStorage or use initial data
    const storedCvProjects = localStorage.getItem("cvProjects");
    const storedSuggestedProjects = localStorage.getItem("suggestedProjects");

    if (storedCvProjects) {
      setCvProjects(JSON.parse(storedCvProjects));
    } else {
      setCvProjects(initialCvProjects);
      localStorage.setItem("cvProjects", JSON.stringify(initialCvProjects));
    }

    if (storedSuggestedProjects) {
      setSuggestedProjects(JSON.parse(storedSuggestedProjects));
    } else {
      setSuggestedProjects(initialSuggestedProjects);
      localStorage.setItem(
        "suggestedProjects",
        JSON.stringify(initialSuggestedProjects),
      );
    }
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
