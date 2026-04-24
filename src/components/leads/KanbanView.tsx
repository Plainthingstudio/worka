
import React from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Lead, LeadStage } from '@/types';
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
    <div className="relative h-full w-full pb-0">
      <ScrollArea 
        className="h-full w-full kanban-scroll-container rounded-md border border-border/30"
        onScroll={onScroll}
      >
        <div className="flex flex-nowrap gap-5 p-4 h-full pl-4 pr-12 w-full overflow-x-auto">
          {stages.map(stage => (
            <div key={stage} style={{minWidth: `${columnWidth}px`, flex: '1 0 auto'}} className="h-full">
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
