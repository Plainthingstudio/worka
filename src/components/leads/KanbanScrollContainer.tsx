
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Lead, LeadStage } from '@/types';
import LeadColumn from './LeadColumn';
import { useIsMobile } from '@/hooks/use-mobile';

interface KanbanScrollContainerProps {
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

const KanbanScrollContainer: React.FC<KanbanScrollContainerProps> = ({
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
  const isMobile = useIsMobile();
  const columnWidth = isMobile ? 260 : 280;
  
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading leads...</div>
      </div>
    );
  }

  return (
    <div className="relative flex-1 h-[calc(100vh-210px)] overflow-hidden">
      <div className="absolute left-0 top-1/2 z-10 -translate-y-1/2 ml-1">
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full shadow-md h-8 w-8 opacity-80 hover:opacity-100 bg-background" 
          onClick={onScrollLeft}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="absolute right-0 top-1/2 z-10 -translate-y-1/2 mr-1">
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
        className="h-full kanban-scroll-container rounded-md border border-border/50" 
        onScroll={onScroll}
      >
        <div className="flex gap-3 p-4 min-w-max h-full">
          {stages.map(stage => (
            <div key={stage} className={`w-[${columnWidth}px] flex-shrink-0 h-full`}>
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

export default KanbanScrollContainer;
