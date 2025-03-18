
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, List, Kanban } from 'lucide-react';
import { LeadStage } from '@/types';
import { Toggle } from '@/components/ui/toggle';

interface KanbanHeaderProps {
  onAddLead: (stage: LeadStage) => void;
  viewMode: 'list' | 'kanban';
  onViewModeChange: (mode: 'list' | 'kanban') => void;
}

const KanbanHeader: React.FC<KanbanHeaderProps> = ({ 
  onAddLead,
  viewMode,
  onViewModeChange
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Leads & Pipeline</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Manage your leads through the sales pipeline.</p>
      </div>
      
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="flex items-center bg-muted/50 rounded-md p-1">
          <Toggle
            pressed={viewMode === 'list'}
            onPressedChange={() => onViewModeChange('list')}
            aria-label="Toggle list view"
            className="data-[state=on]:bg-background data-[state=on]:text-foreground"
          >
            <List className="h-4 w-4 mr-1" />
            List
          </Toggle>
          <Toggle
            pressed={viewMode === 'kanban'}
            onPressedChange={() => onViewModeChange('kanban')}
            aria-label="Toggle kanban view"
            className="data-[state=on]:bg-background data-[state=on]:text-foreground"
          >
            <Kanban className="h-4 w-4 mr-1" />
            Kanban
          </Toggle>
        </div>
        
        <Button onClick={() => onAddLead('Leads')} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Lead
        </Button>
      </div>
    </div>
  );
};

export default KanbanHeader;
