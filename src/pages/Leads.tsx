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
  const {
    isSidebarExpanded
  } = useSidebarWidth();
  return <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 w-full transition-all duration-300 ease-in-out ml-56 overflow-hidden">
        <Navbar title="Leads & Pipeline" />
        <main className="container mx-auto p-6">
          <KanbanBoard leads={leads} isLoading={isLoading} onAddLead={addLead} onUpdateLead={updateLead} onDeleteLead={deleteLead} viewMode={viewMode} onViewModeChange={setViewMode} />
        </main>
      </div>
    </div>;
};
export default Leads;