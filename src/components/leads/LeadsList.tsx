
import React from 'react';
import { Lead, LeadStage } from '@/types';
import LeadsTable from './LeadsTable';
import EmptyLeadsState from './EmptyLeadsState';
import KickoffLeadProcessor from './KickoffLeadProcessor';

interface LeadsListProps {
  leads: Lead[];
  isLoading: boolean;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onStageChange: (id: string, stage: LeadStage) => void;
  stages: LeadStage[];
}

const LeadsList: React.FC<LeadsListProps> = ({
  leads,
  isLoading,
  onEdit,
  onDelete,
  onStageChange,
  stages
}) => {
  // Process leads in Kickoff stage (side effect only)
  return (
    <div className="w-full h-full overflow-auto rounded-md px-2">
      {/* Processor component for Kickoff leads */}
      <KickoffLeadProcessor leads={leads} />
      
      {/* Show empty state if no leads or loading */}
      {(leads.length === 0 || isLoading) ? (
        <EmptyLeadsState isLoading={isLoading} />
      ) : (
        <LeadsTable 
          leads={leads}
          stages={stages}
          onEdit={onEdit}
          onDelete={onDelete}
          onStageChange={onStageChange}
        />
      )}
    </div>
  );
};

export default LeadsList;
