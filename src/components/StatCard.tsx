import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: number;
    type: "increase" | "decrease";
  };
  prefix?: string;
  suffix?: string;
  className?: string;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  change,
  prefix,
  suffix,
  className,
}: StatCardProps) => {
  return (
    <div
      className={cn("flex flex-col bg-card border border-border-soft transition-shadow duration-200", className)}
      style={{
        padding: 16,
        gap: 8,
        height: 106,
        boxShadow: "0px 1px 2px rgba(0,0,0,0.05)",
        borderRadius: 10,
      }}
    >
      <div className="flex items-center justify-between">
        <p
          className="text-muted-foreground"
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            fontSize: 14,
            lineHeight: "20px",
          }}
        >
          {title}
        </p>
        <div
          className="flex items-center justify-center shrink-0 bg-brand-accent/10 text-brand-accent"
          style={{
            width: 32,
            height: 32,
            borderRadius: 9999,
          }}
        >
          <Icon style={{ width: 16, height: 16 }} strokeWidth={1.67} />
        </div>
      </div>
      <div className="flex items-end justify-between flex-1">
        <h3
          className="text-foreground"
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: 24,
            lineHeight: "32px",
          }}
        >
          {prefix}
          {value}
          {suffix}
        </h3>
        {change && (
          <p
            className={cn(
              "text-xs font-medium",
              change.type === "increase" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            )}
          >
            {change.type === "increase" ? "↑" : "↓"} {Math.abs(change.value)}%
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
