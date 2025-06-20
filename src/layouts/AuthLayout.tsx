import React from "react";
import { Link } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center from-blue-50 to-indigo-100 dark:bg-[#525252] p-4">
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>
      </div>

      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-[#313131] rounded-lg shadow-lg">
        <div className="text-center space-y-4">
          {/* App Logo */}
          <div className="flex justify-center">
            <img
              src={theme === "light" ? "/logo-light.png" : "/logo-dark.png"}
              alt="CareerCompass.io"
              className="h-16 w-auto"
            />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {children}
      </div>

      <footer className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
        <div className="space-x-4">
          <Link
            to="/about"
            className="hover:text-blue-600 dark:hover:text-blue-400"
          >
            About
          </Link>
          <Link
            to="/contact"
            className="hover:text-blue-600 dark:hover:text-blue-400"
          >
            Contact
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 dark:hover:text-blue-400"
          >
            GitHub
          </a>
          <Link
            to="/terms"
            className="hover:text-blue-600 dark:hover:text-blue-400"
          >
            Terms
          </Link>
        </div>
        <div className="mt-2">
          &copy; {new Date().getFullYear()} CareerCompass.io. All rights
          reserved.
        </div>
      </footer>
    </div>
  );
}
