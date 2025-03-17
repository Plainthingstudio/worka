
import React from 'react';
import { Lead } from '@/types';
import { useKanbanBoard, LEAD_STAGES } from '@/hooks/leads/useKanbanBoard';
import KanbanHeader from './KanbanHeader';
import KanbanScrollContainer from './KanbanScrollContainer';
import LeadDialog from './LeadDialog';
import DeleteLeadDialog from './DeleteLeadDialog';
import LeadsList from './LeadsList';

interface KanbanBoardProps {
  leads: Lead[];
  isLoading: boolean;
  onAddLead: (data: any) => Promise<Lead | null>;
  onUpdateLead: (id: string, data: Partial<Lead>) => Promise<boolean>;
  onDeleteLead: (id: string) => Promise<boolean>;
  viewMode: 'kanban' | 'list';
  onViewModeChange: (mode: 'kanban' | 'list') => void;
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
  } = useKanbanBoard({ leads, onAddLead, onUpdateLead, onDeleteLead });

  return (
    <div className="flex flex-col h-full w-full">
      <div className="p-4 sm:p-6 flex flex-col h-full">
        <KanbanHeader 
          onAddLead={handleAddLeadInStage} 
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
        />
        
        <div className="flex-1 min-h-0 w-full">
          {viewMode === 'kanban' ? (
            <KanbanScrollContainer
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
          ) : (
            <LeadsList
              leads={leads}
              isLoading={isLoading}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onStageChange={handleMoveLead}
              stages={LEAD_STAGES}
            />
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
        onClose={() => {
          setIsEditDialogOpen(false);
        }}
        onSubmit={handleEditLead}
        lead={selectedLead}
        title="Edit Lead"
        isLoading={actionLoading}
      />

      <DeleteLeadDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
        }}
        onConfirm={handleDeleteLead}
        isLoading={actionLoading}
      />
    </div>
  );
};

export default KanbanBoard;
