import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ProjectsProvider } from "@/context/ProjectsContext";
import { ModeProvider } from "@/context/ModeContext";
import { MainLayout } from "@/layouts/MainLayout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CVUpload from "./pages/CVUpload";
import ProfileVerification from "./pages/ProfileVerification";
import Dashboard from "./pages/Dashboard";
import SkillsAndCourses from "./pages/SkillsAndCourses";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import JobsAndInternships from "./pages/JobsAndInternships";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <ProjectsProvider>
          <ModeProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/cv-upload" element={<CVUpload />} />
                  <Route
                    path="/profile-verification"
                    element={<ProfileVerification />}
                  />

                  {/* Protected routes */}
                  <Route element={<MainLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route
                      path="/skills-courses"
                      element={<SkillsAndCourses />}
                    />
                    <Route path="/projects" element={<Projects />} />
                    <Route
                      path="/projects/:projectId"
                      element={<ProjectDetails />}
                    />
                    <Route path="/jobs" element={<JobsAndInternships />} />
                  </Route>

                  {/* Catch-all route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </ModeProvider>
        </ProjectsProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);
export default App;
