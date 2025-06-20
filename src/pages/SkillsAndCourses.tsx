import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  ExternalLink,
  Search,
  BookOpen,
  GraduationCap,
  Clock,
  BarChart2,
} from "lucide-react";

// Mock data for skills and courses
const mockSkills = [
  { id: "1", name: "React", category: "Frontend" },
  { id: "2", name: "Node.js", category: "Backend" },
  { id: "3", name: "TypeScript", category: "Language" },
  { id: "4", name: "MongoDB", category: "Database" },
  { id: "5", name: "Docker", category: "DevOps" },
  { id: "6", name: "Kubernetes", category: "DevOps" },
  { id: "7", name: "AWS", category: "Cloud" },
  { id: "8", name: "GraphQL", category: "API" },
];

const mockCourses = [
  {
    id: "1",
    title: "Advanced React Patterns",
    platform: "Udemy",
    description:
      "Learn advanced React patterns and best practices for building scalable applications.",
    url: "https://udemy.com",
    skillId: "1",
    duration: "10 hours",
    level: "advanced" as const,
  },
  {
    id: "2",
    title: "Node.js - The Complete Guide",
    platform: "Coursera",
    description:
      "Comprehensive guide to building backend applications with Node.js and Express.",
    url: "https://coursera.org",
    skillId: "2",
    duration: "24 hours",
    level: "intermediate" as const,
  },
  {
    id: "3",
    title: "TypeScript Masterclass",
    platform: "Frontend Masters",
    description: "Master TypeScript and learn to build type-safe applications.",
    url: "https://frontendmasters.com",
    skillId: "3",
    duration: "8 hours",
    level: "intermediate" as const,
  },
  {
    id: "4",
    title: "MongoDB - From Basics to Advanced",
    platform: "edX",
    description:
      "Learn MongoDB from the ground up and master advanced concepts.",
    url: "https://edx.org",
    skillId: "4",
    duration: "15 hours",
    level: "beginner" as const,
  },
  {
    id: "5",
    title: "Docker and Containerization",
    platform: "Pluralsight",
    description:
      "Learn Docker and containerization principles for modern application deployment.",
    url: "https://pluralsight.com",
    skillId: "5",
    duration: "12 hours",
    level: "intermediate" as const,
  },
  {
    id: "6",
    title: "Kubernetes for Developers",
    platform: "LinkedIn Learning",
    description:
      "Understand Kubernetes concepts and how to deploy applications to Kubernetes clusters.",
    url: "https://linkedin.com/learning",
    skillId: "6",
    duration: "18 hours",
    level: "advanced" as const,
  },
  {
    id: "7",
    title: "AWS Certified Developer",
    platform: "A Cloud Guru",
    description:
      "Prepare for the AWS Certified Developer Associate exam and learn AWS services.",
    url: "https://acloudguru.com",
    skillId: "7",
    duration: "30 hours",
    level: "intermediate" as const,
  },
  {
    id: "8",
    title: "GraphQL API Development",
    platform: "Udemy",
    description: "Learn to build efficient GraphQL APIs for your applications.",
    url: "https://udemy.com",
    skillId: "8",
    duration: "14 hours",
    level: "intermediate" as const,
  },
];

export default function SkillsAndCourses() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Filter courses based on search term and active tab
  const filteredCourses = mockCourses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    return matchesSearch && course.level === activeTab;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "intermediate":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "advanced":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-4 text-slate-900 dark:text-zinc-100">
          Skill Gaps & Learning Recommendations
        </h1>
        <p className="text-muted-foreground">
          Based on your CV analysis, we've identified skills you should develop
          and curated relevant courses.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-900 dark:text-zinc-100">
          <BookOpen className="h-5 w-5" /> Missing Skills
        </h2>
        <div className="flex flex-wrap gap-2">
          {mockSkills.map((skill) => (
            <Badge
              key={skill.id}
              variant="outline"
              className="px-3 py-1 text-sm text-slate-900 dark:text-zinc-100 border-slate-300 dark:border-zinc-100"
            >
              {skill.name}
              <span className="ml-2 text-xs text-muted-foreground">
                ({skill.category})
              </span>
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-900 dark:text-zinc-100">
            <GraduationCap className="h-5 w-5" /> Suggested Courses
          </h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search courses..."
              className="pl-8 text-slate-900 dark:text-zinc-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Levels</TabsTrigger>
            <TabsTrigger value="beginner">Beginner</TabsTrigger>
            <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="mt-6">
            {filteredCourses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No courses found matching your search criteria.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCourses.map((course) => (
                  <Card key={course.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="flex items-center justify-between mb-3">
                        <Badge>{course.platform}</Badge>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getLevelColor(course.level)}`}
                        >
                          {course.level.charAt(0).toUpperCase() +
                            course.level.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {course.description}
                      </p>
                      <div className="flex gap-4 mt-4">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          {course.duration}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <BarChart2 className="mr-1 h-3 w-3" />
                          {
                            mockSkills.find(
                              (skill) => skill.id === course.skillId,
                            )?.name
                          }
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full">
                        <a
                          href={course.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center"
                        >
                          Enroll <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
