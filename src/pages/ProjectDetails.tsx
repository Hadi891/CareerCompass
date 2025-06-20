import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Project, ChatMessage, ProjectTask } from "@/types";
import { useProjects } from "@/context/ProjectsContext";
import {
  ArrowLeft,
  Send,
  Bot,
  User as UserIcon,
  CheckCircle2,
  XCircle,
  Clock,
  Wrench,
  Trophy,
  Star,
  ExternalLink,
} from "lucide-react";

// Initial messages for different projects
const getInitialMessages = (projectTitle: string): ChatMessage[] => {
  return [
    {
      id: "1",
      sender: "assistant",
      content: `Welcome to the "${projectTitle}" project! I'm your AI assistant and I'll help you build this project step by step. What would you like to know about this project?`,
      timestamp: Date.now(),
    },
  ];
};

// Mock tasks for different projects
const getProjectTasks = (projectId: string): ProjectTask[] => {
  switch (projectId) {
    case "1":
      return [
        { id: "task1", title: "Set up project structure", completed: false },
        {
          id: "task2",
          title: "Create navigation and hero section",
          completed: false,
        },
        { id: "task3", title: "Build about me section", completed: false },
        { id: "task4", title: "Create projects showcase", completed: false },
        { id: "task5", title: "Add contact form", completed: false },
        { id: "task6", title: "Make website responsive", completed: false },
        { id: "task7", title: "Deploy website", completed: false },
      ];
    case "2":
      return [
        {
          id: "task1",
          title: "Set up project and install dependencies",
          completed: false,
        },
        { id: "task2", title: "Create database models", completed: false },
        {
          id: "task3",
          title: "Implement user authentication",
          completed: false,
        },
        { id: "task4", title: "Create task CRUD endpoints", completed: false },
        {
          id: "task5",
          title: "Add task assignment functionality",
          completed: false,
        },
        {
          id: "task6",
          title: "Implement filtering and pagination",
          completed: false,
        },
        { id: "task7", title: "Write tests", completed: false },
        { id: "task8", title: "Deploy API", completed: false },
      ];
    case "3":
      return [
        { id: "task1", title: "Set up React project", completed: false },
        {
          id: "task2",
          title: "Create product image gallery",
          completed: false,
        },
        {
          id: "task3",
          title: "Build product details section",
          completed: false,
        },
        {
          id: "task4",
          title: "Implement product variants selection",
          completed: false,
        },
        {
          id: "task5",
          title: "Create add to cart functionality",
          completed: false,
        },
        { id: "task6", title: "Build shopping cart drawer", completed: false },
        { id: "task7", title: "Add responsive styles", completed: false },
      ];
    case "4":
      return [
        { id: "task1", title: "Set up project structure", completed: false },
        { id: "task2", title: "Implement geolocation", completed: false },
        { id: "task3", title: "Connect to weather API", completed: false },
        { id: "task4", title: "Display current weather", completed: false },
        { id: "task5", title: "Add 5-day forecast", completed: false },
        { id: "task6", title: "Style the application", completed: false },
        { id: "task7", title: "Add location search", completed: false },
        { id: "task8", title: "Make responsive", completed: false },
      ];
    case "5":
      return [
        {
          id: "task1",
          title: "Set up frontend and backend projects",
          completed: false,
        },
        {
          id: "task2",
          title: "Implement user authentication",
          completed: false,
        },
        {
          id: "task3",
          title: "Set up Socket.io connections",
          completed: false,
        },
        { id: "task4", title: "Create chat UI components", completed: false },
        { id: "task5", title: "Implement private messaging", completed: false },
        {
          id: "task6",
          title: "Add group chat functionality",
          completed: false,
        },
        {
          id: "task7",
          title: "Create online status indicators",
          completed: false,
        },
        { id: "task8", title: "Add message history", completed: false },
        { id: "task9", title: "Implement notifications", completed: false },
        { id: "task10", title: "Deploy application", completed: false },
      ];
    default:
      return [
        { id: "task1", title: "Plan project structure", completed: false },
        {
          id: "task2",
          title: "Set up development environment",
          completed: false,
        },
        { id: "task3", title: "Implement core features", completed: false },
        { id: "task4", title: "Add styling and polish", completed: false },
        { id: "task5", title: "Test and deploy", completed: false },
      ];
  }
};

export default function ProjectDetails() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { cvProjects, suggestedProjects, addProjectToPortfolio } =
    useProjects();
  const [project, setProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [projectUrl, setProjectUrl] = useState("");
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (projectId) {
      // First try to find in suggested projects, then in CV projects
      const allProjects = [...suggestedProjects, ...cvProjects];
      const foundProject = allProjects.find((p) => p.id === projectId);

      if (foundProject) {
        setProject(foundProject);
        setTasks(getProjectTasks(projectId));
        setMessages(getInitialMessages(foundProject.title));
      } else {
        navigate("/projects");
        toast({
          title: "Project not found",
          description: "The requested project could not be found.",
          variant: "destructive",
        });
      }
    }
  }, [projectId, navigate, suggestedProjects, cvProjects]);

  useEffect(() => {
    // Scroll to bottom of chat when messages change
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      content: newMessage,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setLoading(true);

    // Simulate AI response after a delay
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        content: generateAIResponse(newMessage, project?.title || ""),
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setLoading(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const handleAddToPortfolio = () => {
    setShowUrlModal(true);
  };

  const confirmAddToPortfolio = () => {
    if (projectId) {
      // Validate URL if provided
      let validUrl = "";
      if (projectUrl.trim()) {
        try {
          // Add https:// if no protocol is provided
          const url = projectUrl.trim();
          if (!url.startsWith("http://") && !url.startsWith("https://")) {
            validUrl = `https://${url}`;
          } else {
            validUrl = url;
          }
          // Test if it's a valid URL
          new URL(validUrl);
        } catch {
          toast({
            title: "Invalid URL",
            description: "Please enter a valid URL (e.g., https://example.com)",
            variant: "destructive",
          });
          return;
        }
      }

      addProjectToPortfolio(projectId, validUrl || undefined);
      setShowUrlModal(false);
      setProjectUrl("");

      toast({
        title: "Project added to portfolio!",
        description: `"${project?.title}" has been moved to your completed projects.`,
      });

      // Navigate back to projects page
      setTimeout(() => {
        navigate("/projects");
      }, 1500);
    }
  };

  const cancelAddToPortfolio = () => {
    setShowUrlModal(false);
    setProjectUrl("");
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "medium":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400";
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  // Function to generate a simple AI response based on user input
  const generateAIResponse = (
    userMessage: string,
    projectTitle: string,
  ): string => {
    const lowerCaseMessage = userMessage.toLowerCase();

    if (
      lowerCaseMessage.includes("start") ||
      lowerCaseMessage.includes("begin") ||
      lowerCaseMessage.includes("how")
    ) {
      return `To start with the ${projectTitle} project, I recommend following these steps:\n\n1. First, set up your development environment.\n2. Create the basic project structure.\n3. Follow the task checklist on the right side.\n\nWould you like me to help you with any specific part of the project?`;
    }

    if (
      lowerCaseMessage.includes("code") ||
      lowerCaseMessage.includes("example")
    ) {
      return `Here's a simple code example to get you started:\n\n\`\`\`javascript\n// Example code for ${projectTitle}\nfunction initializeProject() {\n  console.log("Starting project setup...");\n  // Project initialization code\n  return true;\n}\n\n// Call the function\ninitializeProject();\n\`\`\`\n\nYou can modify this according to your project needs. Would you like me to explain how this code works?`;
    }

    if (
      lowerCaseMessage.includes("help") ||
      lowerCaseMessage.includes("stuck")
    ) {
      return `I'd be happy to help! What specific part of the ${projectTitle} project are you stuck on? I can provide guidance on:\n\n- Project setup\n- Implementation details\n- Debugging issues\n- Best practices\n\nJust let me know what you need assistance with!`;
    }

    return `That's an interesting question about the ${projectTitle} project. Could you provide more details about what you're trying to accomplish? I'm here to help you with implementation details, suggest approaches, or debug any issues you're facing.`;
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const completedTasksCount = tasks.filter((task) => task.completed).length;
  const progressPercentage =
    tasks.length > 0
      ? Math.round((completedTasksCount / tasks.length) * 100)
      : 0;
  const isProjectCompleted =
    completedTasksCount === tasks.length && tasks.length > 0;

  // Check if this project is already in completed projects (CV projects)
  const isAlreadyCompleted = cvProjects.some((p) => p.id === projectId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/projects")}
          className="gap-1 text-slate-900 dark:text-zinc-100"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
          {project.title}
        </h1>
        <Badge
          className={getDifficultyColor(project.difficulty)}
          variant="outline"
        >
          {project.difficulty.charAt(0).toUpperCase() +
            project.difficulty.slice(1)}
        </Badge>
        {isProjectCompleted && (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            <Trophy className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )}
        {isAlreadyCompleted && (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            In Portfolio
          </Badge>
        )}
      </div>

      <p className="text-muted-foreground">{project.description}</p>

      <div className="flex flex-wrap gap-2">
        {project.tags
          .filter((tag) => !["completed", "custom"].includes(tag))
          .map((tag) => (
            <Badge key={tag} variant="secondary" className="rounded-full">
              {tag}
            </Badge>
          ))}
      </div>

      {/* Project URL Modal */}
      <Dialog open={showUrlModal} onOpenChange={setShowUrlModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Add Project to Portfolio
            </DialogTitle>
            <DialogDescription>
              Congratulations on completing this project! You can optionally
              provide a link to your project.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="projectUrl" className="text-sm font-medium">
                Project URL (optional)
              </Label>
              <Input
                id="projectUrl"
                placeholder="https://github.com/username/project or https://your-demo.com"
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Link to your GitHub repository, live demo, or project page
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={cancelAddToPortfolio}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={confirmAddToPortfolio} className="flex-1">
              Add to Portfolio
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="h-5 w-5" /> Project Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 px-6 max-h-[450px]">
                <div className="space-y-4 pb-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          message.sender === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {message.sender === "assistant" ? (
                            <Bot className="h-4 w-4" />
                          ) : (
                            <UserIcon className="h-4 w-4" />
                          )}
                          <span className="text-xs font-medium">
                            {message.sender === "assistant"
                              ? "AI Assistant"
                              : "You"}
                          </span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {new Date(message.timestamp).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                        </div>
                        <div className="whitespace-pre-wrap">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted">
                        <div className="flex items-center gap-2 mb-1">
                          <Bot className="h-4 w-4" />
                          <span className="text-xs font-medium">
                            AI Assistant
                          </span>
                        </div>
                        <div className="flex space-x-2 items-center h-6">
                          <div
                            className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
                            style={{ animationDelay: "200ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
                            style={{ animationDelay: "400ms" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>

              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Ask a question about your project..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="min-h-[60px] resize-none"
                  />
                  <Button
                    onClick={handleSendMessage}
                    size="icon"
                    disabled={newMessage.trim() === "" || loading}
                    className="h-auto"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Wrench className="h-5 w-5" /> Required Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {project.requiredTools.map((tool) => (
                  <Badge key={tool} variant="outline">
                    {tool}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" /> Project Tasks
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      isProjectCompleted ? "bg-green-600" : "bg-blue-600"
                    }`}
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <span>{progressPercentage}% Complete</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-start gap-2">
                    <Checkbox
                      id={task.id}
                      checked={task.completed}
                      onCheckedChange={() => toggleTaskCompletion(task.id)}
                    />
                    <label
                      htmlFor={task.id}
                      className={`text-sm leading-tight ${
                        task.completed
                          ? "line-through text-muted-foreground"
                          : ""
                      }`}
                    >
                      {task.title}
                    </label>
                  </div>
                ))}
              </div>

              {isProjectCompleted && !isAlreadyCompleted && (
                <Button
                  onClick={handleAddToPortfolio}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Add to Portfolio
                </Button>
              )}

              {isAlreadyCompleted && (
                <div className="w-full p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md text-center">
                  <div className="flex items-center justify-center gap-2 text-blue-700 dark:text-blue-300">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Already in Portfolio
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" /> Session
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Started</span>
                <span className="text-sm">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Messages</span>
                <span className="text-sm">{messages.length}</span>
              </div>
              <Separator />
              <Button
                variant="outline"
                size="sm"
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                onClick={() => {
                  setTasks(getProjectTasks(projectId || ""));
                  setMessages(getInitialMessages(project.title));
                  toast({
                    title: "Progress reset",
                    description: "Your project progress has been reset.",
                  });
                }}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reset Progress
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
