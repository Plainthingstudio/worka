
import React, { useState } from 'react';
import { MoreVertical, Grip, Trash, Edit, MoveRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Lead, LeadStage } from '@/types';

interface LeadCardProps {
  lead: Lead;
  onMove: (id: string, stage: LeadStage) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  allStages: LeadStage[];
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, onMove, onEdit, onDelete, allStages }) => {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <Card 
      className={`mb-3 ${isDragging ? 'border-primary' : ''}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('leadId', lead.id);
        setIsDragging(true);
      }}
      onDragEnd={() => setIsDragging(false)}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-medium text-base">{lead.name}</h3>
            <p className="text-sm text-muted-foreground">{lead.email}</p>
            {lead.phone && <p className="text-sm text-muted-foreground">{lead.phone}</p>}
            {lead.source && <p className="text-xs mt-1 px-2 py-0.5 bg-muted inline-block rounded-full">{lead.source}</p>}
          </div>
          
          <div className="flex items-center">
            <Grip className="h-4 w-4 mr-2 text-muted-foreground cursor-grab" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onEdit(lead)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(lead.id)}>
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem className="p-0">
                  <div className="flex items-center w-full px-2 py-1.5">
                    <MoveRight className="h-4 w-4 mr-2" />
                    <span>Move to</span>
                  </div>
                </DropdownMenuItem>
                
                {allStages.map((stage) => (
                  <DropdownMenuItem 
                    key={stage} 
                    disabled={lead.stage === stage}
                    onClick={() => onMove(lead.id, stage)}
                    className="pl-8"
                  >
                    {stage}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {lead.notes && (
          <div className="mt-2 text-sm text-muted-foreground">
            <p className="line-clamp-2">{lead.notes}</p>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground mt-2">
          {new Date(lead.updatedAt).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
};

export default LeadCard;
