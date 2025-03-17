
import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { useLeads } from '@/hooks/leads/useLeads';
import KanbanBoard from '@/components/leads/KanbanBoard';
import { useSidebarWidth } from "@/hooks/useSidebarWidth";
import { Layout } from "@/components/Layout";

const Leads = () => {
  const { leads, isLoading, addLead, updateLead, deleteLead } = useLeads();
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  return (
    <Layout title="Leads & Pipeline">
      <KanbanBoard
        leads={leads}
        isLoading={isLoading}
        onAddLead={addLead}
        onUpdateLead={updateLead}
        onDeleteLead={deleteLead}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
    </Layout>
  );
};

export default Leads;
