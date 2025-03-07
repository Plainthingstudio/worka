
import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "./ThemeProvider";
import { ThemeToggle } from "./ThemeToggle";

const Sidebar = () => {
  const [expanded, setExpanded] = useState(true);
  const location = useLocation();
  const { theme } = useTheme();

  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  const navItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/dashboard",
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
        theme === "dark" 
          ? "bg-background/90 text-foreground backdrop-blur-sm" 
          : "bg-white"
      )}
    >
      <div className="flex h-14 items-center justify-between px-3">
        {expanded ? (
          <div className="flex items-center space-x-2">
            <div className="h-7 w-7 rounded-full bg-primary" />
            <span className="text-md font-semibold">Studio</span>
          </div>
        ) : (
          <div className="mx-auto h-7 w-7 rounded-full bg-primary" />
        )}
        <button
          onClick={toggleSidebar}
          className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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

      <div className="border-t border-border p-2 space-y-2">
        <div className={cn("flex", expanded ? "justify-between items-center px-2" : "justify-center")}>
          {expanded && <span className="text-sm text-muted-foreground">Theme</span>}
          <ThemeToggle className={expanded ? "" : "mx-auto"} />
        </div>
        
        <NavLink
          to="/auth"
          className="flex items-center rounded-md px-2 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground"
          onClick={() => {
            localStorage.removeItem("isLoggedIn");
          }}
        >
          <LogOut
            className={cn("h-4 w-4", expanded ? "mr-3" : "mx-auto")}
          />
          {expanded && <span>Logout</span>}
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
