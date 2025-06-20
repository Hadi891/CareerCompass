import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";

export function MainLayout() {
  const { user, isAuthenticated, isLoading, needsProfileVerification } =
    useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to CV upload if user hasn't uploaded CV yet
  if (user && !user.hasUploadedCV) {
    return <Navigate to="/cv-upload" replace />;
  }

  // Redirect to profile verification if needed
  if (needsProfileVerification) {
    return <Navigate to="/profile-verification" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#525252]">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-6 max-w-7xl text-slate-900">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
