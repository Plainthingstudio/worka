
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { LeadStage } from '@/types';

interface KanbanHeaderProps {
  onAddLead: (stage: LeadStage) => void;
}

const KanbanHeader: React.FC<KanbanHeaderProps> = ({ 
  onAddLead
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Leads & Pipeline</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Manage your leads through the sales pipeline.</p>
      </div>
      
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <Button onClick={() => onAddLead('Leads')} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Lead
        </Button>
      </div>
    </div>
  );
};

export default KanbanHeader;
