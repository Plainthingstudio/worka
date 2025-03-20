
import { useState, useRef } from 'react';
import { Lead, LeadStage } from '@/types';

// Define as array of LeadStage, not as readonly const
export const LEAD_STAGES: LeadStage[] = [
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

interface UseKanbanBoardProps {
  leads: Lead[];
  onAddLead: (data: any) => Promise<Lead | null>;
  onUpdateLead: (id: string, data: Partial<Lead>) => Promise<boolean>;
  onDeleteLead: (id: string) => Promise<boolean>;
}

export const useKanbanBoard = ({ 
  leads, 
  onAddLead, 
  onUpdateLead, 
  onDeleteLead 
}: UseKanbanBoardProps) => {
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
    if (!selectedLead) {
      return;
    }
    
    setActionLoading(true);
    
    try {
      // Wait for the deletion to complete before updating UI
      const success = await onDeleteLead(selectedLead.id);
      
      if (success) {
        // Only close the dialog and clear selected lead if deletion was successful
        setIsDeleteDialogOpen(false);
        setSelectedLead(undefined);
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
    } finally {
      setActionLoading(false);
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

  return {
    LEAD_STAGES,
    leadsByStage,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    selectedLead,
    setSelectedLead,
    actionLoading,
    currentStage,
    scrollPosition,
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
  };
};
