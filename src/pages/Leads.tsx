
import React, { useState } from "react";
import { useLeads } from '@/hooks/leads/useLeads';
import KanbanBoard from '@/components/leads/KanbanBoard';
import { Layout } from "@/components/Layout";

const Leads = () => {
  const { leads, isLoading, addLead, updateLead, deleteLead } = useLeads();
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  return (
    <Layout title="Leads & Pipeline">
      <main className="h-[calc(100vh-64px)] overflow-hidden">
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
    </Layout>
  );
};

export default Leads;
