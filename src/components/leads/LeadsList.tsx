
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
  onInlineUpdate: (id: string, fields: Partial<Lead>) => void;
  stages: LeadStage[];
}

const LeadsList: React.FC<LeadsListProps> = ({
  leads,
  isLoading,
  onDelete,
  onStageChange,
  onInlineUpdate,
  stages,
}) => {
  return (
    <div className="w-full h-full overflow-auto rounded-md px-0">
      <KickoffLeadProcessor leads={leads} />

      {(leads.length === 0 || isLoading) ? (
        <EmptyLeadsState isLoading={isLoading} />
      ) : (
        <LeadsTable
          leads={leads}
          stages={stages}
          onDelete={onDelete}
          onStageChange={onStageChange}
          onInlineUpdate={onInlineUpdate}
        />
      )}
    </div>
  );
};

export default LeadsList;
