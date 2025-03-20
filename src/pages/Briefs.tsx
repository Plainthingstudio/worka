
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import BriefsContainer from "@/components/briefs/BriefsContainer";
import { useBriefs } from "@/hooks/useBriefs";

const Briefs = () => {
  const { 
    briefs, 
    setBriefs, 
    filter, 
    setFilter, 
    search, 
    setSearch, 
    filteredBriefs, 
    isLoading, 
    fetchBriefs, 
    deleteBrief,
    clearLocalBriefs
  } = useBriefs();
  
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  useEffect(() => {
    const handleSidebarChange = () => {
      const sidebarElement = document.querySelector('[class*="w-56"], [class*="w-14"]');
      setIsSidebarExpanded(sidebarElement?.classList.contains('w-56') || false);
    };

    handleSidebarChange();

    const observer = new MutationObserver(handleSidebarChange);
    const sidebarElement = document.querySelector('[class*="flex flex-col border-r"]');
    
    if (sidebarElement) {
      observer.observe(sidebarElement, { attributes: true, attributeFilter: ['class'] });
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div 
        className={`flex-1 w-full transition-all duration-300 ease-in-out ${
          isSidebarExpanded ? "pl-56" : "pl-14"
        }`}
      >
        <Navbar title="Briefs" />
        <main className="container py-6">
          <BriefsContainer
            briefs={briefs}
            setBriefs={setBriefs}
            filter={filter}
            setFilter={setFilter}
            search={search}
            setSearch={setSearch}
            filteredBriefs={filteredBriefs}
            isLoading={isLoading}
            fetchBriefs={fetchBriefs}
            deleteBrief={deleteBrief}
            clearLocalBriefs={clearLocalBriefs}
          />
        </main>
      </div>
    </div>
  );
};

export default Briefs;
