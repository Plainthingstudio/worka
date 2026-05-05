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
  description,
}: TeamStatCardProps) => {
  const changeToneClassName =
    change?.type === "increase"
      ? "text-green-600 dark:text-green-400"
      : "text-red-500 dark:text-red-400";

  return (
    <div
      className={cn(
        "flex min-h-[130px] flex-col justify-between rounded-[10px] border border-border-soft bg-card p-3 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-border-soft text-brand-accent">
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
      </div>

      <div className="flex items-end justify-between gap-4">
        <h3 className="text-[24px] font-bold leading-8 text-foreground">{value}</h3>
        {(description || change) && (
          <div className="text-right">
            {change && (
              <p className={cn("text-xs font-medium leading-3", changeToneClassName)}>
                {change.type === "increase" ? "+" : "-"}
                {Math.abs(change.value)}%
              </p>
            )}
            {description ? (
              <p className="mt-1 text-xs font-medium leading-3 text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamStatCard;
