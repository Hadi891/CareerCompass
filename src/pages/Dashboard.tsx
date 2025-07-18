import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Edit,
  Save,
  FileText,
  Code,
  BookOpen,
  Briefcase,
  BookMarked,
  CheckCircle2,
  MapPin,
  Linkedin,
  X,
  Eye,
  Upload,
  RefreshCw,
  AlertCircle,
  Calendar,
  GraduationCap,
  Building,
  Github,
  Star,
  Award,
  Camera,
} from "lucide-react";



export default function Dashboard() {
  interface CVParsed {
    meta: { name: string; email: string; phone: string; bio: string; linkedin: string | null; github: string | null; domain: string | null; };
    education: Array<{
      degree: string;
      university: string;
      location: string | null;
      gpa: string | null;
      description: string | null;
      start_date: string;
      end_date: string;
    }>;
    experience: Array<{
      role: string;
      company: string;
      location: string | null;
      date: string;
      description: string;
    }>;
    skills: Array<{ name: string }>;
    missing_skills: string[];
    projects: Array<{
      name: string;
      tools: string[];
      description: string;
      link: string | null;
    }>;
  }

  interface CVOut {
    id: number;
    filename: string;
    created_at: string;
    parsed: CVParsed;
  }
  const { user } = useAuth();
  const {
    data: cv,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["myCV"],
    queryFn: () => axios.get("/cv/me").then(res => res.data),
    enabled: !!user,
  });

  if (isLoading)  return <div>Loading your CV…</div>;
  if (isError || !cv) return <div>Couldn’t load your CV</div>;

  const { experience, education, skills, missing_skills } = cv.parsed;
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [skillsOpen, setSkillsOpen] = useState(false);
  const [updateCvOpen, setUpdateCvOpen] = useState(false);
  const [newCvFile, setNewCvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileError, setFileError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(
    user?.avatarUrl || null,
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const { meta } = cv.parsed;
  const [profileData, setProfileData] = useState({
    location:  "",
    bio:      meta.bio     ?? "",
    linkedin: meta.linkedin ?? "",
    github:   meta.github   ?? "",
  });

  console.log(meta.name, meta.email, meta.phone, meta.bio, meta.linkedin, meta.github, experience.role);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (JPG, PNG, GIF, etc.)",
          variant: "destructive", 
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      setImageFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerImageInput = () => {
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  };

  const handleSave = () => {
    // In a real app, this would make an API call to update the user's profile
    if (user) {
      user.bio = profileData.bio;
      user.location = profileData.location;
      user.linkedin = profileData.linkedin;

      // Update avatar URL if new image was selected
      if (profileImage && profileImage !== user.avatarUrl) {
        user.avatarUrl = profileImage;
      }

      // Update user in localStorage
      localStorage.setItem("user", JSON.stringify(user));
    }

    setEditing(false);

    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully",
    });
  };

  const handleCvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);

    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const fileType = selectedFile.type;

      // Check if file is PDF or DOCX
      if (
        fileType === "application/pdf" ||
        fileType ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        setNewCvFile(selectedFile);
      } else {
        setNewCvFile(null);
        setFileError("Please upload a PDF or DOCX file");
      }
    }
  };

  const handleUpdateCv = async () => {
    if (!newCvFile) {
      setFileError("Please select a file to upload");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    // Simulate file upload with progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    // Simulate upload completion after 2 seconds
    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);

      // Simulate API call to update user CV
      setTimeout(() => {
        setUploading(false);
        setNewCvFile(null);
        setUpdateCvOpen(false);
        setUploadProgress(0);

        // Update the user's CV filename
        if (user) {
          user.cvFilename = newCvFile.name;
        }

        toast({
          title: "CV updated successfully",
          description: "Your CV has been updated and re-analyzed",
        });
      }, 500);
    }, 2000);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Mock data for dashboard stats
  const stats = {
    totalSkills: skills.length,
    missingSkills: missing_skills.length,
    coursesRecommended: 12,
    projectsSuggested: 5,
    jobsFound: 18,
  };

  // Mock PDF URL - in a real app, this would be the actual URL to the user's CV
  const mockPdfUrl =
    "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

  return (
    <div className="space-y-8 text-slate-900">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
          Your Profile Overview
        </h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditing(!editing)}
          className="text-slate-900 dark:text-zinc-100"
        >
          {editing ? (
            <>
              <Save className="h-4 w-4 mr-2" /> Save
            </>
          ) : (
            <>
              <Edit className="h-4 w-4 mr-2" /> Edit Profile
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={profileImage || undefined}
                    alt={user?.name}
                  />
                  <AvatarFallback className="text-lg">
                    <User className="h-10 w-10 text-gray-400" />
                  </AvatarFallback>
                </Avatar>

                {editing && (
                  <>
                    <div
                      className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={triggerImageInput}
                    >
                      <Camera className="h-5 w-5 text-white" />
                    </div>

                    <input
                      type="file"
                      ref={imageInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </>
                )}
              </div>

              <div>
                <h3 className="text-xl font-semibold">{meta.name}</h3>
                <p className="text-muted-foreground">{user.email}</p>
                <Badge variant="outline" className="mt-2">
                  {meta.domain}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="bio"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <User className="h-4 w-4" /> Bio
                </Label>
                {editing ? (
                  <Input
                    id="bio"
                    name="bio"
                    placeholder="Tell us about yourself"
                    className="mt-1"
                    value={profileData.bio}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="text-sm mt-1">
                    {profileData.bio || "No bio provided yet."}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="location"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <MapPin className="h-4 w-4" /> Location
                </Label>
                {editing ? (
                  <Input
                    id="location"
                    name="location"
                    placeholder="Your location"
                    className="mt-1"
                    value={profileData.location}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="text-sm mt-1">
                    {profileData.location || "No location provided yet."}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="linkedin"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Linkedin className="h-4 w-4" /> LinkedIn
                </Label>
                {editing ? (
                  <Input
                    id="linkedin"
                    name="linkedin"
                    placeholder="Your LinkedIn profile URL"
                    className="mt-1"
                    value={profileData.linkedin}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="text-sm mt-1">
                    {profileData.linkedin ? (
                      <a
                        href={`https://${profileData.linkedin.replace(/^https?:\/\//, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {profileData.linkedin}
                      </a>
                    ) : (
                      "No LinkedIn profile provided yet."
                    )}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="github"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Github className="h-4 w-4" /> GitHub
                </Label>
                {editing ? (
                  <Input
                    id="github"
                    name="github"
                    placeholder="Your GitHub profile URL"
                    className="mt-1"
                    value={profileData.github}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="text-sm mt-1">
                    {profileData.github ? (
                      <a
                        href={`https://${profileData.github.replace(/^https?:\/\//, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {profileData.github}
                      </a>
                    ) : (
                      "No GitHub profile provided yet."
                    )}
                  </p>
                )}
              </div>

              {editing && (
                <Button onClick={handleSave} className="w-full mt-4">
                  Save Changes
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">CV Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Sheet open={pdfOpen} onOpenChange={setPdfOpen}>
              <SheetTrigger asChild>
                <div className="flex items-center gap-4 mb-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-3 rounded-md transition-colors">
                  <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                    <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">
                      {user?.cvFilename || "resume.pdf"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Uploaded on {new Date().toLocaleDateString()}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </SheetTrigger>
              <SheetContent side="right" className="w-[600px] sm:w-[800px] p-0">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {user?.cvFilename || "resume.pdf"}
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setPdfOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <iframe
                      src={mockPdfUrl}
                      className="w-full h-full border-0"
                      title="CV Preview"
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <div className="mb-6">
              <Dialog open={updateCvOpen} onOpenChange={setUpdateCvOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Update CV
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Update Your CV</DialogTitle>
                    <DialogDescription>
                      Upload a new version of your CV to update your profile
                      analysis.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
                        ${fileError ? "border-red-300 bg-red-50 dark:bg-red-900/10" : ""}
                        ${newCvFile ? "border-green-300 bg-green-50 dark:bg-green-900/10" : "border-gray-300 hover:border-blue-400 dark:border-gray-700 dark:hover:border-blue-500"}
                        ${uploading ? "bg-blue-50 dark:bg-blue-900/10" : ""}`}
                      onClick={!uploading ? triggerFileInput : undefined}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleCvFileChange}
                        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        className="hidden"
                        disabled={uploading}
                      />

                      {!newCvFile && !uploading && (
                        <div className="space-y-2">
                          <Upload className="h-8 w-8 mx-auto text-gray-400" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Click to select new CV file
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            PDF or DOCX (max. 5MB)
                          </p>
                        </div>
                      )}

                      {newCvFile && !uploading && (
                        <div className="space-y-2">
                          <FileText className="h-8 w-8 mx-auto text-green-600" />
                          <p className="font-medium">{newCvFile.name}</p>
                          <p className="text-xs text-gray-500">
                            {(newCvFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      )}

                      {uploading && (
                        <div className="space-y-4">
                          <div className="h-8 w-8 mx-auto rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
                          <div>
                            <p className="font-medium">
                              {uploadProgress < 100
                                ? "Uploading..."
                                : "Processing your CV..."}
                            </p>
                            <Progress value={uploadProgress} className="mt-2" />
                          </div>
                        </div>
                      )}

                      {fileError && (
                        <div className="mt-2 flex items-center text-red-600 dark:text-red-400 text-sm">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {fileError}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setUpdateCvOpen(false);
                          setNewCvFile(null);
                          setFileError(null);
                        }}
                        className="flex-1"
                        disabled={uploading}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleUpdateCv}
                        disabled={!newCvFile || uploading}
                        className="flex-1"
                      >
                        {uploading ? "Updating..." : "Update CV"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              <Dialog open={skillsOpen} onOpenChange={setSkillsOpen}>
                <DialogTrigger asChild>
                  <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-md transition-colors">
                    <div className="flex items-center gap-2">
                      <BookMarked className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <span>Total Skills Detected</span>
                    </div>
                    <Badge variant="secondary">{skills.length}</Badge>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Your Detected Skills ({skills.length})
                    </DialogTitle>
                    <DialogDescription>
                      These skills were automatically detected from your CV
                    </DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="max-h-[60vh] pr-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {skills.map((skill, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-center p-3 border rounded-lg bg-gray-50 dark:bg-gray-800"
                        >
                          <span className="font-medium text-sm">{skill.name}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <span>Missing Skills</span>
                </div>
                <Badge variant="secondary">{stats.missingSkills}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span>Courses Recommended</span>
                </div>
                <Badge variant="secondary">{stats.coursesRecommended}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span>Projects Suggested</span>
                </div>
                <Badge variant="secondary">{stats.projectsSuggested}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  <span>Job Links Found</span>
                </div>
                <Badge variant="secondary">{stats.jobsFound}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Experience Timeline */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Work Experience
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

            <div className="space-y-8">
              {experience.map((exp, index) => {
                const isCurrent = exp.date.toLowerCase().includes("present");
                return (
                <div key={index} className="relative pl-10">
                  {/* Timeline dot */}
                  <div
                    className={`absolute left-2 w-4 h-4 rounded-full border-2 ${
                      isCurrent
                        ? "bg-blue-600 border-blue-600"
                        : "bg-background border-border"
                    }`}
                  />

                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="font-semibold text-lg">{exp.role}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {exp.date} {/*- {exp.end_date}*/}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building className="h-4 w-4" />
                      <span className="font-medium">{exp.company}</span>
                      <span>•</span>
                      <span>{exp.location}</span>
                      {isCurrent && (
                        <Badge variant="secondary" className="ml-2">
                          Current
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Education Timeline */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Education
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

            <div className="space-y-8">
              {education.map((edu, index) => (
                <div key={index} className="relative pl-10">
                  {/* Timeline dot */}
                  <div className="absolute left-2 w-4 h-4 rounded-full bg-green-600 border-2 border-green-600" />

                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="font-semibold text-lg">{edu.degree}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {edu.start_date} - {edu.end_date}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building className="h-4 w-4" />
                      <span className="font-medium">{edu.university}</span>
                      <span>•</span>
                      <span>{edu.location}</span>
                      {edu.gpa && (
                        <>
                          <span>•</span>
                          <span>GPA: {edu.gpa}</span>
                        </>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {edu.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Link to="/skills-courses">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                Skill Gaps & Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View your missing skills and recommended courses to enhance your
                profile.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/projects">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Browse through suggested projects that will help you build your
                portfolio.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/jobs">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                Jobs & Internships
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Discover job opportunities that match your skills and
                experience.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
