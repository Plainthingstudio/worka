import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: number;
    type: "increase" | "decrease";
  };
  className?: string;
  description?: string;
}

const TeamStatCard = ({
  title,
  value,
  icon: Icon,
  change,
  className,
  description
}: TeamStatCardProps) => {
  return (
    <div className={cn("flex flex-col overflow-hidden rounded-md p-4 transition-all duration-300 ease-in-out hover:shadow-md bg-white border border-border", className)}>
      <div className="mb-2 flex items-center justify-between">
        <p className="font-medium text-muted-foreground text-sm">{title}</p>
        <div className="rounded-full bg-primary/10 p-2 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-2xl font-bold">
            {value}
          </h3>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground">
              {description}
            </p>
          )}
          {change && (
            <p className={cn("mt-1 text-xs font-medium", 
              change.type === "increase" ? "text-green-600" : "text-red-600"
            )}>
              {change.type === "increase" ? "↑" : "↓"} {Math.abs(change.value)}%{" "}
              <span className="text-muted-foreground">from last week</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamStatCard;