import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  MapPin,
  Linkedin,
  Github,
  CheckCircle,
  ArrowRight,
  UserCircle,
  Award,
  Camera,
  Upload,
  X,
} from "lucide-react";

// Common domains/specializations for the dropdown
const commonDomains = [
  "Software Development",
  "Frontend Development",
  "Backend Development",
  "Full Stack Development",
  "Mobile Development",
  "Data Science",
  "Machine Learning",
  "DevOps",
  "Cloud Engineering",
  "Cybersecurity",
  "UI/UX Design",
  "Product Management",
  "Quality Assurance",
  "Database Administration",
  "Systems Architecture",
  "Game Development",
  "Blockchain Development",
  "Artificial Intelligence",
  "Web Development",
  "Software Engineering",
];

export default function ProfileVerification() {
  const { user, needsProfileVerification, isLoading, markProfileVerified } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profileImage, setProfileImage] = useState<string | null>(
    user?.avatarUrl || null,
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [profileData, setProfileData] = useState({
    name: user?.name || "Jane Doe",
    domain: user?.domain || "Software Development",
    bio: user?.bio || "Software developer with 3 years of experience",
    location: user?.location || "New York, USA",
    linkedin: user?.linkedin || "linkedin.com/in/janedoe",
    github: "github.com/janedoe",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDomainChange = (value: string) => {
    setProfileData((prev) => ({
      ...prev,
      domain: value,
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
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleConfirm = () => {
    // In a real app, this would make an API call to update the user's profile
    // including uploading the image to a cloud storage service
    if (user) {
      user.name = profileData.name;
      user.domain = profileData.domain;
      user.bio = profileData.bio;
      user.location = profileData.location;
      user.linkedin = profileData.linkedin;

      // Update avatar URL if new image was selected
      if (profileImage && profileImage !== user.avatarUrl) {
        user.avatarUrl = profileImage;
      } else if (!profileImage) {
        // Remove avatar if user removed the image
        user.avatarUrl = undefined;
      }

      // Update user in localStorage
      localStorage.setItem("user", JSON.stringify(user));
    }

    // Mark profile as verified
    markProfileVerified();

    toast({
      title: "Profile verified successfully!",
      description: "Your profile information has been confirmed and saved.",
    });

    // Redirect to dashboard after a brief delay
    setTimeout(() => {
      navigate("/dashboard");
    }, 1500);
  };

  // Redirect if already verified (shouldn't happen, but safety check)
  React.useEffect(() => {
  if (!isLoading && !needsProfileVerification) {
      navigate("/dashboard", { replace: true })
    } 
  }, [needsProfileVerification, isLoading, navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center from-blue-50 to-indigo-100 dark:bg-[#525252] p-4">
      <div className="w-full max-w-2xl p-8 bg-white dark:bg-[#313131] rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-50">
            Verify Your Profile Information
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            We've analyzed your CV and extracted the following information.
            Please review and make any necessary corrections.
          </p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Personal Information</CardTitle>
            <p className="text-sm text-muted-foreground">
              This information was automatically extracted from your CV
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Image Section */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={profileImage || undefined}
                    alt={profileData.name}
                  />
                  <AvatarFallback className="text-xl">
                    <User className="h-12 w-12 text-gray-400" />
                  </AvatarFallback>
                </Avatar>

                {/* Camera overlay */}
                <div
                  className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={triggerImageInput}
                >
                  <Camera className="h-6 w-6 text-white" />
                </div>

                {/* Remove image button */}
                {profileImage && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={removeImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />

              <div className="mt-3 space-y-2 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={triggerImageInput}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {profileImage ? "Change Photo" : "Upload Photo"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Recommended: Square image, max 5MB
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6">
              <div className="flex-1">
                <div className="space-y-3">
                  <div>
                    <Label
                      htmlFor="name"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <UserCircle className="h-4 w-4" /> Full Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Your full name"
                      className="mt-1"
                      value={profileData.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="domain"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <Award className="h-4 w-4" /> Professional Domain
                    </Label>
                    <Select
                      value={profileData.domain}
                      onValueChange={handleDomainChange}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select your domain" />
                      </SelectTrigger>
                      <SelectContent>
                        {commonDomains.map((domain) => (
                          <SelectItem key={domain} value={domain}>
                            {domain}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-3 text-sm text-muted-foreground">
                  {user?.email}
                </div>
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
                <Input
                  id="bio"
                  name="bio"
                  placeholder="Tell us about yourself"
                  className="mt-1"
                  value={profileData.bio}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label
                  htmlFor="location"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <MapPin className="h-4 w-4" /> Location
                </Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="Your location"
                  className="mt-1"
                  value={profileData.location}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label
                  htmlFor="linkedin"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Linkedin className="h-4 w-4" /> LinkedIn
                </Label>
                <Input
                  id="linkedin"
                  name="linkedin"
                  placeholder="Your LinkedIn profile URL"
                  className="mt-1"
                  value={profileData.linkedin}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label
                  htmlFor="github"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Github className="h-4 w-4" /> GitHub
                </Label>
                <Input
                  id="github"
                  name="github"
                  placeholder="Your GitHub profile URL"
                  className="mt-1"
                  value={profileData.github}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="pt-4">
              <div className="mb-4 p-4 bg-blue-50 dark:bg-[#525252] rounded-lg">
                <h3 className="font-medium text-blue-900 dark:text-slate-50 mb-2">
                  Preview
                </h3>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={profileImage || undefined}
                      alt={profileData.name}
                    />
                    <AvatarFallback>
                      <User className="h-6 w-6 text-gray-400" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-blue-900 dark:text-slate-50">
                      {profileData.name}
                    </div>
                    <Badge
                      variant="outline"
                      className="mt-1 text-blue-700 dark:text-gray-300"
                    >
                      {profileData.domain}
                    </Badge>
                  </div>
                </div>
              </div>

              <Button onClick={handleConfirm} className="w-full">
                Confirm & Continue to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
