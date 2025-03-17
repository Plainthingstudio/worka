
import React from 'react';
import { Lead, LeadStage } from '@/types';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LeadCard from './LeadCard';

interface LeadColumnProps {
  title: LeadStage;
  leads: Lead[];
  onMove: (id: string, stage: LeadStage) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onDrop: (leadId: string, stage: LeadStage) => void;
  onAddLead: () => void;
  allStages: LeadStage[];
}

const LeadColumn: React.FC<LeadColumnProps> = ({ 
  title, 
  leads, 
  onMove, 
  onEdit, 
  onDelete, 
  onDrop,
  onAddLead,
  allStages
}) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    onDrop(leadId, title);
  };

  return (
    <div 
      className="flex flex-col h-[calc(100vh-12rem)] bg-background"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="bg-muted/40 rounded-t-md p-3 font-medium text-sm">
        <div className="flex justify-between items-center">
          <span>{title}</span>
          <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">
            {leads.length}
          </span>
        </div>
      </div>
      
      <div className="flex-1 p-2 overflow-y-auto">
        {leads.length === 0 ? (
          <Button 
            variant="ghost" 
            className="w-full h-20 border border-dashed rounded-md text-sm text-muted-foreground justify-center gap-2"
            onClick={onAddLead}
          >
            <Plus className="h-4 w-4" />
            Add Lead
          </Button>
        ) : (
          <>
            {leads.map(lead => (
              <LeadCard 
                key={lead.id} 
                lead={lead} 
                onMove={onMove} 
                onEdit={onEdit} 
                onDelete={onDelete}
                allStages={allStages}
              />
            ))}
            <Button 
              variant="ghost" 
              className="w-full mt-3 border border-dashed rounded-md text-sm text-muted-foreground justify-center gap-2"
              onClick={onAddLead}
            >
              <Plus className="h-4 w-4" />
              Add Lead
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default LeadColumn;
