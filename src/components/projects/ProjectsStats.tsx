
import React, { useMemo } from "react";
import {
  CalendarDays,
  Clock,
  MessageSquareQuote,
  Pause,
  CheckCircle,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { Project, ProjectStatus } from "@/types";
import { cn } from "@/lib/utils";

interface ProjectsStatsProps {
  projects: Project[];
}

type StatConfig = {
  status: ProjectStatus;
  label: string;
  Icon: typeof Clock;
};

const STATUS_CARDS: StatConfig[] = [
  { status: "Planning", label: "Planning", Icon: CalendarDays },
  { status: "In progress", label: "In Progress", Icon: Clock },
  { status: "Awaiting Feedback", label: "Awaiting Feedback", Icon: MessageSquareQuote },
  { status: "Completed", label: "Completed", Icon: CheckCircle },
  { status: "Paused", label: "Paused", Icon: Pause },
  { status: "Cancelled", label: "Cancelled", Icon: X },
];

function isInCalendarMonth(d: Date, y: number, m: number) {
  return d.getFullYear() === y && d.getMonth() === m;
}

const ProjectsStats: React.FC<ProjectsStatsProps> = ({ projects }) => {
  const now = new Date();
  const y = now.getFullYear();
  const mo = now.getMonth();
  const prev = new Date(y, mo - 1, 1);
  const py = prev.getFullYear();
  const pm = prev.getMonth();

  const rows = useMemo(() => {
    return STATUS_CARDS.map(({ status, label, Icon }) => {
      const total = projects.filter((p) => p.status === status).length;
      const thisMonth = projects.filter(
        (p) =>
          p.status === status &&
          isInCalendarMonth(p.createdAt, y, mo)
      ).length;
      const lastMonth = projects.filter(
        (p) =>
          p.status === status &&
          isInCalendarMonth(p.createdAt, py, pm)
      ).length;

      let pct: number;
      if (lastMonth === 0) {
        pct = thisMonth > 0 ? 100 : 0;
      } else {
        pct = Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
      }

      return { status, label, Icon, total, pct };
    });
  }, [projects, y, mo, py, pm]);

  return (
    <div className="mb-6 flex flex-wrap gap-4">
      {rows.map(({ label, Icon, total, pct }) => {
        const isUp = pct > 0;
        const isDown = pct < 0;
        const isFlat = pct === 0;
        return (
          <div
            key={label}
            className="box-border flex h-[130px] min-w-[200px] flex-1 flex-col justify-between rounded-[10px] border border-border-soft bg-card p-3 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
            style={{ flexBasis: "200px" }}
          >
            <div className="flex min-h-0 items-center gap-2">
              <div className="box-border flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-border-soft text-brand-accent">
                <Icon
                  className="h-4 w-4 shrink-0"
                  strokeWidth={1.5}
                />
              </div>
              <span className="text-[14px] font-medium leading-5 tracking-[-0.02em] text-muted-foreground">
                {label}
              </span>
            </div>

            <div className="flex items-end justify-between gap-2">
              <p className="m-0 text-[24px] font-bold leading-8 text-foreground">
                {total}
              </p>
              <div className="flex flex-col items-end gap-1 text-right">
                <div
                  className={cn(
                    "flex items-center gap-0.5 text-[12px] font-medium leading-3 tracking-[-0.02em]",
                    isUp && "text-green-600 dark:text-green-400",
                    isDown && "text-red-500 dark:text-red-400",
                    isFlat && "text-muted-foreground"
                  )}
                >
                  {isUp && <TrendingUp className="h-3 w-3" strokeWidth={1.2} />}
                  {isDown && <TrendingDown className="h-3 w-3" strokeWidth={1.2} />}
                  {isFlat && !isUp && !isDown && <Minus className="h-3 w-3" strokeWidth={1.2} />}
                  {isUp && "+"}
                  {pct}%
                </div>
                <span className="whitespace-nowrap text-[12px] font-medium leading-3 tracking-[-0.02em] text-muted-foreground">
                  from last month
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProjectsStats;
