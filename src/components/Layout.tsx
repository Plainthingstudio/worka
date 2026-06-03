
import React, { ReactNode, useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export const Layout = ({ children, title }: LayoutProps) => {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth >= 1024;
  });
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth >= 1024;
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const handleViewportChange = (event: MediaQueryListEvent) => {
      setIsDesktop(event.matches);
      if (event.matches) {
        setIsSidebarExpanded(true);
      } else {
        setIsMobileSidebarOpen(false);
      }
    };

    setIsDesktop(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleViewportChange);
    return () => mediaQuery.removeEventListener("change", handleViewportChange);
  }, []);

  const sidebarOffsetClass = isDesktop
    ? isSidebarExpanded
      ? "pl-56"
      : "pl-16"
    : "pl-0";

  return (
    <div className="app-charcoal min-h-screen bg-surface-2">
      {isDesktop ? (
        <Sidebar expanded={isSidebarExpanded} onExpandedChange={setIsSidebarExpanded} />
      ) : isMobileSidebarOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40"
            aria-label="Close sidebar"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <Sidebar
            expanded
            onExpandedChange={(nextExpanded) => {
              if (!nextExpanded) setIsMobileSidebarOpen(false);
            }}
            onNavigate={() => setIsMobileSidebarOpen(false)}
          />
        </>
      ) : null}
      <div
        className={`w-full transition-all duration-300 ease-in-out ${sidebarOffsetClass}`}
      >
        <div className="min-h-screen pt-0 sm:pt-3">
          <div
            className="app-shell-frame min-h-screen overflow-hidden bg-card sm:min-h-[calc(100vh-12px)] sm:rounded-tl-lg sm:border sm:border-r-0 sm:border-b-0 sm:border-border-soft"
          >
            <Navbar
              title={title || ""}
              onMenuClick={!isDesktop ? () => setIsMobileSidebarOpen(true) : undefined}
            />
            <main className="app-shell-content w-full overflow-auto bg-card">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};
