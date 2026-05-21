import { cn } from "@/lib/utils";
import { TaskPriority, TASK_PRIORITIES } from "@/types/task";
import { PriorityFlagIcon } from "@/components/icons/PriorityFlagIcon";

export const PRIORITY_FLAG_COLORS: Record<TaskPriority, string> = {
  Urgent: "#FB2C36",
  High: "#F0B100",
  Normal: "#2B7FFF",
  Low: "#B8E6FE",
};

export const PRIORITY_TEXT_COLOR = "#62748E";

export function getPriorityFlagColor(priority: string): string {
  return PRIORITY_FLAG_COLORS[priority as TaskPriority] ?? PRIORITY_FLAG_COLORS.Normal;
}

interface PriorityIndicatorProps {
  priority: string;
  className?: string;
  showLabel?: boolean;
  size?: "default" | "sm" | "xs";
}

export function PriorityIndicator({
  priority,
  className,
  showLabel = true,
  size = "default",
}: PriorityIndicatorProps) {
  const flagColor = getPriorityFlagColor(priority);
  const iconSize = size === "default" ? 16 : size === "sm" ? 14 : 12;
  const fontSize = size === "default" ? 14 : size === "sm" ? 12 : 11;
  const lineHeight = size === "default" ? 20 : size === "sm" ? 16 : 14;

  return (
    <span
      className={cn("inline-flex items-center justify-center whitespace-nowrap", className)}
      style={{
        padding: size === "xs" ? "0 4px" : "2px 8px",
        gap: 4,
        borderRadius: 9999,
      }}
    >
      <PriorityFlagIcon size={iconSize} color={flagColor} />
      {showLabel && (
        <span
          className="text-muted-foreground"
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 400,
            fontSize,
            lineHeight: `${lineHeight}px`,
            letterSpacing: "0.01em",
            color: PRIORITY_TEXT_COLOR,
          }}
        >
          {priority}
        </span>
      )}
    </span>
  );
}

export { TASK_PRIORITIES as PRIORITY_OPTIONS };
