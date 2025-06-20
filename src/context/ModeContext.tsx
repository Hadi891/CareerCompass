import React, { createContext, useContext, useState, useEffect } from "react";

export type Mode = "AI" | "Rule-Based";

interface ModeContextType {
  mode: Mode;
  setMode: (mode: Mode) => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>("AI");

  // Load mode from localStorage on component mount
  useEffect(() => {
    const savedMode = localStorage.getItem("mode") as Mode;
    if (savedMode && (savedMode === "AI" || savedMode === "Rule-Based")) {
      setMode(savedMode);
    }
  }, []);

  // Save mode to localStorage whenever it changes
  const handleSetMode = (newMode: Mode) => {
    setMode(newMode);
    localStorage.setItem("mode", newMode);
  };

  return (
    <ModeContext.Provider
      value={{
        mode,
        setMode: handleSetMode,
      }}
    >
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);

  if (context === undefined) {
    throw new Error("useMode must be used within a ModeProvider");
  }

  return context;
}
