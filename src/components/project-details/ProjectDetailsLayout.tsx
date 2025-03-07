
import React from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useSidebarState } from "@/hooks/useSidebarState";

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
  loadingMessage = "Loading project details..."
}: ProjectDetailsLayoutProps) => {
  const { isSidebarExpanded } = useSidebarState();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className={`flex-1 w-full transition-all duration-300 ease-in-out ${
        isSidebarExpanded ? "ml-56" : "ml-14"
      }`}>
        <Navbar title={title} />
        <main className="container mx-auto p-6">
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
  );
};

export default ProjectDetailsLayout;
