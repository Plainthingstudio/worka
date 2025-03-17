
import React from 'react';
import { Layout } from '@/components/Layout';
import { useLeads } from '@/hooks/leads/useLeads';
import KanbanBoard from '@/components/leads/KanbanBoard';
import { useSidebarWidth } from '@/hooks/useSidebarWidth';

const Leads = () => {
  const { leads, isLoading, addLead, updateLead, deleteLead } = useLeads();
  const { isSidebarExpanded } = useSidebarWidth();

  return (
    <Layout title="Leads & Pipeline">
      <div 
        className={`w-full h-full transition-all duration-300 ease-in-out ${
          isSidebarExpanded ? "ml-0 md:ml-56" : "ml-0 md:ml-14"
        }`}
      >
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
