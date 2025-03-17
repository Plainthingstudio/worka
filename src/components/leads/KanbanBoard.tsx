
import React, { useState } from 'react';
import { PlusCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Lead, LeadStage } from '@/types';
import LeadColumn from './LeadColumn';
import LeadDialog from './LeadDialog';
import DeleteLeadDialog from './DeleteLeadDialog';

interface KanbanBoardProps {
  leads: Lead[];
  isLoading: boolean;
  onAddLead: (data: any) => Promise<Lead | null>;
  onUpdateLead: (id: string, data: Partial<Lead>) => Promise<boolean>;
  onDeleteLead: (id: string) => Promise<boolean>;
}

const LEAD_STAGES: LeadStage[] = [
  'Leads',
  'First Meeting',
  'Follow up 1',
  'Follow up 2',
  'Provide Moodboard',
  'Follow up 3',
  'Down Payment',
  'Kickoff',
  'Finish'
];

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  leads,
  isLoading,
  onAddLead,
  onUpdateLead,
  onDeleteLead
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | undefined>(undefined);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState<LeadStage>('Leads');
  const [scrollPosition, setScrollPosition] = useState({ left: 0, maxScroll: 0 });

  // Group leads by stage
  const leadsByStage = LEAD_STAGES.reduce((acc, stage) => {
    acc[stage] = leads.filter(lead => lead.stage === stage);
    return acc;
  }, {} as Record<LeadStage, Lead[]>);

  const handleAddLead = async (data: any) => {
    setActionLoading(true);
    const newData = { ...data, stage: currentStage };
    await onAddLead(newData);
    setActionLoading(false);
    setIsAddDialogOpen(false);
  };

  const handleEditLead = async (data: any) => {
    if (selectedLead) {
      setActionLoading(true);
      await onUpdateLead(selectedLead.id, data);
      setActionLoading(false);
      setIsEditDialogOpen(false);
      setSelectedLead(undefined);
    }
  };

  const handleDeleteLead = async () => {
    if (selectedLead) {
      setActionLoading(true);
      await onDeleteLead(selectedLead.id);
      setActionLoading(false);
      setIsDeleteDialogOpen(false);
      setSelectedLead(undefined);
    }
  };

  const handleMoveLead = async (leadId: string, stage: LeadStage) => {
    await onUpdateLead(leadId, { stage });
  };

  const handleEditClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    const lead = leads.find(l => l.id === id);
    setSelectedLead(lead);
    setIsDeleteDialogOpen(true);
  };

  const handleAddLeadInStage = (stage: LeadStage) => {
    setCurrentStage(stage);
    setIsAddDialogOpen(true);
  };

  const handleScroll = (api: any) => {
    if (api) {
      const { scrollLeft, scrollWidth, clientWidth } = api.scrollerElement;
      setScrollPosition({
        left: scrollLeft,
        maxScroll: scrollWidth - clientWidth
      });
    }
  };

  const scrollLeft = () => {
    const container = document.querySelector('.kanban-scroll-container');
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = document.querySelector('.kanban-scroll-container');
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Leads & Pipeline</h1>
          <p className="text-muted-foreground">Manage your leads through the sales pipeline.</p>
        </div>
        <Button onClick={() => handleAddLeadInStage('Leads')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Lead
        </Button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg text-muted-foreground">Loading leads...</div>
        </div>
      ) : (
        <div className="flex-1 relative overflow-hidden">
          <div className="absolute left-0 top-1/2 z-10 -translate-y-1/2">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full shadow-md h-8 w-8" 
              onClick={scrollLeft}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="absolute right-0 top-1/2 z-10 -translate-y-1/2">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full shadow-md h-8 w-8" 
              onClick={scrollRight}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          <ScrollArea 
            className="h-full px-10 kanban-scroll-container" 
            scrollHideDelay={0}
            orientation="horizontal"
            onScroll={handleScroll}
          >
            <div className="flex gap-4 pb-4 px-1 min-w-max">
              {LEAD_STAGES.map(stage => (
                <div key={stage} className="w-80 flex-shrink-0">
                  <LeadColumn
                    title={stage}
                    leads={leadsByStage[stage] || []}
                    onMove={handleMoveLead}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    onDrop={handleMoveLead}
                    onAddLead={() => handleAddLeadInStage(stage)}
                    allStages={LEAD_STAGES}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Add Lead Dialog */}
      <LeadDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddLead}
        title={`Add New Lead to ${currentStage}`}
        isLoading={actionLoading}
      />

      {/* Edit Lead Dialog */}
      <LeadDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedLead(undefined);
        }}
        onSubmit={handleEditLead}
        lead={selectedLead}
        title="Edit Lead"
        isLoading={actionLoading}
      />

      {/* Delete Lead Dialog */}
      <DeleteLeadDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedLead(undefined);
        }}
        onConfirm={handleDeleteLead}
        isLoading={actionLoading}
      />
    </div>
  );
};

export default KanbanBoard;
