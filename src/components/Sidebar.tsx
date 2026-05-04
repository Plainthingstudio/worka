
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
  FolderKanban,
  CheckSquare,
  Package
} from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "./Logo";
import { account } from "@/integrations/appwrite/client";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";

const BRAND_NAME_COLOR = "#1D3485";
const BRAND_SUBTITLE_COLOR = "#77706A";
const CARD_SHADOW = "0px 1px 2px rgba(10,13,20,0.0314)";

const Sidebar = () => {
  const [expanded, setExpanded] = useState(true);
  const navigate = useNavigate();
  const { userRole, canViewTeam, canViewProjects } = useUserRole();

  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem("isLoggedIn");
      await account.deleteSession('current');
      navigate("/auth", { replace: true });
      toast.success("Successfully logged out");
    } catch (error: any) {
      toast.error(error.message || "Failed to log out");
      console.error("Logout error:", error);
    }
  };

  const getAllNavItems = () => [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", roles: ['owner', 'administrator', 'team'] },
    { icon: FolderKanban,    label: "Leads & Pipeline", href: "/leads", roles: ['owner', 'administrator'] },
    { icon: Users,           label: "Clients", href: "/clients", roles: ['owner', 'administrator'] },
    { icon: Package,         label: "Services", href: "/services", roles: ['owner', 'administrator'] },
    { icon: ListChecks,      label: "Projects", href: "/projects", roles: ['owner', 'administrator'] },
    { icon: CheckSquare,     label: "Tasks", href: "/tasks", roles: ['owner', 'administrator', 'team'] },
    { icon: UserRound,       label: "Team", href: "/team", roles: ['owner', 'administrator', 'team'] },
    { icon: FileText,        label: "Invoices", href: "/invoices", roles: ['owner', 'administrator'] },
    { icon: FileEdit,        label: "Briefs", href: "/briefs", roles: ['owner', 'administrator'] },
    { icon: BarChart,        label: "Statistics", href: "/statistics", roles: ['owner', 'administrator'] },
    { icon: Settings,        label: "Settings", href: "/settings", roles: ['owner', 'administrator', 'team'] },
  ];

  const navItems = getAllNavItems().filter(item => {
    if (!userRole) return false;
    const canSeeItem = userRole === 'owner' || userRole === 'administrator';
    if (canSeeItem) return true;
    return item.roles.includes(userRole);
  });

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out bg-sidebar",
        expanded ? "w-56" : "w-16"
      )}
      style={{ borderRight: "none", borderImage: "none", boxSizing: "content-box" }}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between",
          expanded ? "px-3" : "px-2 justify-center"
        )}
        style={{ height: 65 }}
      >
        {expanded ? (
          <>
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Logo size={40} />
              <div className="flex flex-col justify-center min-w-0">
                <span
                  className="leading-tight truncate text-foreground dark:text-foreground"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                    fontSize: 14,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Worka
                </span>
                <span
                  className="truncate text-muted-foreground"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                    fontSize: 12,
                    lineHeight: "16px",
                    letterSpacing: "-0.03em",
                  }}
                >
                  Plainthing Studio
                </span>
              </div>
            </div>
            <button
              onClick={toggleSidebar}
              className="flex items-center justify-center shrink-0 transition-colors hover:bg-sidebar-accent bg-card border border-sidebar-border"
              style={{
                width: 24,
                height: 24,
                boxShadow: CARD_SHADOW,
                borderRadius: 6,
              }}
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="text-muted-foreground" style={{ width: 16, height: 16 }} strokeWidth={1.67} />
            </button>
          </>
        ) : (
          <Logo size={36} />
        )}
      </div>

      {/* Divider */}
      <div className="bg-sidebar-border" style={{ height: 1 }} />

      {!expanded && (
        <button
          onClick={toggleSidebar}
          className="mx-auto mt-2 flex items-center justify-center transition-colors hover:bg-sidebar-accent bg-card border border-sidebar-border"
          style={{
            width: 28,
            height: 28,
            boxShadow: CARD_SHADOW,
            borderRadius: 6,
          }}
          aria-label="Expand sidebar"
        >
          <Menu className="text-muted-foreground" style={{ width: 16, height: 16 }} strokeWidth={1.67} />
        </button>
      )}

      {/* Navigation */}
      <nav
        className={cn("flex-1 overflow-y-auto", expanded ? "px-2" : "px-2")}
        style={{ paddingTop: 12, paddingBottom: 0, display: "flex", flexDirection: "column", gap: 2 }}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            title={!expanded ? item.label : undefined}
            className={({ isActive }) =>
              cn(
                "flex items-center transition-colors",
                expanded ? "" : "justify-center",
                isActive
                  ? "bg-card border border-sidebar-border"
                  : "hover:bg-sidebar-accent"
              )
            }
            style={({ isActive }) => {
              const base: React.CSSProperties = {
                gap: 8,
                padding: expanded ? "8px 12px" : "8px",
                height: isActive ? 38 : 36,
                borderRadius: isActive ? 8 : 7,
                WebkitTapHighlightColor: "transparent",
              };
              if (isActive) base.boxShadow = CARD_SHADOW;
              return base;
            }}
            onClick={(e) => {
              if (window.location.pathname === item.href) {
                e.preventDefault();
              }
            }}
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={isActive ? "text-brand-accent" : "text-muted-foreground"}
                  style={{
                    width: 16,
                    height: 16,
                    flexShrink: 0,
                  }}
                  strokeWidth={1.67}
                />
                {expanded && (
                  <span
                    className={cn(
                      "truncate",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                      fontSize: 14,
                      lineHeight: "135%",
                      letterSpacing: "-0.03em",
                    }}
                  >
                    {item.label}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Motivational Card */}
      {expanded && (
        <div className="flex justify-center pt-2 pb-2">
          <div
            className="flex flex-col justify-end items-start"
            style={{
              width: 191,
              height: 192,
              padding: 16,
              gap: 10,
              background: "linear-gradient(180deg, #BFDBFE 0%, #3D67FB 100%)",
              borderRadius: 20,
            }}
          >
            <div
              className="flex items-center justify-center shrink-0"
              style={{
                width: 48,
                height: 48,
                background: "#FFFFFF",
                borderRadius: 9999,
              }}
            >
              <span style={{ fontSize: 20, lineHeight: "28px" }}>😆</span>
            </div>
            <div
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                fontSize: 20,
                lineHeight: "28px",
                color: "#FFFFFF",
              }}
            >
              Kurangi sambat, ayo semangat!
            </div>
          </div>
        </div>
      )}

      {/* Logout */}
      <div
        className={cn(expanded ? "px-2" : "px-2", "border-t border-sidebar-border")}
        style={{
          paddingTop: 9,
          paddingBottom: 9,
        }}
      >
        <button
          onClick={handleLogout}
          title={!expanded ? "Logout" : undefined}
          className={cn(
            "flex w-full items-center transition-colors hover:bg-sidebar-accent text-muted-foreground",
            expanded ? "" : "justify-center"
          )}
          style={{
            gap: 12,
            padding: 8,
            height: 36,
            borderRadius: 10,
          }}
        >
          <LogOut
            style={{ width: 16, height: 16, flexShrink: 0 }}
            strokeWidth={1.67}
          />
          {expanded && (
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                fontSize: 14,
                lineHeight: "20px",
              }}
            >
              Logout
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
