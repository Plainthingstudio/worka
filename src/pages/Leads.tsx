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
      <div className="flex-1 w-full transition-all duration-300 ease-in-out ml-14 ml-56">
        <Navbar title="Leads & Pipeline" />
        <main className="flex-1 container mx-auto p-4 md:p-6 overflow-hidden">
          <KanbanBoard leads={leads} isLoading={isLoading} onAddLead={addLead} onUpdateLead={updateLead} onDeleteLead={deleteLead} viewMode={viewMode} onViewModeChange={setViewMode} />
        </main>
      </div>
    </div>;
};
export default Leads;