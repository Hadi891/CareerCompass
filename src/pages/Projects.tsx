import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Project } from "@/types";
import { useProjects } from "@/context/ProjectsContext";
import { useMode } from "@/context/ModeContext";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Code,
  Cpu,
  ArrowRight,
  Timer,
  Wrench,
  Plus,
  X,
  CheckCircle2,
  ExternalLink,
  Github,
} from "lucide-react";

export default function Projects() {
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [currentTech, setCurrentTech] = useState("");
  const { cvProjects, suggestedProjects, addCustomProject } = useProjects();
  const { mode } = useMode();
  const { toast } = useToast();

  // Check if we're in Rule-Based mode
  const isRuleBasedMode = mode === "Rule-Based";

  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    difficulty: "",
    estimatedTime: "",
  });

  // Combine all projects for filtering
  const allProjects = [...cvProjects, ...suggestedProjects];

  // Extract unique tags for filter dropdown
  const allTags = Array.from(
    new Set(allProjects.flatMap((project) => project.tags)),
  ).sort();

  // Filter CV projects
  const filteredCvProjects = cvProjects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDifficulty =
      difficultyFilter === "all" || project.difficulty === difficultyFilter;

    const matchesTag = tagFilter === "all" || project.tags.includes(tagFilter);

    return matchesSearch && matchesDifficulty && matchesTag;
  });

  // Filter suggested projects
  const filteredSuggestedProjects = suggestedProjects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDifficulty =
      difficultyFilter === "all" || project.difficulty === difficultyFilter;

    const matchesTag = tagFilter === "all" || project.tags.includes(tagFilter);

    return matchesSearch && matchesDifficulty && matchesTag;
  });

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setNewProject((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDifficultyChange = (value: string) => {
    setNewProject((prev) => ({
      ...prev,
      difficulty: value,
    }));
  };

  const addTechnology = () => {
    if (currentTech.trim() && !technologies.includes(currentTech.trim())) {
      setTechnologies([...technologies, currentTech.trim()]);
      setCurrentTech("");
    }
  };

  const removeTechnology = (techToRemove: string) => {
    setTechnologies(technologies.filter((tech) => tech !== techToRemove));
  };

  const handleTechKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTechnology();
    }
  };

  const resetForm = () => {
    setNewProject({
      title: "",
      description: "",
      difficulty: "",
      estimatedTime: "",
    });
    setTechnologies([]);
    setCurrentTech("");
  };

  const handleSave = () => {
    // Validate form
    if (!newProject.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Project name is required",
        variant: "destructive",
      });
      return;
    }

    if (!newProject.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Project description is required",
        variant: "destructive",
      });
      return;
    }

    if (!newProject.difficulty) {
      toast({
        title: "Validation Error",
        description: "Please select a difficulty level",
        variant: "destructive",
      });
      return;
    }

    // Create new project object
    const customProject: Project = {
      id: `custom-${Date.now()}`,
      title: newProject.title,
      description: newProject.description,
      tags: ["custom", ...technologies.map((tech) => tech.toLowerCase())],
      difficulty: newProject.difficulty as "easy" | "medium" | "hard",
      requiredTools: technologies,
    };

    // Add to suggested projects using context
    addCustomProject(customProject);

    // Reset form and close modal
    resetForm();
    setIsModalOpen(false);

    toast({
      title: "Project Created",
      description: `"${newProject.title}" has been added to your projects`,
    });
  };

  const handleCancel = () => {
    resetForm();
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-4 text-slate-900 dark:text-zinc-100">
            Projects
          </h1>
          <p className="text-muted-foreground">
            View your completed projects from your CV and discover new project
            ideas to enhance your skills.
          </p>
        </div>

        {!isRuleBasedMode && (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-md hover:shadow-lg transition-shadow">
                <Plus className="h-4 w-4" />
                Add New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Recommend a New Project
                </DialogTitle>
                <DialogDescription>
                  Create a custom project idea to add to your list of suggested
                  projects.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Project Name */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Project Name *
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter project name"
                    value={newProject.title}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description *
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe what this project involves and what you'll learn..."
                    value={newProject.description}
                    onChange={handleInputChange}
                    className="min-h-[100px] w-full resize-none"
                  />
                </div>

                {/* Technologies / Tools */}
                <div className="space-y-2">
                  <Label htmlFor="technologies" className="text-sm font-medium">
                    Technologies / Tools
                  </Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        id="technologies"
                        placeholder="Add a technology (e.g., React, Node.js)"
                        value={currentTech}
                        onChange={(e) => setCurrentTech(e.target.value)}
                        onKeyDown={handleTechKeyDown}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addTechnology}
                        disabled={!currentTech.trim()}
                      >
                        Add
                      </Button>
                    </div>
                    {technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {technologies.map((tech, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="gap-1"
                          >
                            {tech}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 ml-1 hover:bg-transparent"
                              onClick={() => removeTechnology(tech)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Difficulty Level */}
                <div className="space-y-2">
                  <Label htmlFor="difficulty" className="text-sm font-medium">
                    Difficulty Level *
                  </Label>
                  <Select
                    value={newProject.difficulty}
                    onValueChange={handleDifficultyChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Beginner</SelectItem>
                      <SelectItem value="medium">Intermediate</SelectItem>
                      <SelectItem value="hard">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Estimated Time */}
                <div className="space-y-2">
                  <Label
                    htmlFor="estimatedTime"
                    className="text-sm font-medium"
                  >
                    Estimated Time
                  </Label>
                  <Input
                    id="estimatedTime"
                    name="estimatedTime"
                    placeholder="e.g., 2 weeks, 1 month, 3 days"
                    value={newProject.estimatedTime}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} className="flex-1">
                  Save Project
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search projects..."
            className="pl-8 text-slate-900 dark:text-zinc-100"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-full sm:w-[180px] text-slate-900 dark:text-zinc-100">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>

        <Select value={tagFilter} onValueChange={setTagFilter}>
          <SelectTrigger className="w-full sm:w-[180px] text-slate-900 dark:text-zinc-100">
            <SelectValue placeholder="Tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            {allTags.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* CV-Extracted Projects Section - Hidden in Rule-Based mode */}
      {!isRuleBasedMode && filteredCvProjects.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
              Your Completed Projects ({filteredCvProjects.length})
            </h2>
          </div>
          <p className="text-muted-foreground -mt-2">
            Projects you've completed and added to your portfolio
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            {filteredCvProjects.map((project) => (
              <Card
                key={project.id}
                className="overflow-hidden border-l-4 border-l-green-500"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{project.title}</CardTitle>
                    <div className="flex gap-2">
                      <Badge
                        className={getDifficultyColor(project.difficulty)}
                        variant="outline"
                      >
                        {project.difficulty.charAt(0).toUpperCase() +
                          project.difficulty.slice(1)}
                      </Badge>
                      <Badge
                        variant="default"
                        className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <p className="text-muted-foreground mb-4">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags
                      .filter((tag) => tag !== "completed")
                      .map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="rounded-full"
                        >
                          {tag}
                        </Badge>
                      ))}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Wrench className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Technologies Used:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {project.requiredTools.map((tool) => (
                        <Badge key={tool} variant="outline">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  {project.projectUrl ? (
                    <Button asChild className="w-full">
                      <a
                        href={project.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Project
                      </a>
                    </Button>
                  ) : (
                    <Button disabled className="w-full">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Project
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Projects Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Code className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
            Suggested Projects ({filteredSuggestedProjects.length})
          </h2>
        </div>
        <p className="text-muted-foreground -mt-2">
          New project ideas tailored to help you build your portfolio and
          enhance your skills
        </p>

        {filteredSuggestedProjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No suggested projects found matching your criteria.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredSuggestedProjects.map((project) => (
              <Card key={project.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{project.title}</CardTitle>
                    <div className="flex gap-2">
                      <Badge
                        className={getDifficultyColor(project.difficulty)}
                        variant="outline"
                      >
                        {project.difficulty.charAt(0).toUpperCase() +
                          project.difficulty.slice(1)}
                      </Badge>
                      {project.tags.includes("custom") && (
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                        >
                          Custom
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <p className="text-muted-foreground mb-4">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags
                      .filter((tag) => tag !== "custom")
                      .map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="rounded-full"
                        >
                          {tag}
                        </Badge>
                      ))}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Wrench className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Required Tools:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {project.requiredTools.map((tool) => (
                        <Badge key={tool} variant="outline">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                {!isRuleBasedMode && (
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link
                        to={`/projects/${project.id}`}
                        className="flex items-center justify-center"
                      >
                        Start Project <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
