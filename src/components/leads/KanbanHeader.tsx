
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, List, Kanban } from 'lucide-react';
import { LeadStage } from '@/types';

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
        <div className="bg-muted rounded-md p-1 flex">
          <Button 
            variant={viewMode === 'list' ? 'default' : 'ghost'} 
            size="sm" 
            className="rounded-sm"
            onClick={() => onViewModeChange('list')}
          >
            <List className="h-4 w-4 mr-1" />
            List
          </Button>
          <Button 
            variant={viewMode === 'kanban' ? 'default' : 'ghost'} 
            size="sm" 
            className="rounded-sm"
            onClick={() => onViewModeChange('kanban')}
          >
            <Kanban className="h-4 w-4 mr-1" />
            Kanban
          </Button>
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
