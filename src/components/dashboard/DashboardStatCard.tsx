import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardStatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  change?: number;
  changeLabel?: string;
  meta?: string;
}

const DashboardStatCard = ({
  title,
  value,
  icon: Icon,
  change,
  changeLabel,
  meta,
}: DashboardStatCardProps) => {
  const changeToneClassName =
    typeof change !== "number"
      ? "text-[#64748B]"
      : change > 0
        ? "text-[#21C45D]"
        : change < 0
          ? "text-[#EF4444]"
          : "text-[#64748B]";

  const formattedChange =
    typeof change === "number" ? `${change > 0 ? "+" : ""}${change}%` : null;

  return (
    <div className="flex min-h-[130px] flex-col justify-between rounded-[10px] border border-[#E2E8F0] bg-white p-3 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#E2E8F0] text-[#0080FF]">
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </div>
        <p className="text-sm font-medium tracking-[-0.02em] text-[#64748B]">{title}</p>
      </div>

      <div className="flex items-end justify-between gap-4">
        <h3 className="text-[24px] font-bold leading-8 text-[#020817]">{value}</h3>
        {(formattedChange || changeLabel || meta) && (
          <div className="text-right">
            {formattedChange ? (
              <p className={cn("text-xs font-medium leading-3 tracking-[-0.02em]", changeToneClassName)}>
                {formattedChange}
              </p>
            ) : null}
            <p className="mt-1 text-xs font-medium leading-3 tracking-[-0.02em] text-[#64748B]">
              {changeLabel || meta}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardStatCard;
