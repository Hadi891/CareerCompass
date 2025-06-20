import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";

export default function CVUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileError, setFileError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setFile(selectedFile);
      } else {
        setFile(null);
        setFileError("Please upload a PDF or DOCX file");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
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

      // Simulate API call to update user profile
      setTimeout(() => {
        setUploading(false);

        // Update the user in auth context
        if (user) {
          user.hasUploadedCV = true;
          user.cvFilename = file.name;
          // Update user in localStorage
          localStorage.setItem("user", JSON.stringify(user));
        }

        toast({
          title: "CV uploaded successfully",
          description:
            "Your CV has been processed and we've analyzed your profile",
        });

        // Always redirect to profile verification for first-time CV upload
        // The profile verification page will check if already verified
        navigate("/profile-verification");
      }, 500);
    }, 2000);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center from-blue-50 to-indigo-100 dark:bg-[#525252] p-4">
      <div className="w-full max-w-2xl p-8 bg-white dark:bg-[#313131] rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-50">
            Welcome! Let's Start by Understanding You
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Upload your CV so we can analyze your skills and experience to
            provide personalized recommendations.
          </p>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center transition-colors
            ${fileError ? "border-red-300 bg-red-50 dark:bg-red-900/10" : ""}
            ${file ? "border-green-300 bg-green-50 dark:bg-green-900/10" : "border-slate-300 hover:border-blue-400 dark:border-slate-700 dark:hover:border-blue-500"}
            ${uploading ? "bg-blue-50 dark:bg-blue-900/10" : ""}`}
          onClick={!uploading ? triggerFileInput : undefined}
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDrop={(e) => {
            e.preventDefault();
            if (!uploading && e.dataTransfer.files && e.dataTransfer.files[0]) {
              const droppedFile = e.dataTransfer.files[0];
              const fileType = droppedFile.type;

              if (
                fileType === "application/pdf" ||
                fileType ===
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              ) {
                setFile(droppedFile);
                setFileError(null);
              } else {
                setFileError("Please upload a PDF or DOCX file");
              }
            }
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            disabled={uploading}
          />

          {!file && !uploading && (
            <div className="space-y-4 cursor-pointer">
              <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  PDF or DOCX (max. 5MB)
                </p>
              </div>
            </div>
          )}

          {file && !uploading && (
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <FileText className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {file.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          )}

          {uploading && (
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                {uploadProgress < 100 ? (
                  <div className="h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
                ) : (
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                )}
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {uploadProgress < 100
                    ? "Uploading..."
                    : "Processing your CV..."}
                </p>
                <div className="mt-2 w-full">
                  <Progress value={uploadProgress} className="h-2" />
                </div>
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

        <div className="flex justify-center">
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full sm:w-auto"
          >
            {uploading ? "Uploading..." : "Upload CV"}
          </Button>
        </div>
      </div>
    </div>
  );
}
