import React from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Calendar, Flag, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TaskStatus, TaskWithRelations } from "@/types/task";

const statusBadgeConfig: Record<TaskStatus, { bg: string; fg: string; ring: string }> = {
  Planning: {
    bg: "hsl(var(--status-planning-bg))",
    fg: "hsl(var(--status-planning-fg))",
    ring: "hsl(var(--status-planning-ring))",
  },
  "In progress": {
    bg: "hsl(var(--status-progress-bg))",
    fg: "hsl(var(--status-progress-fg))",
    ring: "hsl(var(--status-progress-ring))",
  },
  "Awaiting Feedback": {
    bg: "hsl(var(--status-feedback-bg))",
    fg: "hsl(var(--status-feedback-fg))",
    ring: "hsl(var(--status-feedback-ring))",
  },
  Paused: {
    bg: "hsl(var(--status-paused-bg))",
    fg: "hsl(var(--status-paused-fg))",
    ring: "hsl(var(--status-paused-ring))",
  },
  Completed: {
    bg: "hsl(var(--status-completed-bg))",
    fg: "hsl(var(--status-completed-fg))",
    ring: "hsl(var(--status-completed-ring))",
  },
  Cancelled: {
    bg: "hsl(var(--status-cancelled-bg))",
    fg: "hsl(var(--status-cancelled-fg))",
    ring: "hsl(var(--status-cancelled-ring))",
  },
};

const priorityConfig: Record<string, { bg: string; fg: string }> = {
  Urgent: { bg: "hsl(var(--priority-urgent-bg))", fg: "hsl(var(--priority-urgent-fg))" },
  High: { bg: "hsl(var(--priority-high-bg))", fg: "hsl(var(--priority-high-fg))" },
  Normal: { bg: "hsl(var(--priority-normal-bg))", fg: "hsl(var(--priority-normal-fg))" },
  Low: { bg: "hsl(var(--priority-low-bg))", fg: "hsl(var(--priority-low-fg))" },
};

const DashboardStatusBadge = ({ status }: { status: string }) => {
  const config = statusBadgeConfig[status as TaskStatus] || statusBadgeConfig.Planning;

  return (
    <span
      className="inline-flex max-w-full items-center truncate"
      style={{
        padding: "4px 8px",
        background: config.bg,
        boxShadow: `inset 0px 0px 0px 1px ${config.ring}`,
        borderRadius: 10,
        fontFamily: "Inter, sans-serif",
        fontWeight: 500,
        fontSize: 12,
        lineHeight: "16px",
        color: config.fg,
      }}
    >
      {status}
    </span>
  );
};

const DashboardPriorityBadge = ({ priority }: { priority: string }) => {
  const config = priorityConfig[priority] || priorityConfig.Normal;

  return (
    <span
      className="inline-flex max-w-full items-center truncate"
      style={{
        padding: "4px 8px",
        gap: 6,
        background: config.bg,
        borderRadius: 10,
        fontFamily: "Inter, sans-serif",
        fontWeight: 500,
        fontSize: 12,
        lineHeight: "16px",
        color: config.fg,
      }}
    >
      <Flag className="shrink-0" style={{ width: 12, height: 12, color: config.fg }} strokeWidth={1.5} />
      <span className="min-w-0 truncate">{priority}</span>
    </span>
  );
};

interface MyTasksTableProps {
  tasks: TaskWithRelations[];
  title?: string;
  showAll?: boolean;
}

const MyTasksTable: React.FC<MyTasksTableProps> = ({ 
  tasks, 
  title = "My Active Tasks",
  showAll = false 
}) => {
  const navigate = useNavigate();
  
  const activeTasks = tasks
    .filter(task => task.status !== 'Completed' && task.status !== 'Cancelled')
    .sort((a, b) => {
      // Sort by due date (tasks with due dates first)
      if (a.due_date && !b.due_date) return -1;
      if (!a.due_date && b.due_date) return 1;
      if (a.due_date && b.due_date) {
        return a.due_date.getTime() - b.due_date.getTime();
      }
      return b.created_at.getTime() - a.created_at.getTime();
    })
    .slice(0, showAll ? undefined : 5);

  const isOverdue = (dueDate: Date | undefined) => {
    if (!dueDate) return false;
    return dueDate < new Date();
  };

  return (
    <section className="rounded-[12px] border border-border-soft bg-card p-3 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-border-soft text-brand-accent">
            <ScrollText className="h-4 w-4" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-[14px] font-semibold leading-[120%] text-foreground">
              {title}
            </p>
            <p className="mt-1 text-[11px] leading-[100%] text-muted-foreground">
              View your current assignments
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/tasks")}
          className="h-8 shrink-0 gap-1 rounded-[7px] px-2 text-xs font-medium text-muted-foreground hover:bg-surface-3 hover:text-foreground"
        >
          View All Tasks
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-3 overflow-hidden rounded-[8px]">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Task</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Due Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No active tasks found. You're all caught up!
                </TableCell>
              </TableRow>
            ) : (
              activeTasks.map((task) => (
                <TableRow
                  key={task.id}
                  onClick={() => navigate(`/tasks?taskId=${task.id}${task.project_id ? `&projectId=${task.project_id}` : ""}`)}
                  className="cursor-pointer"
                >
                  <TableCell className="max-w-xs font-medium">
                    <div className="truncate">{task.title}</div>
                    {task.description && (
                      <div className="text-xs text-muted-foreground truncate">
                        {task.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <DashboardStatusBadge status={task.status} />
                  </TableCell>
                  <TableCell>
                    <DashboardPriorityBadge priority={task.priority} />
                  </TableCell>
                  <TableCell>
                    {task.due_date ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className={`text-xs ${
                          isOverdue(task.due_date) ? 'text-red-600 font-medium dark:text-red-400' : 'text-muted-foreground'
                        }`}>
                          {format(task.due_date, "MMM dd")}
                          {isOverdue(task.due_date) && " (Overdue)"}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">No due date</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
};

export default MyTasksTable;
