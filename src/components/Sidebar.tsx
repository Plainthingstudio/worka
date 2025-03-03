
import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ListChecks,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const [expanded, setExpanded] = useState(true);
  const location = useLocation();

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
  ];

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-white transition-all duration-300 ease-in-out",
        expanded ? "w-64" : "w-20"
      )}
    >
      <div className="flex h-16 items-center justify-between px-4">
        {expanded ? (
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary" />
            <span className="text-lg font-semibold">Studio</span>
          </div>
        ) : (
          <div className="mx-auto h-8 w-8 rounded-full bg-primary" />
        )}
        <button
          onClick={toggleSidebar}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
        >
          {expanded ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            <item.icon
              className={cn("h-5 w-5", expanded ? "mr-3" : "mx-auto")}
            />
            {expanded && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <NavLink
          to="/auth"
          className="flex items-center rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
        >
          <LogOut
            className={cn("h-5 w-5", expanded ? "mr-3" : "mx-auto")}
          />
          {expanded && <span>Logout</span>}
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
