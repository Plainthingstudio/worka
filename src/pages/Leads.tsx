
import React from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { useLeads } from '@/hooks/leads/useLeads';
import KanbanBoard from '@/components/leads/KanbanBoard';
import { useSidebarWidth } from "@/hooks/useSidebarWidth";

const Leads = () => {
  const { leads, isLoading, addLead, updateLead, deleteLead } = useLeads();
  const { isSidebarExpanded } = useSidebarWidth();

  return (
    <div className="flex min-h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className={`flex-1 flex flex-col w-full transition-all duration-300 ease-in-out ${isSidebarExpanded ? "ml-56" : "ml-14"}`}>
        <Navbar title="Leads & Pipeline" />
        <main className="flex-1 w-full overflow-hidden">
          <KanbanBoard
            leads={leads}
            isLoading={isLoading}
            onAddLead={addLead}
            onUpdateLead={updateLead}
            onDeleteLead={deleteLead}
          />
        </main>
      </div>
    </div>
  );
};

export default Leads;
