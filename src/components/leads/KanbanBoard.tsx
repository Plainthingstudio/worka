
import React from 'react';
import { Lead } from '@/types';
import { useKanbanBoard, LEAD_STAGES } from '@/hooks/leads/useKanbanBoard';
import KanbanHeader from './KanbanHeader';
import LeadsList from './LeadsList';
import LeadDialog from './LeadDialog';
import DeleteLeadDialog from './DeleteLeadDialog';
import KanbanView from './KanbanView';

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
    handleMoveLead,
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

  return (
    <div className="flex flex-col w-full">
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
