
import React, { useState } from 'react';
import { PlusCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
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
    <div className="flex flex-col h-full px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-5 lg:px-8 max-w-[1800px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Leads & Pipeline</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage your leads through the sales pipeline.</p>
        </div>
        <Button onClick={() => handleAddLeadInStage('Leads')} className="w-full sm:w-auto">
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
              className="rounded-full shadow-md h-8 w-8 opacity-80 hover:opacity-100 bg-background" 
              onClick={scrollLeft}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="absolute right-0 top-1/2 z-10 -translate-y-1/2">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full shadow-md h-8 w-8 opacity-80 hover:opacity-100 bg-background" 
              onClick={scrollRight}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          <ScrollArea 
            className="h-[calc(100vh-12rem)] md:h-[calc(100vh-13rem)] lg:h-[calc(100vh-14rem)] px-4 kanban-scroll-container" 
            scrollHideDelay={0}
            onScroll={handleScroll}
          >
            <div className="flex gap-3 sm:gap-4 pb-4 min-w-max h-full">
              {LEAD_STAGES.map(stage => (
                <div key={stage} className="w-60 sm:w-64 md:w-72 lg:w-80 flex-shrink-0 h-full">
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
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}

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
          setSelectedLead(undefined);
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
          setSelectedLead(undefined);
        }}
        onConfirm={handleDeleteLead}
        isLoading={actionLoading}
      />
    </div>
  );
};

export default KanbanBoard;
