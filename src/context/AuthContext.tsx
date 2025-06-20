import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  needsProfileVerification: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  markProfileVerified: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for demonstration purposes
const mockUser: User = {
  id: "1",
  name: "Jane Doe",
  email: "jane@example.com",
  avatarUrl: undefined,
  bio: "Software developer with 3 years of experience",
  location: "New York, USA",
  linkedin: "linkedin.com/in/janedoe",
  hasUploadedCV: false,
  domain: "Software Development",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsProfileVerification, setNeedsProfileVerification] =
    useState(false);

  useEffect(() => {
    // Check if user is stored in localStorage (for "remember me" functionality)
    const storedUser = localStorage.getItem("user");
    const profileVerified = localStorage.getItem("profileVerified");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // Check if user needs profile verification
      if (parsedUser.hasUploadedCV && !profileVerified) {
        setNeedsProfileVerification(true);
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, remember: boolean) => {
    setIsLoading(true);

    try {
      // In a real app, this would be an API call to authenticate the user
      // Simulating API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For demo purposes, we'll just set a mock user
      const authenticatedUser = { ...mockUser, email };

      setUser(authenticatedUser);

      if (remember) {
        localStorage.setItem("user", JSON.stringify(authenticatedUser));
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);

    try {
      // In a real app, this would be an API call to register the user
      // Simulating API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For demo purposes, we'll just set a mock user with the provided name and email
      const newUser = { ...mockUser, name, email, hasUploadedCV: false };

      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const markProfileVerified = () => {
    localStorage.setItem("profileVerified", "true");
    setNeedsProfileVerification(false);
  };

  const logout = () => {
    setUser(null);
    setNeedsProfileVerification(false);
    localStorage.removeItem("user");
    localStorage.removeItem("profileVerified");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        needsProfileVerification,
        login,
        signup,
        logout,
        markProfileVerified,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
