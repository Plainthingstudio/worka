
import React from 'react';
import { Lead, LeadStage } from '@/types';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTeamMemberMap } from '@/hooks/useTeamMemberMap';
import LeadRow from './LeadRow';

interface LeadsTableProps {
  leads: Lead[];
  stages: LeadStage[];
  onDelete: (id: string) => void;
  onStageChange: (id: string, stage: LeadStage) => void;
  onInlineUpdate: (id: string, fields: Partial<Lead>) => void;
}

const headStyle: React.CSSProperties = {
  padding: '8px 16px',
  fontFamily: 'Inter, sans-serif',
  fontWeight: 500,
  fontSize: 14,
  lineHeight: '20px',
};

const headClass = 'bg-surface-2 text-muted-foreground';

const LeadsTable: React.FC<LeadsTableProps> = ({
  leads,
  stages,
  onDelete,
  onStageChange,
  onInlineUpdate,
}) => {
  const { getMember } = useTeamMemberMap();

  return (
    <Table>
      <TableHeader className="rounded-none">
        <TableRow className="rounded-none">
          <TableHead className={headClass} style={headStyle}>Name</TableHead>
          <TableHead className={`hidden md:table-cell ${headClass}`} style={headStyle}>Email</TableHead>
          <TableHead className={`hidden lg:table-cell ${headClass}`} style={headStyle}>Phone</TableHead>
          <TableHead className={`hidden md:table-cell ${headClass}`} style={headStyle}>Source</TableHead>
          <TableHead className={headClass} style={headStyle}>Stage</TableHead>
          <TableHead className={`hidden lg:table-cell ${headClass}`} style={headStyle}>Created By</TableHead>
          <TableHead className={`hidden lg:table-cell ${headClass}`} style={headStyle}>Updated</TableHead>
          <TableHead className={headClass} style={{ ...headStyle, width: 48 }} />
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads.map((lead) => (
          <LeadRow
            key={lead.id}
            lead={lead}
            stages={stages}
            creator={getMember(lead.createdBy)}
            onDelete={onDelete}
            onStageChange={onStageChange}
            onInlineUpdate={onInlineUpdate}
          />
        ))}
      </TableBody>
    </Table>
  );
};

export default LeadsTable;
