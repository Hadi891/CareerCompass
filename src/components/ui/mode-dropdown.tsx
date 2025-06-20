import React from "react";
import { ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMode, Mode } from "@/context/ModeContext";
import { cn } from "@/lib/utils";

interface ModeDropdownProps {
  className?: string;
}

export function ModeDropdown({ className }: ModeDropdownProps) {
  const { mode, setMode } = useMode();

  const handleModeChange = (value: string) => {
    setMode(value as Mode);
  };

  return (
    <div className={cn("w-full", className)}>
      <Select value={mode} onValueChange={handleModeChange}>
        <SelectTrigger className="h-9 bg-sidebar-accent/50 border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
          <div className="flex items-center justify-between w-full">
            <span className="text-sm font-medium">Mode: {mode}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="AI" className="text-sm">
            AI
          </SelectItem>
          <SelectItem value="Rule-Based" className="text-sm">
            Rule-Based
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
