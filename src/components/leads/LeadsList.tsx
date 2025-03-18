
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
import { Button } from '@/components/ui/button';
import { Edit, Trash, MoreHorizontal } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

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
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading leads...</p>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground mb-4">No leads found</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto rounded-md">
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
            <TableRow key={lead.id}>
              <TableCell className="font-medium">{lead.name}</TableCell>
              <TableCell className="hidden md:table-cell">{lead.email}</TableCell>
              <TableCell className="hidden lg:table-cell">{lead.phone || "-"}</TableCell>
              <TableCell className="hidden md:table-cell">{lead.source || "-"}</TableCell>
              <TableCell>{lead.stage}</TableCell>
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default LeadsList;
