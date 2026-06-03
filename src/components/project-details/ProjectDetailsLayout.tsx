
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

interface ProjectDetailsLayoutProps {
  title: string;
  children: React.ReactNode;
  isLoading?: boolean;
  loadingMessage?: string;
}

const ProjectDetailsLayout = ({
  title,
  children,
  isLoading = false,
  loadingMessage = "Loading project details...",
}: ProjectDetailsLayoutProps) => {
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
    <div className="min-h-screen bg-surface-2">
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
            className="min-h-screen overflow-hidden bg-card sm:min-h-[calc(100vh-12px)] sm:rounded-tl-lg sm:border sm:border-r-0 sm:border-b-0 sm:border-border-soft"
          >
            <Navbar
              title={title}
              onMenuClick={!isDesktop ? () => setIsMobileSidebarOpen(true) : undefined}
            />
            <main className="w-full overflow-auto bg-card px-4 py-4 sm:px-6 sm:py-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <p className="text-muted-foreground">{loadingMessage}</p>
                </div>
              ) : (
                children
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsLayout;
