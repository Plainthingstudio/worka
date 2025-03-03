
import React from "react";
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
    <div className={cn(
      "glass-card flex flex-col overflow-hidden rounded-xl p-6 transition-all duration-300 ease-in-out hover:shadow-md animate-fade-in",
      className
    )}>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="rounded-full bg-primary/10 p-2.5 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-2xl font-bold">
            {prefix}
            {value}
            {suffix}
          </h3>
          {change && (
            <p
              className={cn(
                "mt-1 text-xs font-medium",
                change.type === "increase"
                  ? "text-green-600"
                  : "text-red-600"
              )}
            >
              {change.type === "increase" ? "↑" : "↓"} {Math.abs(change.value)}%{" "}
              <span className="text-muted-foreground">from last month</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
