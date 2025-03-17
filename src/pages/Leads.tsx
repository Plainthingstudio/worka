
import React from 'react';
import { Layout } from '@/components/Layout';
import { useLeads } from '@/hooks/leads/useLeads';
import KanbanBoard from '@/components/leads/KanbanBoard';

const Leads = () => {
  const { leads, isLoading, addLead, updateLead, deleteLead } = useLeads();

  return (
    <Layout title="Leads & Pipeline">
      <div className="container mx-auto py-6 h-[calc(100vh-4rem)]">
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
