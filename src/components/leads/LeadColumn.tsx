
import React from 'react';
import { Lead, LeadStage } from '@/types';
import LeadCard from './LeadCard';

interface LeadColumnProps {
  title: LeadStage;
  leads: Lead[];
  onMove: (id: string, stage: LeadStage) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onDrop: (leadId: string, stage: LeadStage) => void;
  allStages: LeadStage[];
}

const LeadColumn: React.FC<LeadColumnProps> = ({ 
  title, 
  leads, 
  onMove, 
  onEdit, 
  onDelete, 
  onDrop,
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
      className="flex flex-col h-full bg-background"
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
      
      <div className="flex-1 p-2 overflow-y-auto max-h-[calc(100vh-12rem)]">
        {leads.length === 0 ? (
          <div className="flex items-center justify-center h-20 border border-dashed rounded-md text-sm text-muted-foreground">
            No leads
          </div>
        ) : (
          leads.map(lead => (
            <LeadCard 
              key={lead.id} 
              lead={lead} 
              onMove={onMove} 
              onEdit={onEdit} 
              onDelete={onDelete}
              allStages={allStages}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default LeadColumn;
