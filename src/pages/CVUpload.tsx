// src/pages/CVUpload.tsx
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";

export default function CVUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileError, setFileError] = useState<string | null>(null);

  const { refreshUser, logout } = useAuth();            // only need refreshUser here
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");  // or wherever your login page lives
    } catch (err) {
      console.error("Logout failed", err);
      toast({
        title: "Logout failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const f = e.target.files?.[0] ?? null;
    if (!f) return setFile(null);

    if (
      f.type === "application/pdf" ||
      f.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      setFile(f);
    } else {
      setFile(null);
      setFileError("Please upload a PDF or DOCX file");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setFileError("Please select a file to upload");
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    let didSucceed = false;
    try {
      const form = new FormData();
      form.append("file", file);
      const resp = await axios.post("/cv/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          if (evt.total) {
            setUploadProgress(Math.round((evt.loaded / evt.total) * 100));
          }
        },
      });

      // success
      setUploadProgress(100);
      

      toast({
        title: "CV uploaded successfully",
        description:
          "Your CV has been processed and we'll guide you next.",
      });
      console.log("→ navigating to profile-verification");
      navigate("/profile-verification", { replace: true });
      await refreshUser();   // now hasUploadedCV is true in context
    } catch (err) {
      console.error("upload error", err);
      toast({
        title: "Upload failed",
        description: "We couldn't upload your CV. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-indigo-100 dark:bg-[#525252]">
      <div className="w-full max-w-2xl p-8 bg-white dark:bg-[#313131] rounded-lg shadow-lg">
        {/* header text omitted for brevity */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center
            ${fileError ? "border-red-300 bg-red-50" : ""}
            ${file ? "border-green-300 bg-green-50" : "border-gray-300 hover:border-blue-400"}
            ${uploading ? "bg-blue-50" : ""}`}
          onClick={!uploading ? triggerFileInput : undefined}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const dropped = e.dataTransfer.files?.[0];
            if (dropped) handleFileChange({ target: { files: [dropped] } } as any);
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />

          {/* render states */}
          {!file && !uploading && (
            <div className="space-y-4 cursor-pointer">
              <Upload className="mx-auto h-8 w-8 text-blue-600" />
              <p>Click or drag & drop to upload PDF/DOCX</p>
            </div>
          )}
          {file && !uploading && (
            <div className="space-y-2">
              <FileText className="mx-auto h-8 w-8 text-green-600" />
              <p>{file.name}</p>
            </div>
          )}
          {uploading && (
            <div className="space-y-4">
              {uploadProgress < 100 ? (
                <div className="mx-auto h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
              ) : (
                <CheckCircle className="mx-auto h-8 w-8 text-green-600" />
              )}
              <Progress value={uploadProgress} />
            </div>
          )}
          {fileError && (
            <div className="mt-2 text-red-600 flex items-center">
              <AlertCircle className="mr-1" /> {fileError}
            </div>
          )}
        </div>

        <Button
          type="button"
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full sm:w-auto"
        >
          {uploading ? "Uploading..." : "Upload CV"}
        </Button>
      </div>
      <div className="absolute top-4 right-4">
        <Button size="sm" variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  );
}
