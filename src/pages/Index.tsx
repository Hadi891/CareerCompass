import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Redirect to login page by default
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      // If user is authenticated, redirect to dashboard or CV upload based on CV status
      if (user?.hasUploadedCV) {
        navigate("/dashboard");
      } else {
        navigate("/cv-upload");
      }
    }
  }, [navigate, isAuthenticated, user]);

  // Show a brief loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-slate-800 flex items-center justify-center gap-3">
          <svg
            className="animate-spin h-8 w-8 text-slate-400"
            viewBox="0 0 50 50"
          >
            <circle
              className="opacity-30"
              cx="25"
              cy="25"
              r="20"
              stroke="currentColor"
              strokeWidth="5"
              fill="none"
            />
            <circle
              className="text-slate-600"
              cx="25"
              cy="25"
              r="20"
              stroke="currentColor"
              strokeWidth="5"
              fill="none"
              strokeDasharray="100"
              strokeDashoffset="75"
            />
          </svg>
          Redirecting...
        </h1>
      </div>
    </div>
  );
};

export default Index;
