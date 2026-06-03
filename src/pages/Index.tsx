
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Dashboard from "./Dashboard";

export default function Index() {
  const navigate = useNavigate();
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth >= 1024;
  });
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth >= 1024;
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Check if user is logged in, redirect to login if not
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      navigate("/auth");
    }
  }, [navigate]);

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
      ? "ml-56"
      : "ml-16"
    : "ml-0";

  return (
    <div className="flex min-h-screen bg-background">
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
        className={`flex-1 w-full transition-all duration-300 ease-in-out ${sidebarOffsetClass}`}
      >
        <Navbar
          title="Dashboard"
          onMenuClick={!isDesktop ? () => setIsMobileSidebarOpen(true) : undefined}
        />
        <main className="p-4 sm:p-6">
          <Dashboard />
        </main>
      </div>
    </div>
  );
}
