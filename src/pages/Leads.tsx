import React, { useState } from "react";
import { useLeads } from '@/hooks/leads/useLeads';
import { useLeadsFilter } from '@/hooks/leads/useLeadsFilter';
import KanbanBoard from '@/components/leads/KanbanBoard';

const Leads = () => {
  const {
    leads,
    isLoading,
    addLead,
    updateLead,
    deleteLead
  } = useLeads();

  const {
    search,
    setSearch,
    monthFilter,
    setMonthFilter,
    quarterFilter,
    setQuarterFilter,
    yearFilter,
    setYearFilter,
    availableYears,
    filteredLeads
  } = useLeadsFilter(leads);

  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  return (
    <main className="flex-1 w-full py-6 px-[24px]">
      <KanbanBoard 
        leads={filteredLeads} 
        isLoading={isLoading} 
        onAddLead={addLead} 
        onUpdateLead={updateLead} 
        onDeleteLead={deleteLead} 
        viewMode={viewMode} 
        onViewModeChange={setViewMode}
        search={search}
        setSearch={setSearch}
        monthFilter={monthFilter}
        setMonthFilter={setMonthFilter}
        quarterFilter={quarterFilter}
        setQuarterFilter={setQuarterFilter}
        yearFilter={yearFilter}
        setYearFilter={setYearFilter}
        availableYears={availableYears}
      />
    </main>
  );
};
export default Leads;
