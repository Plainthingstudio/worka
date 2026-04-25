
import React, { useState } from "react";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { ProjectCategory } from "@/types";

const CATEGORY_OPTIONS: ProjectCategory[] = [
  "Landing Page",
  "Website Design",
  "Mobile App Design",
  "Dashboard Design",
  "Framer Development",
  "Webflow Development",
  "2D Illustrations",
  "3D Illustrations",
  "2D Animations",
  "3D Animations",
  "Logo Design",
  "Branding Design",
];

interface CategoryCellProps {
  categories: ProjectCategory[];
  onSave?: (categories: ProjectCategory[]) => void;
}

const CategoryCell = ({ categories, onSave }: CategoryCellProps) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ProjectCategory[]>(categories);

  const handleOpenChange = (next: boolean) => {
    if (!next && onSave) {
      const changed =
        draft.length !== categories.length ||
        draft.some(c => !categories.includes(c));
      if (changed) onSave(draft);
    }
    if (next) setDraft([...categories]);
    setOpen(next);
  };

  const toggle = (cat: ProjectCategory) => {
    setDraft(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const displayBadges = (cats: ProjectCategory[]) => {
    if (!cats || cats.length === 0) {
      return <span className="text-muted-foreground text-xs">No categories</span>;
    }
    return (
      <div className="flex flex-wrap gap-1">
        {cats.slice(0, 2).map((cat, i) => (
          <Badge key={i} variant="category" className="text-xs">{cat}</Badge>
        ))}
        {cats.length > 2 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="category" className="text-xs cursor-help">+{cats.length - 2}</Badge>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="font-medium">All Categories:</p>
                <ul className="text-xs mt-1">
                  {cats.map((c, i) => <li key={i}>• {c}</li>)}
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  };

  if (!onSave) {
    return displayBadges(categories);
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          className="text-left rounded px-1 py-0.5 hover:bg-accent transition-colors focus:outline-none focus:ring-1 focus:ring-primary"
          onClick={e => { e.stopPropagation(); setOpen(true); }}
        >
          {displayBadges(categories)}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-60 p-2"
        onClick={e => e.stopPropagation()}
        onPointerDownOutside={e => e.stopPropagation()}
      >
        <p className="text-xs font-medium text-muted-foreground mb-2 px-1">Select categories</p>
        <div className="flex flex-col gap-1 max-h-56 overflow-y-auto">
          {CATEGORY_OPTIONS.map(cat => (
            <label
              key={cat}
              className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-accent cursor-pointer"
            >
              <Checkbox
                checked={draft.includes(cat)}
                onCheckedChange={() => toggle(cat)}
                onClick={e => e.stopPropagation()}
              />
              <span className="text-sm">{cat}</span>
            </label>
          ))}
        </div>
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

export default CategoryCell;
