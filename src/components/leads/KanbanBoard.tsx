
import React from 'react';
import { Lead } from '@/types';
import { useKanbanBoard, LEAD_STAGES } from '@/hooks/leads/useKanbanBoard';
import KanbanHeader from './KanbanHeader';
import KanbanScrollContainer from './KanbanScrollContainer';
import LeadDialog from './LeadDialog';
import DeleteLeadDialog from './DeleteLeadDialog';

interface KanbanBoardProps {
  leads: Lead[];
  isLoading: boolean;
  onAddLead: (data: any) => Promise<Lead | null>;
  onUpdateLead: (id: string, data: Partial<Lead>) => Promise<boolean>;
  onDeleteLead: (id: string) => Promise<boolean>;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  leads,
  isLoading,
  onAddLead,
  onUpdateLead,
  onDeleteLead
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
    <div className="flex flex-col h-full max-w-full w-full overflow-hidden">
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-[1800px] mx-auto w-full">
        <KanbanHeader onAddLead={handleAddLeadInStage} />
        
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
