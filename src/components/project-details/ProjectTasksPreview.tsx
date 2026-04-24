
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ArrowRight, Plus, Clock, Flag, ChevronDown, ChevronRight, CheckCircle, Circle } from "lucide-react";
import { TaskWithRelations, TaskStatus } from "@/types/task";
import { useNavigate } from "react-router-dom";
import { useAssigneeNames } from "@/hooks/useAssigneeNames";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ProjectTasksPreviewProps {
  projectId: string;
  tasks: TaskWithRelations[];
  isLoading: boolean;
  onCreateTask: () => void;
}

// ── Style constants (mirrored from ClickUpTaskList) ──────────────────────────

const colWidths = {
  task: 321.75,
  assignee: 180,
  due: 160,
  priority: 100,
  status: 180,
};

const statusConfig: Record<TaskStatus, { dot: string; label: string }> = {
  Planning:           { dot: '#61A6FA', label: 'PLANNING' },
  'In progress':      { dot: '#FBBD23', label: 'IN PROGRESS' },
  'Awaiting Feedback':{ dot: '#8B5CF6', label: 'AWAITING FEEDBACK' },
  Completed:          { dot: '#22C55E', label: 'COMPLETED' },
  Paused:             { dot: '#94A3B8', label: 'PAUSED' },
  Cancelled:          { dot: '#EF4444', label: 'CANCELLED' },
};

const statusBadgeConfig: Record<TaskStatus, { bg: string; fg: string; ring: string }> = {
  Planning:            { bg: '#F9FAFB', fg: '#374151', ring: 'rgba(75,85,99,0.2)' },
  'In progress':       { bg: '#DBEAFE', fg: '#1D4ED8', ring: 'rgba(29,78,216,0.2)' },
  'Awaiting Feedback': { bg: '#F3E8FF', fg: '#7C3AED', ring: 'rgba(124,58,237,0.2)' },
  Paused:              { bg: '#FEF9C3', fg: '#854D0E', ring: 'rgba(133,77,14,0.2)' },
  Completed:           { bg: '#DCFCE7', fg: '#166534', ring: 'rgba(22,101,52,0.2)' },
  Cancelled:           { bg: '#FEE2E2', fg: '#B91C1C', ring: 'rgba(185,28,28,0.2)' },
};

const priorityConfig: Record<string, { bg: string; fg: string }> = {
  Urgent: { bg: '#FEE2E2', fg: '#DC2626' },
  High:   { bg: '#FFEDD5', fg: '#EA580C' },
  Normal: { bg: '#EFF6FF', fg: '#2563EB' },
  Low:    { bg: '#F1F5F9', fg: '#64748B' },
};

const headerCellStyle: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontWeight: 400,
  fontSize: 12,
  lineHeight: '16px',
  letterSpacing: '0.6px',
  color: '#64748B',
};

const statusOrder: TaskStatus[] = [
  'Planning', 'In progress', 'Awaiting Feedback', 'Paused', 'Completed', 'Cancelled',
];

// ── Sub-components ───────────────────────────────────────────────────────────

const getInitials = (name: string) =>
  name.trim().split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

const Avatar24 = ({ name }: { name: string }) => (
  <div
    title={name}
    className="flex items-center justify-center shrink-0"
    style={{
      width: 24, height: 24, borderRadius: 9999,
      background: '#0080FF', border: '2px solid #F8FAFC',
      boxShadow: '0px 0px 0px 1px #E2E8F0',
      fontFamily: 'Inter, sans-serif', fontWeight: 500,
      fontSize: 12, lineHeight: '16px', color: '#F8FAFC',
    }}
  >
    {getInitials(name)}
  </div>
);

// ── Main component ───────────────────────────────────────────────────────────

const ProjectTasksPreview: React.FC<ProjectTasksPreviewProps> = ({
  projectId,
  tasks,
  isLoading,
  onCreateTask,
}) => {
  const navigate = useNavigate();
  const { getAssigneeNames } = useAssigneeNames();
  const [collapsedGroups, setCollapsedGroups] = React.useState<Set<string>>(new Set());

  const toggleGroup = (status: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      next.has(status) ? next.delete(status) : next.add(status);
      return next;
    });
  };

  const handleGoToTask = (taskId: string) => {
    navigate(`/tasks?taskId=${taskId}&projectId=${projectId}`);
  };

  const handleViewAllTasks = () => {
    navigate(`/tasks?projectId=${projectId}`);
  };

  // Group tasks by status (top-level only)
  const groupedTasks = tasks.reduce((acc, task) => {
    if (!task.parent_task_id) {
      if (!acc[task.status]) acc[task.status] = [];
      acc[task.status].push(task);
    }
    return acc;
  }, {} as Record<string, TaskWithRelations[]>);

  const renderTaskRow = (task: TaskWithRelations, index: number) => {
    const assigneeNames = getAssigneeNames(task.assignees || []);
    const priority = priorityConfig[task.priority] || priorityConfig.Normal;
    const statusBadge = statusBadgeConfig[task.status] || statusBadgeConfig.Planning;
    const subtaskCount = task.subtasks?.length ?? 0;

    return (
      <div
        key={task.id}
        onClick={() => handleGoToTask(task.id)}
        className="flex items-center hover:bg-slate-50/80 cursor-pointer group transition-colors"
        style={{
          height: 48,
          padding: '12px 24px',
          gap: 24,
          borderTop: index > 0 ? '1px solid rgba(226,232,240,0.5)' : undefined,
          opacity: task.status === 'Completed' ? 0.75 : 1,
        }}
      >
        {/* Task */}
        <div className="flex items-center min-w-0" style={{ width: colWidths.task, gap: 10 }}>
          <div
            className="flex items-center justify-center shrink-0"
            style={{ width: 20, height: 20, borderRadius: 10 }}
          >
            {task.status === 'Completed' ? (
              <CheckCircle style={{ width: 16, height: 16, color: '#22C55E' }} strokeWidth={1.67} />
            ) : (
              <Circle style={{ width: 16, height: 16, color: '#94A3B8' }} strokeWidth={1.67} />
            )}
          </div>
          <span
            className="truncate"
            style={{
              fontFamily: 'Inter, sans-serif', fontWeight: 500,
              fontSize: 14, lineHeight: '20px', color: '#020817',
              textDecoration: task.status === 'Completed' ? 'line-through' : 'none',
            }}
          >
            {task.title}
          </span>
          {subtaskCount > 0 && (
            <span
              className="shrink-0 inline-flex items-center"
              style={{
                padding: '0 8px', background: 'rgba(241,245,249,0.6)', borderRadius: 10,
                fontFamily: 'Inter, sans-serif', fontWeight: 500,
                fontSize: 12, lineHeight: '16px', color: '#64748B',
              }}
            >
              {subtaskCount}
            </span>
          )}
        </div>

        {/* Assignee */}
        <div className="flex items-center" style={{ width: colWidths.assignee }}>
          {assigneeNames.length > 0 ? (
            <div className="flex items-center">
              {assigneeNames.slice(0, 3).map((name, i) => (
                <div key={i} style={{ marginLeft: i === 0 ? 0 : -6 }}>
                  <Avatar24 name={name} />
                </div>
              ))}
              {assigneeNames.length > 3 && (
                <span style={{ marginLeft: 6, fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 12, color: '#64748B' }}>
                  +{assigneeNames.length - 3}
                </span>
              )}
            </div>
          ) : (
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#94A3B8' }}>—</span>
          )}
        </div>

        {/* Due date */}
        <div className="flex items-center" style={{ width: colWidths.due, gap: 6 }}>
          {task.due_date ? (
            <>
              <Calendar style={{ width: 14, height: 14, color: '#64748B' }} strokeWidth={1.17} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 14, lineHeight: '20px', color: '#64748B' }}>
                {format(task.due_date, 'MMM dd, yyyy')}
              </span>
            </>
          ) : (
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#94A3B8' }}>—</span>
          )}
        </div>

        {/* Priority */}
        <div className="flex items-center" style={{ width: colWidths.priority }}>
          <span
            className="inline-flex items-center"
            style={{
              padding: '4px 8px', gap: 6, background: priority.bg, borderRadius: 10,
              fontFamily: 'Inter, sans-serif', fontWeight: 500,
              fontSize: 12, lineHeight: '16px', color: priority.fg,
            }}
          >
            <Flag style={{ width: 12, height: 12, color: priority.fg }} strokeWidth={1.5} />
            {task.priority}
          </span>
        </div>

        {/* Status */}
        <div className="flex items-center" style={{ width: colWidths.status }}>
          <span
            className="inline-flex items-center"
            style={{
              padding: '4px 8px', background: statusBadge.bg,
              boxShadow: `inset 0px 0px 0px 1px ${statusBadge.ring}`,
              borderRadius: 10, fontFamily: 'Inter, sans-serif',
              fontWeight: 500, fontSize: 12, lineHeight: '16px', color: statusBadge.fg,
            }}
          >
            {task.status}
          </span>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-semibold text-xl">Project Tasks</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onCreateTask} className="gap-1">
              <Plus className="h-4 w-4" />
              Create Task
            </Button>
            {tasks.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleViewAllTasks} className="gap-1">
                View All ({tasks.length})
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-0 pb-0">
        {isLoading ? (
          <div className="space-y-3 px-6 pb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-muted rounded-md animate-pulse" />
            ))}
          </div>
        ) : tasks.filter(t => !t.parent_task_id).length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">No tasks created yet</p>
            <Button onClick={onCreateTask} className="gap-2">
              <Plus className="h-4 w-4" />
              Create First Task
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Column headers */}
            <div
              className="flex items-center"
              style={{
                height: 33, padding: '8px 24px', gap: 24,
                background: 'rgba(241,245,249,0.6)',
                borderBottom: '1px solid rgba(226,232,240,0.5)',
              }}
            >
              <div style={{ ...headerCellStyle, width: colWidths.task }}>Task</div>
              <div style={{ ...headerCellStyle, width: colWidths.assignee }}>Assignee</div>
              <div style={{ ...headerCellStyle, width: colWidths.due }}>Due Date</div>
              <div style={{ ...headerCellStyle, width: colWidths.priority }}>Priority</div>
              <div style={{ ...headerCellStyle, width: colWidths.status }}>Status</div>
            </div>

            {/* Grouped rows */}
            {statusOrder.map(status => {
              const group = groupedTasks[status] || [];
              if (group.length === 0) return null;

              const cfg = statusConfig[status];
              const isCollapsed = collapsedGroups.has(status);

              return (
                <div key={status}>
                  {/* Group header */}
                  <div
                    onClick={() => toggleGroup(status)}
                    className="flex items-center cursor-pointer hover:bg-slate-50 transition-colors"
                    style={{
                      height: 36, padding: '6px 24px', gap: 10,
                      background: '#F8FAFC',
                      borderBottom: '1px solid rgba(226,232,240,0.5)',
                    }}
                  >
                    {isCollapsed ? (
                      <ChevronRight style={{ width: 16, height: 16, color: '#64748B' }} strokeWidth={1.67} />
                    ) : (
                      <ChevronDown style={{ width: 16, height: 16, color: '#64748B' }} strokeWidth={1.67} />
                    )}
                    <div style={{ width: 6, height: 20, background: cfg.dot, borderRadius: 20 }} />
                    <span style={{
                      fontFamily: 'Inter, sans-serif', fontWeight: 600,
                      fontSize: 12, lineHeight: '16px', letterSpacing: '0.4px', color: '#475569',
                    }}>
                      {cfg.label}
                    </span>
                    <span style={{
                      fontFamily: 'Inter, sans-serif', fontWeight: 500,
                      fontSize: 12, color: '#94A3B8',
                    }}>
                      {group.length}
                    </span>
                  </div>

                  {/* Task rows */}
                  {!isCollapsed && group.map((task, i) => renderTaskRow(task, i))}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectTasksPreview;
