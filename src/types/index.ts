export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  linkedin?: string;
  hasUploadedCV: boolean;
  cvFilename?: string;
  domain?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  level?: "beginner" | "intermediate" | "advanced";
}

export interface Course {
  id: string;
  title: string;
  platform: string;
  description: string;
  url: string;
  skillId: string;
  duration?: string;
  level?: "beginner" | "intermediate" | "advanced";
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  difficulty: "easy" | "medium" | "hard";
  requiredTools: string[];
  tasks?: ProjectTask[];
  projectUrl?: string; // Added for completed projects
}

export interface ProjectTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  tags: string[];
  description: string;
  url: string;
  postedDate: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface ProjectSession {
  projectId: string;
  messages: ChatMessage[];
  tasks: ProjectTask[];
}
