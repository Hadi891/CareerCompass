import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Code,
  Briefcase,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeDropdown } from "@/components/ui/mode-dropdown";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

function NavItem({ to, icon, label, onClick }: NavItemProps) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
        )
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate("/login");
    setOpen(false);
  };

  const navItems = [
    {
      to: "/dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
      label: "Dashboard",
    },
    {
      to: "/skills-courses",
      icon: <BookOpen className="h-4 w-4" />,
      label: "Skill Gaps & Courses",
    },
    {
      to: "/projects",
      icon: <Code className="h-4 w-4" />,
      label: "Projects",
    },
    {
      to: "/jobs",
      icon: <Briefcase className="h-4 w-4" />,
      label: "Jobs & Internships",
    },
  ];

  const renderNavItems = (closeMenu?: () => void) => (
    <>
      {navItems.map((item) => (
        <NavItem
          key={item.to}
          to={item.to}
          icon={item.icon}
          label={item.label}
          onClick={closeMenu}
        />
      ))}
    </>
  );

  const renderSidebarContent = (closeMenu?: () => void) => (
    <div className="flex flex-col h-full">
      <div className="px-3 py-4">
        {/* App Logo */}
        <div className="flex items-center justify-center mb-6">
          <img
            src={theme === "light" ? "/logo-light.png" : "/logo-dark.png"}
            alt="CareerCompass.io"
            className="h-10 w-auto"
          />
        </div>

        <div className="flex items-center gap-3 mb-6">
          <Avatar>
            <AvatarImage src={user?.avatarUrl} alt={user?.name} />
            <AvatarFallback>
              <User className="h-5 w-5 text-gray-400" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-sidebar-foreground">
              {user?.name}
            </span>
            <span className="text-xs text-sidebar-foreground/60">
              {user?.email}
            </span>
          </div>
        </div>

        <nav className="space-y-1">{renderNavItems(closeMenu)}</nav>
      </div>

      <div className="mt-auto px-3 py-4 border-t border-sidebar-border space-y-4">
        <div className="space-y-2">
          <span className="text-sm text-sidebar-foreground">Mode</span>
          <ModeDropdown />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-sidebar-foreground">Theme</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="p-0 h-auto"
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4 text-sidebar-foreground" />
            ) : (
              <Sun className="h-4 w-4 text-sidebar-foreground" />
            )}
          </Button>
        </div>

        <Button
          variant="outline"
          className="w-full text-sidebar-foreground border-sidebar-border"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-sidebar border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-sidebar-foreground"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 bg-sidebar">
                {renderSidebarContent(() => setOpen(false))}
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2">
              <img
                src={theme === "light" ? "/logo-light.png" : "/logo-dark.png"}
                alt="CareerCompass.io"
                className="h-6 w-auto"
              />
              <span className="font-semibold text-sidebar-foreground">
                CareerCompass.io
              </span>
            </div>
          </div>

          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatarUrl} alt={user?.name} />
            <AvatarFallback>
              <User className="h-4 w-4 text-gray-400" />
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="h-16" />
      </>
    );
  }

  return (
    <div className="w-64 h-screen sticky top-0 overflow-y-auto bg-sidebar border-r border-sidebar-border">
      {renderSidebarContent()}
    </div>
  );
}
