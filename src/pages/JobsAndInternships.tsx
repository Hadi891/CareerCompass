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
    title: "Software Engineer Back-End",
    company: "Bayt.com",
    location: "Beirut · Lebanon (Remote)",
    tags: [ "Node.js", "Express", "MongoDB", "Remote"],
    description:
      "Seeking a Back-End Software Engineer in Beirut. Key responsibilities include executing SDLC, developing code, and troubleshooting systems. Requires a degree and 1-3 years experience.",
    url: "https://www.bayt.com/en/lebanon/jobs/full-stack-developer-jobs/?jobId=5348991",
    postedDate: "2023-06-15",
  },
  {
    id: "2",
    title: "Full Stack Developer",
    company: "Valsoft Corporation",
    location: "Beirut · Lebanon",
    tags: ["React", "JavaScript", "CSS", "Node.js", "Express", "MongoDB", "On-site"],
    description:
      "We’re seeking a Full Stack Developer with a strong interest or growing experience in AI-driven applications. You’ll contribute to projects that blend modern web development with intelligent features, from AI-enhanced dashboards to real-time APIs.",
    url: "https://www.bayt.com/en/lebanon/jobs/full-stack-developer-jobs/?jobId=73104717",
    postedDate: "2023-06-10",
  },
  {
    id: "5",
    title: "DevOps Engineer",
    company: "MUREX S.A.S",
    location: "Beirut · Lebanon",
    tags: ["AWS", "Docker", "CI/CD", "On-site"],
    description:
      "Join our DevOps team to manage cloud infrastructure and improve our deployment processes.",
    url: "https://www.bayt.com/en/lebanon/jobs/devops-jobs/?jobId=73093251",
    postedDate: "2023-05-25",
  },
  {
    id: "6",
    title: "DevOps Engineer",
    company: "Siren Associates",
    location: "Beirut · Lebanon",
    tags: ["AWS", "Docker", "CI/CD", "On-site"],
    description:
      "We are seeking a DevOps Engineer to join our team in Beirut. As a key member of our infrastructure team, you'll be responsible for setting up, managing, and monitoring our VMware infrastructure, implementing CI/CD processes using GitHub, and automating development processes.",
    url: "https://www.bayt.com/en/lebanon/jobs/devops-jobs/?jobId=73027679",
    postedDate: "2023-05-20",
  },
  {
    id: "7",
    title: "Senior Data Scientist I",
    company: "Careem",
    location: "Beirut · Lebanon (Hybrid)",
    tags: ["Python", "Machine Learning", "Hybrid"],
    description:
      "We offer colleagues the opportunity to drive impact in the region while they learn and grow.",
    url: "https://www.bayt.com/en/lebanon/jobs/data-science-jobs/?jobId=73109304",
    postedDate: "2023-05-15",
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
