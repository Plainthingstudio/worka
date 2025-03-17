
import React from "react";
import { useLeads } from '@/hooks/leads/useLeads';
import KanbanBoard from '@/components/leads/KanbanBoard';
import { Layout } from "@/components/Layout";

const Leads = () => {
  const { leads, isLoading, addLead, updateLead, deleteLead } = useLeads();

  return (
    <Layout title="Leads & Pipeline">
      <div className="h-full w-full overflow-hidden">
        <KanbanBoard
          leads={leads}
          isLoading={isLoading}
          onAddLead={addLead}
          onUpdateLead={updateLead}
          onDeleteLead={deleteLead}
        />
      </div>
    </Layout>
  );
};

export default Leads;
