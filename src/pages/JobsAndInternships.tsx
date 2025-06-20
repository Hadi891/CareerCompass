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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Job } from "@/types";
import {
  Search,
  Briefcase,
  Building,
  MapPin,
  ExternalLink,
  Calendar,
} from "lucide-react";

// Mock data for jobs
const mockJobs: Job[] = [
  {
    id: "1",
    title: "Frontend Developer",
    company: "TechCorp Inc.",
    location: "New York, NY (Remote)",
    tags: ["React", "JavaScript", "CSS", "Remote"],
    description:
      "We're looking for a Frontend Developer to join our team and help build responsive user interfaces using React and modern JavaScript.",
    url: "https://example.com/job1",
    postedDate: "2023-06-15",
  },
  {
    id: "2",
    title: "Backend Engineer",
    company: "DataSystems Ltd.",
    location: "San Francisco, CA",
    tags: ["Node.js", "Express", "MongoDB", "On-site"],
    description:
      "Join our backend team to develop scalable APIs and services using Node.js and MongoDB.",
    url: "https://example.com/job2",
    postedDate: "2023-06-10",
  },
  {
    id: "3",
    title: "Full Stack Developer",
    company: "WebSolutions Co.",
    location: "Chicago, IL (Hybrid)",
    tags: ["React", "Node.js", "PostgreSQL", "Hybrid"],
    description:
      "Looking for a Full Stack Developer to work on both frontend and backend aspects of our web applications.",
    url: "https://example.com/job3",
    postedDate: "2023-06-05",
  },
  {
    id: "4",
    title: "React Native Developer",
    company: "MobileApps Inc.",
    location: "Austin, TX (Remote)",
    tags: ["React Native", "JavaScript", "Mobile", "Remote"],
    description:
      "We need a React Native developer to help build cross-platform mobile applications.",
    url: "https://example.com/job4",
    postedDate: "2023-06-01",
  },
  {
    id: "5",
    title: "DevOps Engineer",
    company: "CloudTech Solutions",
    location: "Seattle, WA",
    tags: ["AWS", "Docker", "CI/CD", "On-site"],
    description:
      "Join our DevOps team to manage cloud infrastructure and improve our deployment processes.",
    url: "https://example.com/job5",
    postedDate: "2023-05-25",
  },
  {
    id: "6",
    title: "UI/UX Designer",
    company: "CreativeDesign Studio",
    location: "Los Angeles, CA (Remote)",
    tags: ["Figma", "UI/UX", "Design Systems", "Remote"],
    description:
      "Looking for a UI/UX Designer to create beautiful and functional interfaces for our web and mobile applications.",
    url: "https://example.com/job6",
    postedDate: "2023-05-20",
  },
  {
    id: "7",
    title: "Data Scientist Intern",
    company: "AnalyticsPro",
    location: "Boston, MA (Hybrid)",
    tags: ["Python", "Machine Learning", "Internship", "Hybrid"],
    description:
      "Summer internship opportunity for data science students to work on real-world machine learning projects.",
    url: "https://example.com/job7",
    postedDate: "2023-05-15",
  },
  {
    id: "8",
    title: "Frontend Engineering Intern",
    company: "StartupHub",
    location: "Miami, FL (Remote)",
    tags: ["React", "JavaScript", "Internship", "Remote"],
    description:
      "Exciting internship opportunity to gain hands-on experience building modern web applications with React.",
    url: "https://example.com/job8",
    postedDate: "2023-05-10",
  },
];

export default function JobsAndInternships() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // Extract unique job types for filter dropdown
  const allTypes = Array.from(
    new Set(
      mockJobs.flatMap((job) =>
        job.tags.filter((tag) =>
          ["Remote", "On-site", "Internship"].includes(tag),
        ),
      ),
    ),
  ).sort();

  // Filter jobs based on search term and type only
  const filteredJobs = mockJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const matchesType = typeFilter === "all" || job.tags.includes(typeFilter);

    return matchesSearch && matchesType;
  });

  // Format date to relative time (e.g., "2 days ago")
  const getRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-4 text-slate-900 dark:text-zinc-100">
          Opportunities Matching Your Profile
        </h1>
        <p className="text-muted-foreground">
          These job and internship opportunities are tailored to match your
          skills and experience.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by title, company, or skills..."
            className="pl-8 text-slate-900 dark:text-zinc-100"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px] text-slate-900 dark:text-zinc-100">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {allTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No jobs found matching your criteria.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{job.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex items-center gap-2 mb-3">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{job.company}</span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{job.location}</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {job.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="rounded-full"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                <p className="text-muted-foreground text-sm mb-4">
                  {job.description}
                </p>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Posted {getRelativeDate(job.postedDate)}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center"
                  >
                    Apply <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
