
import React from 'react';
import { Lead, LeadStage } from '@/types';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import LeadRow from './LeadRow';

interface LeadsTableProps {
  leads: Lead[];
  stages: LeadStage[];
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onStageChange: (id: string, stage: LeadStage) => void;
}

const LeadsTable: React.FC<LeadsTableProps> = ({ 
  leads, 
  stages, 
  onEdit, 
  onDelete, 
  onStageChange 
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead className="hidden md:table-cell">Email</TableHead>
          <TableHead className="hidden lg:table-cell">Phone</TableHead>
          <TableHead className="hidden md:table-cell">Source</TableHead>
          <TableHead>Stage</TableHead>
          <TableHead className="hidden lg:table-cell">Updated</TableHead>
          <TableHead className="w-[80px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads.map((lead) => (
          <LeadRow 
            key={lead.id}
            lead={lead}
            stages={stages}
            onEdit={onEdit}
            onDelete={onDelete}
            onStageChange={onStageChange}
          />
        ))}
      </TableBody>
    </Table>
  );
};

export default LeadsTable;
