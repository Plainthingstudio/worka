
import React from 'react';
import { Lead, LeadStage } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import LeadColumn from './LeadColumn';

interface KanbanViewProps {
  isLoading: boolean;
  stages: LeadStage[];
  leadsByStage: Record<LeadStage, Lead[]>;
  onScroll: (api: any) => void;
  onScrollLeft: () => void;
  onScrollRight: () => void;
  onMove: (id: string, stage: LeadStage) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onAddLead: (stage: LeadStage) => void;
}

const KanbanView: React.FC<KanbanViewProps> = ({
  isLoading,
  stages,
  leadsByStage,
  onScroll,
  onScrollLeft,
  onScrollRight,
  onMove,
  onEdit,
  onDelete,
  onAddLead
}) => {
  const columnWidth = 280;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-muted-foreground">Loading leads...</div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div className="absolute left-2 top-1/2 z-10 -translate-y-1/2">
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full shadow-md h-8 w-8 opacity-80 hover:opacity-100 bg-background" 
          onClick={onScrollLeft}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="absolute right-2 top-1/2 z-10 -translate-y-1/2">
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full shadow-md h-8 w-8 opacity-80 hover:opacity-100 bg-background" 
          onClick={onScrollRight}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea 
        className="h-full w-full kanban-scroll-container rounded-md border border-border/30 px-8"
        onScroll={onScroll}
      >
        <div className="flex gap-5 p-4 min-w-max h-full pl-4 pr-12">
          {stages.map(stage => (
            <div key={stage} style={{width: `${columnWidth}px`}} className="flex-shrink-0 h-full">
              <LeadColumn
                title={stage}
                leads={leadsByStage[stage] || []}
                onMove={onMove}
                onEdit={onEdit}
                onDelete={onDelete}
                onDrop={onMove}
                onAddLead={() => onAddLead(stage)}
                allStages={stages}
              />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default KanbanView;
