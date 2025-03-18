
import React, { useState } from "react";
import { useLeads } from '@/hooks/leads/useLeads';
import KanbanBoard from '@/components/leads/KanbanBoard';
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { useSidebarWidth } from "@/hooks/useSidebarWidth";

const Leads = () => {
  const {
    leads,
    isLoading,
    addLead,
    updateLead,
    deleteLead
  } = useLeads();
  
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const { isSidebarExpanded } = useSidebarWidth();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className={`flex-1 flex flex-col w-full transition-all duration-300 ease-in-out ${isSidebarExpanded ? "ml-56" : "ml-14"}`}>
        <Navbar title="Leads & Pipeline" />
        <main className="flex-1 container mx-auto px-4 py-6 max-w-[1600px]">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Leads & Pipeline</h1>
            <p className="text-muted-foreground">Manage your leads through the sales pipeline.</p>
          </div>
          
          <KanbanBoard 
            leads={leads} 
            isLoading={isLoading} 
            onAddLead={addLead} 
            onUpdateLead={updateLead} 
            onDeleteLead={deleteLead} 
            viewMode={viewMode} 
            onViewModeChange={setViewMode} 
          />
        </main>
      </div>
    </div>
  );
};

export default Leads;
