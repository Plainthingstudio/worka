
import React, { ReactNode, useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export const Layout = ({ children, title }: LayoutProps) => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  useEffect(() => {
    const sidebarElement = document.querySelector('[class*="flex flex-col"][class*="fixed inset-y-0 left-0"]');

    const handleSidebarChange = () => {
      if (!sidebarElement) return;
      setIsSidebarExpanded(sidebarElement.classList.contains('w-56'));
    };

    handleSidebarChange();

    const observer = new MutationObserver(handleSidebarChange);
    if (sidebarElement) {
      observer.observe(sidebarElement, { attributes: true, attributeFilter: ['class'] });
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
            className="bg-card min-h-[calc(100vh-12px)] overflow-hidden border border-border-soft border-r-0 border-b-0 rounded-tl-lg"
          >
            <Navbar title={title || ""} />
            <main className="w-full overflow-auto bg-card">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};
