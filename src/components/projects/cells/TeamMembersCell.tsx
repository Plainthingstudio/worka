
import React, { useState } from "react";
import { Users, Check } from "lucide-react";
import { TeamMember } from "@/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface TeamMembersCellProps {
  selectedIds: string[];
  allTeamMembers: TeamMember[];
  onSave?: (ids: string[]) => void;
}

const TeamMembersCell = ({ selectedIds, allTeamMembers, onSave }: TeamMembersCellProps) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>(selectedIds);

  const resolvedMembers = allTeamMembers.filter(m => selectedIds.includes(m.id));

  const handleOpenChange = (next: boolean) => {
    if (!next && onSave) {
      const changed =
        draft.length !== selectedIds.length ||
        draft.some(id => !selectedIds.includes(id));
      if (changed) onSave(draft);
    }
    if (next) setDraft([...selectedIds]);
    setOpen(next);
  };

  const toggle = (id: string) => {
    setDraft(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  if (!onSave) {
    if (resolvedMembers.length === 0) {
      return <span className="text-muted-foreground text-xs">None</span>;
    }
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 text-sm text-muted-foreground cursor-help">
              <Users className="h-3.5 w-3.5" />
              {resolvedMembers.length}
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="font-medium">Assigned Team Members:</p>
            <ul className="text-xs mt-1">
              {resolvedMembers.map(m => (
                <li key={m.id}>• {m.name} ({m.position})</li>
              ))}
            </ul>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-1 text-sm text-muted-foreground rounded px-1 py-0.5 hover:bg-accent transition-colors"
          onClick={e => { e.stopPropagation(); setOpen(true); }}
        >
          <Users className="h-3.5 w-3.5" />
          {selectedIds.length > 0 ? selectedIds.length : <span className="text-xs">None</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-56 p-2"
        onClick={e => e.stopPropagation()}
        onPointerDownOutside={e => e.stopPropagation()}
      >
        <p className="text-xs font-medium text-muted-foreground mb-2 px-1">Assign team members</p>
        {allTeamMembers.length === 0 ? (
          <p className="text-xs text-muted-foreground px-1">No team members found.</p>
        ) : (
          <div className="flex flex-col gap-1 max-h-52 overflow-y-auto">
            {allTeamMembers.map(m => (
              <label
                key={m.id}
                className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-accent cursor-pointer"
              >
                <Checkbox
                  checked={draft.includes(m.id)}
                  onCheckedChange={() => toggle(m.id)}
                  onClick={e => e.stopPropagation()}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-none truncate">{m.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{m.position}</p>
                </div>
              </label>
            ))}
          </div>
        )}
        <div className="mt-2 pt-2 border-t flex justify-end">
          <button
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            onClick={e => { e.stopPropagation(); if (onSave) onSave(draft); setOpen(false); }}
          >
            <Check className="h-3 w-3" /> Apply
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TeamMembersCell;
