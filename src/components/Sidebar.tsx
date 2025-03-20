import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  ChevronLeft,
  Users,
  FileText,
  FileEdit,
  BarChart,
  UserRound,
  Settings,
  FolderKanban
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "./ThemeProvider";
import { ThemeToggle } from "./ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Sidebar = () => {
  const [expanded, setExpanded] = useState(true);
  const { theme } = useTheme();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  const handleLogout = async () => {
    try {
      // First clear localStorage to immediately update UI state
      localStorage.removeItem("isLoggedIn");
      
      // Then perform the actual sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // Navigate to auth page after successful logout
      navigate("/auth", { replace: true });
      
      toast.success("Successfully logged out");
    } catch (error: any) {
      toast.error(error.message || "Failed to log out");
      console.error("Logout error:", error);
    }
  };

  const navItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      icon: FolderKanban,
      label: "Leads & Pipeline",
      href: "/leads",
    },
    {
      icon: Users,
      label: "Clients",
      href: "/clients",
    },
    {
      icon: ListChecks,
      label: "Projects",
      href: "/projects",
    },
    {
      icon: UserRound,
      label: "Team",
      href: "/team",
    },
    {
      icon: FileText,
      label: "Invoices",
      href: "/invoices",
    },
    {
      icon: FileEdit,
      label: "Briefs",
      href: "/briefs",
    },
    {
      icon: BarChart,
      label: "Statistics",
      href: "/statistics",
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/settings",
    },
  ];

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border transition-all duration-300 ease-in-out",
        expanded ? "w-56" : "w-14",
        "bg-sidebar text-sidebar-foreground"
      )}
    >
      <div className="flex h-14 items-center justify-between px-3">
        {expanded ? (
          <div className="flex items-center space-x-2">
            <div className="h-7 w-7 rounded-full bg-sidebar-primary shadow-lg shadow-sidebar-primary/30" />
            <span className="text-md font-semibold">Studio</span>
          </div>
        ) : (
          <div className="mx-auto h-7 w-7 rounded-full bg-sidebar-primary shadow-lg shadow-sidebar-primary/30" />
        )}
        <button
          onClick={toggleSidebar}
          className="rounded-md p-1 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          {expanded ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-3">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center rounded-md px-2 py-2 text-sm font-medium transition-all",
                isActive
                  ? "bg-sidebar-primary/20 text-sidebar-primary dark:bg-sidebar-primary/10 dark:text-sidebar-primary dark:shadow-md dark:shadow-sidebar-primary/5"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )
            }
          >
            <item.icon
              className={cn("h-4 w-4", expanded ? "mr-3" : "mx-auto")}
            />
            {expanded && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-sidebar-border/50 p-2 space-y-2">
        <div className={cn("flex", expanded ? "justify-between items-center px-2" : "justify-center")}>
          {expanded && <span className="text-sm text-sidebar-foreground/70">Theme</span>}
          <ThemeToggle className={expanded ? "" : "mx-auto"} />
        </div>
        
        <button
          onClick={handleLogout}
          className="flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-sidebar-foreground/70 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut
            className={cn("h-4 w-4", expanded ? "mr-3" : "mx-auto")}
          />
          {expanded && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
