
import React, { useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Edit, Trash, MoreHorizontal } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useClients } from '@/hooks/useClients';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface LeadsListProps {
  leads: Lead[];
  isLoading: boolean;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onStageChange: (id: string, stage: LeadStage) => void;
  stages: LeadStage[];
}

// Helper function to get appropriate badge variant based on lead stage
const getStageBadgeVariant = (stage: string) => {
  switch (stage) {
    case 'Leads':
      return 'secondary';
    case 'First Meeting':
      return 'project-based';
    case 'Follow up 1':
      return 'in-progress';
    case 'Follow up 2':
      return 'monthly-retainer';
    case 'Provide Moodboard':
      return 'monthly-pay';
    case 'Follow up 3':
      return 'outline';
    case 'Down Payment':
      return 'default';
    case 'Kickoff':
      return 'destructive';
    case 'Finish':
      return 'completed';
    default:
      return 'secondary';
  }
};

const LeadsList: React.FC<LeadsListProps> = ({
  leads,
  isLoading,
  onEdit,
  onDelete,
  onStageChange,
  stages
}) => {
  const { addClient } = useClients();
  
  // Check for leads in "Kickoff" stage and add them as clients
  useEffect(() => {
    const kickoffLeads = leads.filter(lead => lead.stage === 'Kickoff');
    
    // Process each kickoff lead to add as client if not already a client
    kickoffLeads.forEach(async (lead) => {
      try {
        // Check if this lead exists in clients table by email
        const { data: existingClients, error: checkError } = await supabase
          .from('clients')
          .select('email')
          .eq('email', lead.email);
          
        if (checkError) throw checkError;
        
        // If client with this email doesn't exist, add them
        if (!existingClients || existingClients.length === 0) {
          // Convert lead to client format
          const newClient = {
            name: lead.name,
            email: lead.email,
            phone: lead.phone || '',
            address: lead.address || '',
            leadSource: lead.source || 'Other'
          };
          
          // Add to clients table
          const success = await addClient(newClient);
          if (success) {
            toast.success(`Lead "${lead.name}" automatically added to clients`);
          }
        }
      } catch (error) {
        console.error('Error adding kickoff lead as client:', error);
        toast.error('Failed to add lead as client automatically');
      }
    });
  }, [leads, addClient]);

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
    <div className="w-full h-full overflow-auto rounded-md px-2">
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default LeadsList;
