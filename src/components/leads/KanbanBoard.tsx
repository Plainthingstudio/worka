
import React from 'react';
import { Lead } from '@/types';
import { useKanbanBoard, LEAD_STAGES } from '@/hooks/leads/useKanbanBoard';
import KanbanHeader from './KanbanHeader';
import LeadsList from './LeadsList';
import LeadDialog from './LeadDialog';
import DeleteLeadDialog from './DeleteLeadDialog';
import KanbanView from './KanbanView';
import { useClients } from '@/hooks/useClients';
import { toast } from 'sonner';

interface KanbanBoardProps {
  leads: Lead[];
  isLoading: boolean;
  onAddLead: (data: any) => Promise<Lead | null>;
  onUpdateLead: (id: string, data: Partial<Lead>) => Promise<boolean>;
  onDeleteLead: (id: string) => Promise<boolean>;
  viewMode: 'list' | 'kanban';
  onViewModeChange: (mode: 'list' | 'kanban') => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  leads,
  isLoading,
  onAddLead,
  onUpdateLead,
  onDeleteLead,
  viewMode,
  onViewModeChange
}) => {
  // Get the client adding functionality from useClients hook
  const { addClient } = useClients();

  const {
    leadsByStage,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    selectedLead,
    actionLoading,
    currentStage,
    handleAddLead,
    handleEditLead,
    handleDeleteLead,
    handleEditClick,
    handleDeleteClick,
    handleAddLeadInStage,
    handleScroll,
    scrollLeft,
    scrollRight
  } = useKanbanBoard({
    leads,
    onAddLead,
    onUpdateLead,
    onDeleteLead
  });

  // Create a wrapper for handleMoveLead to add the lead to clients when moved to Kickoff stage
  const handleMoveLead = async (leadId: string, stage: typeof LEAD_STAGES[number]) => {
    // First, update the lead stage
    const success = await onUpdateLead(leadId, { stage });
    
    // If update was successful and the lead is being moved to "Kickoff" stage
    if (success && stage === 'Kickoff') {
      // Find the lead that was updated
      const lead = leads.find(l => l.id === leadId);
      
      if (lead) {
        try {
          // Convert lead to client format
          const newClient = {
            name: lead.name,
            email: lead.email,
            phone: lead.phone || '',
            address: lead.address || '',
            leadSource: lead.source || 'Other'
          };
          
          // Add to clients table
          const clientAdded = await addClient(newClient);
          if (clientAdded) {
            toast.success(`"${lead.name}" automatically added to clients list`);
          }
        } catch (error) {
          console.error('Error adding lead as client:', error);
          toast.error('Failed to add lead as client automatically');
        }
      }
    }
    
    return success;
  };

  return (
    <div className="flex flex-col w-full max-w-[1400px] mx-auto">
      <KanbanHeader 
        onAddLead={handleAddLeadInStage}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
      />
      
      <div className="glass-card rounded-lg border shadow-sm animate-fade-in overflow-hidden">
        <div className="p-0 sm:p-2">
          {viewMode === 'list' ? (
            <div className="h-[calc(100vh-230px)] md:h-[calc(100vh-230px)] overflow-auto">
              <LeadsList 
                leads={leads} 
                isLoading={isLoading} 
                onEdit={handleEditClick} 
                onDelete={handleDeleteClick} 
                onStageChange={handleMoveLead} 
                stages={LEAD_STAGES} 
              />
            </div>
          ) : (
            <div className="h-[calc(100vh-230px)] md:h-[calc(100vh-230px)]">
              <KanbanView
                isLoading={isLoading}
                stages={LEAD_STAGES}
                leadsByStage={leadsByStage}
                onScroll={handleScroll}
                onScrollLeft={scrollLeft}
                onScrollRight={scrollRight}
                onMove={handleMoveLead}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onAddLead={handleAddLeadInStage}
              />
            </div>
          )}
        </div>
      </div>

      <LeadDialog 
        isOpen={isAddDialogOpen} 
        onClose={() => setIsAddDialogOpen(false)} 
        onSubmit={handleAddLead} 
        title={`Add New Lead to ${currentStage}`} 
        isLoading={actionLoading} 
      />

      <LeadDialog 
        isOpen={isEditDialogOpen} 
        onClose={() => { setIsEditDialogOpen(false); }} 
        onSubmit={handleEditLead} 
        lead={selectedLead} 
        title="Edit Lead" 
        isLoading={actionLoading} 
      />

      <DeleteLeadDialog 
        isOpen={isDeleteDialogOpen} 
        onClose={() => { setIsDeleteDialogOpen(false); }} 
        onConfirm={handleDeleteLead} 
        isLoading={actionLoading} 
      />
    </div>
  );
};

export default KanbanBoard;
