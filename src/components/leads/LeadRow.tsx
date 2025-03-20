
import React from 'react';
import { Lead, LeadStage } from '@/types';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash, MoreHorizontal } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { getStageBadgeVariant } from './utils/leadBadgeUtils';

interface LeadRowProps {
  lead: Lead;
  stages: LeadStage[];
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onStageChange: (id: string, stage: LeadStage) => void;
}

const LeadRow: React.FC<LeadRowProps> = ({
  lead,
  stages,
  onEdit,
  onDelete,
  onStageChange
}) => {
  return (
    <TableRow key={lead.id}>
      <TableCell className="font-medium">{lead.name}</TableCell>
      <TableCell className="hidden md:table-cell">{lead.email}</TableCell>
      <TableCell className="hidden lg:table-cell">{lead.phone || "-"}</TableCell>
      <TableCell className="hidden md:table-cell">{lead.source || "-"}</TableCell>
      <TableCell>
        <Badge variant={getStageBadgeVariant(lead.stage)}>
          {lead.stage}
        </Badge>
      </TableCell>
      <TableCell className="hidden lg:table-cell">{new Date(lead.updatedAt).toLocaleDateString()}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(lead)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(lead.id)}>
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem className="font-medium px-2 py-1.5 text-xs text-muted-foreground" disabled>
              Move to Stage
            </DropdownMenuItem>
            
            {stages.map((stage) => (
              <DropdownMenuItem 
                key={stage}
                disabled={lead.stage === stage}
                onClick={() => onStageChange(lead.id, stage)}
                className="pl-4 text-sm"
              >
                {stage}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default LeadRow;
