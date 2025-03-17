
import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { ProjectCategory } from "@/types";

interface CategoryCellProps {
  categories: ProjectCategory[];
}

const CategoryCell = ({ categories }: CategoryCellProps) => {
  if (!categories || categories.length === 0) {
    return <span className="text-muted-foreground text-xs">No categories</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {categories.slice(0, 2).map((category, index) => (
        <Badge key={index} variant="outline" className="text-xs">
          {category}
        </Badge>
      ))}
      
      {categories.length > 2 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="text-xs cursor-help">
                +{categories.length - 2}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top" align="center" sideOffset={5}>
              <p className="font-medium">All Categories:</p>
              <ul className="text-xs mt-1">
                {categories.map((category, index) => (
                  <li key={index}>• {category}</li>
                ))}
              </ul>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default CategoryCell;
