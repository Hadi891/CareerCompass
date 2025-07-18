// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { User } from "@/types";

// point all axios calls at your FastAPI backend
axios.defaults.baseURL = "http://127.0.0.1:8000";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login(email: string, password: string, remember: boolean): Promise<void>;
  signup(email: string, password: string, name: string): Promise<void>;
  refreshUser(): Promise<void>;     // ← add this
  logout(): void;
  markProfileVerified(): Promise<void>;
  needsProfileVerification: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // pull initial flag out of localStorage:
  const [profileVerified, setProfileVerified] = useState<boolean>(
    () => localStorage.getItem("profileVerified") === "true"
  );

  const needsProfileVerification = Boolean(
    user?.hasUploadedCV && !profileVerified
  )

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      axios
        .get<User>("/auth/me")
        .then((res) => {
          setUser(res.data);
        })
        .catch(() => {
          setUser({} as User);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const refreshUser = async () => {
    try {
      const res = await axios.get<User>("/auth/me");
      setUser(res.data);
    } catch {
      setUser({} as User);
    }
  };

  const login = async (
    email: string,
    password: string,
    remember: boolean
  ) => {
    setIsLoading(true);
    try {
      const res = await axios.post<{ access_token: string }>("/auth/login", {
        email,
        password,
      });
      const jwt = res.data.access_token;
      axios.defaults.headers.common["Authorization"] = `Bearer ${jwt}`;
      if (remember) localStorage.setItem("token", jwt);
      await refreshUser();
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      await axios.post("/auth/signup", { email, password, name });
      await login(email, password, true);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
  };

  const markProfileVerified = async () => {
    // e.g. set a flag in localStorage
    localStorage.setItem("profileVerified", "true");
    setProfileVerified(true)
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        refreshUser,    // ← expose here
        logout,
        markProfileVerified,
        needsProfileVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
