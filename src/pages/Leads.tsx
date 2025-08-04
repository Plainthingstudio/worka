
import React, { useState } from "react";
import { useLeads } from '@/hooks/leads/useLeads';
import KanbanBoard from '@/components/leads/KanbanBoard';

const Leads = () => {
  const {
    leads,
    isLoading,
    addLead,
    updateLead,
    deleteLead
  } = useLeads();
  
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  return (
    <main className="flex-1 container mx-auto px-3 py-6 max-w-[1400px]">
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
  );
};

export default Leads;
