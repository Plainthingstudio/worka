
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
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  useEffect(() => {
    const sidebarElement = document.querySelector(
      '[class*="flex flex-col"][class*="fixed inset-y-0 left-0"]'
    );

    const handleSidebarChange = () => {
      if (!sidebarElement) return;
      setIsSidebarExpanded(sidebarElement.classList.contains("w-56"));
    };

    handleSidebarChange();

    const observer = new MutationObserver(handleSidebarChange);
    if (sidebarElement) {
      observer.observe(sidebarElement, { attributes: true, attributeFilter: ["class"] });
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-surface-2">
      <Sidebar />
      <div
        className={`w-full transition-all duration-300 ease-in-out ${
          isSidebarExpanded ? "pl-56" : "pl-16"
        }`}
      >
        <div className="pt-3 min-h-screen">
          <div
            className="bg-card border border-border-soft min-h-[calc(100vh-12px)] overflow-hidden"
            style={{
              borderRadius: "8px 0 0 0",
              borderRight: "none",
              borderBottom: "none",
            }}
          >
            <Navbar title={title} />
            <main className="w-full overflow-auto bg-card px-6 py-6">
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
