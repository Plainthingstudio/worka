import { cn } from "@/lib/utils";
import { TaskPriority, TASK_PRIORITIES } from "@/types/task";
import { PriorityFlagIcon } from "@/components/icons/PriorityFlagIcon";

export const PRIORITY_FLAG_COLORS: Record<TaskPriority, string> = {
  Urgent: "#FB2C36",
  High: "#F0B100",
  Normal: "#2B7FFF",
  Low: "#B8E6FE",
};

export const PRIORITY_TEXT_COLOR = "hsl(var(--priority-text))";

export function getPriorityFlagColor(priority: string): string {
  return PRIORITY_FLAG_COLORS[priority as TaskPriority] ?? PRIORITY_FLAG_COLORS.Normal;
}

interface PriorityIndicatorProps {
  priority: string;
  className?: string;
  showLabel?: boolean;
  size?: "default" | "sm" | "xs";
  noPadding?: boolean;
}

export function PriorityIndicator({
  priority,
  className,
  showLabel = true,
  size = "default",
  noPadding = false,
}: PriorityIndicatorProps) {
  const flagColor = getPriorityFlagColor(priority);
  const iconSize = size === "default" ? 16 : size === "sm" ? 14 : 12;
  const fontSize = size === "xs" ? 11 : 14;
  const lineHeight = size === "xs" ? 14 : 20;

  return (
    <div
      className={cn("inline-flex items-center justify-center whitespace-nowrap", className)}
      style={{
        padding: noPadding ? 0 : size === "xs" ? "0 4px" : "2px 8px",
        gap: 4,
        borderRadius: 9999,
      }}
    >
      <PriorityFlagIcon size={iconSize} color={flagColor} />
      {showLabel && (
        <span
          className="text-muted-foreground"
          style={{
            fontWeight: "inherit",
            fontSize,
            lineHeight: `${lineHeight}px`,
            letterSpacing: 0,
            color: PRIORITY_TEXT_COLOR,
          }}
        >
          {priority}
        </span>
      )}
    </div>
  );
}

export { TASK_PRIORITIES as PRIORITY_OPTIONS };
