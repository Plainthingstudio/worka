import React, { useState, useRef } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Calendar,
  Flag,
  CheckCircle,
  Circle,
  Plus,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Check,
} from 'lucide-react';
import { TaskWithRelations, TaskStatus } from '@/types/task';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAssigneeNames } from '@/hooks/useAssigneeNames';
import { InitialAvatar } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

type SortKey = 'due_date' | 'priority';
type SortDir = 'asc' | 'desc';

const priorityRank: Record<string, number> = {
  Low: 0,
  Normal: 1,
  High: 2,
  Urgent: 3,
};

interface ClickUpTaskListProps {
  tasks: TaskWithRelations[];
  isLoading: boolean;
  onTaskClick: (task: TaskWithRelations) => void;
  onUpdateTask: (taskId: string, updates: any) => Promise<boolean>;
  onAddTask: (status: TaskStatus) => void;
}

const statusConfig: Record<TaskStatus, { label: string; dot: string }> = {
  'Planning':         { label: 'PLANNING',         dot: 'hsl(var(--status-dot-planning))' },
  'In progress':      { label: 'IN PROGRESS',      dot: 'hsl(var(--status-dot-progress))' },
  'Awaiting Feedback':{ label: 'AWAITING FEEDBACK',dot: 'hsl(var(--status-dot-feedback))' },
  'Completed':        { label: 'COMPLETED',        dot: 'hsl(var(--status-dot-completed))' },
  'Paused':           { label: 'PAUSED',           dot: 'hsl(var(--status-dot-paused))' },
  'Cancelled':        { label: 'CANCELLED',        dot: 'hsl(var(--status-dot-cancelled))' },
};

const priorityConfig: Record<string, { bg: string; fg: string }> = {
  Urgent: { bg: 'hsl(var(--priority-urgent-bg))', fg: 'hsl(var(--priority-urgent-fg))' },
  High:   { bg: 'hsl(var(--priority-high-bg))',   fg: 'hsl(var(--priority-high-fg))' },
  Normal: { bg: 'hsl(var(--priority-normal-bg))', fg: 'hsl(var(--priority-normal-fg))' },
  Low:    { bg: 'hsl(var(--priority-low-bg))',    fg: 'hsl(var(--priority-low-fg))' },
};

const statusBadgeConfig: Record<TaskStatus, { bg: string; fg: string; ring: string }> = {
  'Planning':         { bg: 'hsl(var(--status-planning-bg))',  fg: 'hsl(var(--status-planning-fg))',  ring: 'hsl(var(--status-planning-ring))' },
  'In progress':      { bg: 'hsl(var(--status-progress-bg))',  fg: 'hsl(var(--status-progress-fg))',  ring: 'hsl(var(--status-progress-ring))' },
  'Awaiting Feedback':{ bg: 'hsl(var(--status-feedback-bg))',  fg: 'hsl(var(--status-feedback-fg))',  ring: 'hsl(var(--status-feedback-ring))' },
  'Paused':           { bg: 'hsl(var(--status-paused-bg))',    fg: 'hsl(var(--status-paused-fg))',    ring: 'hsl(var(--status-paused-ring))' },
  'Completed':        { bg: 'hsl(var(--status-completed-bg))', fg: 'hsl(var(--status-completed-fg))', ring: 'hsl(var(--status-completed-ring))' },
  'Cancelled':        { bg: 'hsl(var(--status-cancelled-bg))', fg: 'hsl(var(--status-cancelled-fg))', ring: 'hsl(var(--status-cancelled-ring))' },
};

// Task is widest; assignee + due are medium; priority + status share equal width for even spacing
const colWidths = {
  task: 520,
  assignee: 190,
  due: 190,
  priority: 168,
  status: 168,
};

const listMinWidth =
  colWidths.task +
  colWidths.assignee +
  colWidths.due +
  colWidths.priority +
  colWidths.status +
  4 * 24; // row gap between columns

interface ColumnHeadersProps {
  sortKey: SortKey | null;
  sortDir: SortDir;
  onToggleSort: (key: SortKey) => void;
}

const SortIndicator = ({ active, dir }: { active: boolean; dir: SortDir }) => {
  if (!active) {
    return (
      <ArrowUpDown
        className="text-text-disabled"
        style={{ width: 12, height: 12 }}
        strokeWidth={1.67}
      />
    );
  }
  return dir === 'asc' ? (
    <ArrowUp className="text-foreground" style={{ width: 12, height: 12 }} strokeWidth={2} />
  ) : (
    <ArrowDown className="text-foreground" style={{ width: 12, height: 12 }} strokeWidth={2} />
  );
};

const ColumnHeaders = ({ sortKey, sortDir, onToggleSort }: ColumnHeadersProps) => (
  <div
    className="flex items-center bg-card"
    style={{
      height: 33,
      padding: '8px 48px 8px 0',
      gap: 24,
    }}
  >
    <div
      className="text-muted-foreground shrink-0 bg-card"
      style={{
        ...headerCellStyle,
        width: colWidths.task,
        position: 'sticky',
        left: 0,
        zIndex: 2,
        paddingLeft: 48,
        marginLeft: 0,
      }}
    >
      Task
    </div>
    <div style={headerCellStyle} className="text-muted-foreground">
      <span style={{ width: colWidths.assignee, display: 'inline-block' }}>Assignee</span>
    </div>
    <button
      type="button"
      onClick={() => onToggleSort('due_date')}
      className={cn(
        "inline-flex items-center hover:text-foreground transition-colors bg-transparent border-none p-0 text-left",
        sortKey === 'due_date' ? 'text-foreground' : 'text-muted-foreground'
      )}
      style={{
        ...headerCellStyle,
        width: colWidths.due,
        gap: 6,
        cursor: 'pointer',
      }}
    >
      <span>Due Date</span>
      <SortIndicator active={sortKey === 'due_date'} dir={sortDir} />
    </button>
    <button
      type="button"
      onClick={() => onToggleSort('priority')}
      className={cn(
        "inline-flex items-center hover:text-foreground transition-colors bg-transparent border-none p-0 text-left",
        sortKey === 'priority' ? 'text-foreground' : 'text-muted-foreground'
      )}
      style={{
        ...headerCellStyle,
        width: colWidths.priority,
        gap: 6,
        cursor: 'pointer',
      }}
    >
      <span>Priority</span>
      <SortIndicator active={sortKey === 'priority'} dir={sortDir} />
    </button>
    <div style={{ ...headerCellStyle, width: colWidths.status }} className="text-muted-foreground">Status</div>
  </div>
);

const headerCellStyle: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontWeight: 400,
  fontSize: 12,
  lineHeight: '16px',
  letterSpacing: '0.6px',
};

const Avatar24 = ({ name }: { name: string }) => (
  <InitialAvatar name={name} size={24} />
);

export const ClickUpTaskList = ({
  tasks,
  isLoading,
  onTaskClick,
  onUpdateTask,
  onAddTask,
}: ClickUpTaskListProps) => {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [collapsedSubtasks, setCollapsedSubtasks] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const { getAssigneeNames, teamMembers } = useAssigneeNames();

  // Inline editing state
  const [editingTitle, setEditingTitle] = useState<{ taskId: string; value: string } | null>(null);
  const [editingDate, setEditingDate] = useState<{ taskId: string; value: string } | null>(null);
  const [assigneePopoverTask, setAssigneePopoverTask] = useState<string | null>(null);
  const [draftAssignees, setDraftAssignees] = useState<string[]>([]);

  const handleToggleSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir('asc');
      return;
    }
    if (sortDir === 'asc') {
      setSortDir('desc');
      return;
    }
    setSortKey(null);
    setSortDir('asc');
  };

  const sortTasks = (list: TaskWithRelations[]): TaskWithRelations[] => {
    if (!sortKey) return list;
    const dirMul = sortDir === 'asc' ? 1 : -1;
    return [...list].sort((a, b) => {
      if (sortKey === 'due_date') {
        const aTime = a.due_date ? new Date(a.due_date).getTime() : null;
        const bTime = b.due_date ? new Date(b.due_date).getTime() : null;
        if (aTime === null && bTime === null) return 0;
        if (aTime === null) return 1;
        if (bTime === null) return -1;
        return (aTime - bTime) * dirMul;
      }
      if (sortKey === 'priority') {
        const aRank = priorityRank[a.priority] ?? -1;
        const bRank = priorityRank[b.priority] ?? -1;
        return (aRank - bRank) * dirMul;
      }
      return 0;
    });
  };

  const toggleGroup = (status: string) => {
    const next = new Set(collapsedGroups);
    next.has(status) ? next.delete(status) : next.add(status);
    setCollapsedGroups(next);
  };

  const toggleSubtasks = (taskId: string) => {
    const next = new Set(collapsedSubtasks);
    next.has(taskId) ? next.delete(taskId) : next.add(taskId);
    setCollapsedSubtasks(next);
  };

  const toggleTaskComplete = async (task: TaskWithRelations, e: React.MouseEvent) => {
    e.stopPropagation();
    const isCompleted = task.status === 'Completed';
    await onUpdateTask(task.id, {
      status: isCompleted ? 'In progress' : 'Completed',
      completed_at: isCompleted ? null : new Date().toISOString(),
    });
  };

  const groupedTasks = tasks.reduce((acc, task) => {
    if (!task.parent_task_id) {
      const status = task.status;
      if (!acc[status]) acc[status] = [];
      acc[status].push(task);
    }
    return acc;
  }, {} as Record<string, TaskWithRelations[]>);

  const getSubtasks = (task: TaskWithRelations): TaskWithRelations[] => task.subtasks || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-sm text-muted-foreground">Loading tasks...</div>
      </div>
    );
  }

  const statusOrder: TaskStatus[] = ['Planning', 'In progress', 'Awaiting Feedback', 'Paused', 'Completed', 'Cancelled'];
  const priorityOptions = ['Urgent', 'High', 'Normal', 'Low'];
  const statusOptions: TaskStatus[] = ['Planning', 'In progress', 'Awaiting Feedback', 'Paused', 'Completed', 'Cancelled'];

  const renderTaskRow = (
    task: TaskWithRelations,
    index: number,
    isSubtask = false
  ) => {
    const assigneeNames = getAssigneeNames(task.assignees || []);
    const subtasks = isSubtask ? [] : getSubtasks(task);
    const priority = priorityConfig[task.priority] || priorityConfig.Normal;
    const statusLabel = task.status;

    const showRowBg = !(index === 0 && !isSubtask);
    const showBorderTop = true;
    const showBorderBottom = false;

    const isEditingTitle = editingTitle?.taskId === task.id;
    const isEditingDate = editingDate?.taskId === task.id;

    return (
      <div
        key={isSubtask ? `sub-${task.id}` : task.id}
        onClick={() => onTaskClick(task)}
        className={cn(
          "flex items-center bg-card hover:bg-surface-hover cursor-pointer group transition-colors",
          showBorderTop && "border-t border-border-subtle",
          showBorderBottom && "border-b border-border-subtle"
        )}
        style={{
          height: 48,
          padding: '12px 48px 12px 0',
          gap: 24,
          opacity: task.status === 'Completed' ? 0.75 : 1,
        }}
      >
        {/* Task column */}
        <div
          className={cn(
            'flex items-center shrink-0 transition-colors bg-card group-hover:bg-surface-hover'
          )}
          style={{
            width: colWidths.task,
            gap: 12,
            position: 'sticky',
            left: 0,
            zIndex: 1,
            paddingLeft: 48,
            height: 47,
            marginTop: -12,
            marginBottom: -12,
          }}
        >
          <div className="flex items-center shrink-0" style={{ gap: 8 }}>
            {isSubtask && (
              <div className="bg-border-soft" style={{ width: 24, height: 2 }} />
            )}
            {!isSubtask && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (subtasks.length > 0) toggleSubtasks(task.id);
                }}
                className={cn(
                  'inline-flex items-center justify-center',
                  subtasks.length === 0 && 'opacity-0 pointer-events-none'
                )}
                style={{ width: 20, height: 20, borderRadius: 10 }}
              >
                {collapsedSubtasks.has(task.id) ? (
                  <ChevronRight className="text-muted-foreground" style={{ width: 16, height: 16 }} strokeWidth={1.67} />
                ) : (
                  <ChevronDown className="text-muted-foreground" style={{ width: 16, height: 16 }} strokeWidth={1.67} />
                )}
              </button>
            )}
            <button
              type="button"
              onClick={(e) => toggleTaskComplete(task, e)}
              className="inline-flex items-center justify-center"
              style={{ width: 20, height: 20, borderRadius: 10 }}
            >
              {task.status === 'Completed' ? (
                <CheckCircle style={{ width: 16, height: 16, color: 'hsl(var(--status-dot-completed))' }} strokeWidth={1.67} />
              ) : (
                <Circle className="text-muted-foreground" style={{ width: 16, height: 16 }} strokeWidth={1.67} />
              )}
            </button>
          </div>

          <div className="flex items-center min-w-0 flex-1" style={{ gap: 8 }}>
            {isEditingTitle ? (
              <input
                autoFocus
                value={editingTitle.value}
                onChange={(e) => setEditingTitle({ taskId: task.id, value: e.target.value })}
                onBlur={async () => {
                  if (editingTitle.value.trim() && editingTitle.value.trim() !== task.title) {
                    await onUpdateTask(task.id, { title: editingTitle.value.trim() });
                  }
                  setEditingTitle(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.currentTarget.blur();
                  if (e.key === 'Escape') setEditingTitle(null);
                  e.stopPropagation();
                }}
                onClick={(e) => e.stopPropagation()}
                className="min-w-0 flex-1 bg-card border border-brand rounded px-2 outline-none focus:ring-1 focus:ring-brand text-foreground"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 14,
                  lineHeight: '20px',
                  height: 28,
                }}
              />
            ) : (
              <span
                className="truncate hover:underline text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingTitle({ taskId: task.id, value: task.title });
                }}
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 14,
                  lineHeight: '20px',
                  textDecoration: task.status === 'Completed' ? 'line-through' : undefined,
                  cursor: 'text',
                }}
              >
                {task.title}
              </span>
            )}
            {!isSubtask && subtasks.length > 0 && (
              <span
                className="shrink-0 inline-flex items-center bg-surface-3/60 text-muted-foreground"
                style={{
                  padding: '0 8px',
                  borderRadius: 10,
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 12,
                  lineHeight: '16px',
                }}
              >
                {subtasks.length}
              </span>
            )}
          </div>
        </div>

        {/* Assignee */}
        <div className="flex items-center" style={{ width: colWidths.assignee }}>
          <Popover
            open={assigneePopoverTask === task.id}
            onOpenChange={(open) => {
              if (open) {
                setAssigneePopoverTask(task.id);
                setDraftAssignees(task.assignees?.map(String) || []);
              } else {
                setAssigneePopoverTask(null);
              }
            }}
          >
            <PopoverTrigger asChild>
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center hover:opacity-80 transition-opacity"
                style={{ gap: 0, background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                {assigneeNames.length > 0 ? (
                  <div className="flex items-center">
                    {assigneeNames.slice(0, 3).map((name, i) => (
                      <div key={i} style={{ marginLeft: i === 0 ? 0 : -6 }}>
                        <Avatar24 name={name} />
                      </div>
                    ))}
                    {assigneeNames.length > 3 && (
                      <span
                        className="text-muted-foreground"
                        style={{
                          marginLeft: 6,
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          fontSize: 12,
                        }}
                      >
                        +{assigneeNames.length - 3}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-text-disabled" style={{ fontFamily: 'Inter, sans-serif', fontSize: 14 }}>Assign…</span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-56 p-2"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col gap-1 max-h-48 overflow-y-auto mb-2">
                {teamMembers.map((member) => {
                  const memberId = member.user_id || member.id;
                  const isChecked = draftAssignees.includes(memberId);
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDraftAssignees((prev) =>
                          isChecked ? prev.filter((id) => id !== memberId) : [...prev, memberId]
                        );
                      }}
                      className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent text-left w-full transition-colors"
                    >
                      <div
                        className="flex items-center justify-center shrink-0"
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 4,
                          border: isChecked ? '2px solid hsl(var(--brand))' : '2px solid hsl(var(--text-disabled))',
                          background: isChecked ? 'hsl(var(--brand))' : 'transparent',
                        }}
                      >
                        {isChecked && <Check style={{ width: 10, height: 10, color: 'hsl(var(--brand-foreground))' }} strokeWidth={2.5} />}
                      </div>
                      <Avatar24 name={member.name} />
                      <span className="text-foreground" style={{ fontFamily: 'Inter, sans-serif', fontSize: 13 }}>
                        {member.name}
                      </span>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateTask(task.id, { assignees: draftAssignees });
                  setAssigneePopoverTask(null);
                }}
                className="w-full text-center text-sm font-medium rounded-md py-1.5 transition-colors bg-brand text-brand-foreground"
              >
                Apply
              </button>
            </PopoverContent>
          </Popover>
        </div>

        {/* Due date */}
        <div className="flex items-center" style={{ width: colWidths.due, gap: 8 }}>
          {isEditingDate ? (
            <input
              type="date"
              autoFocus
              value={editingDate.value}
              onChange={(e) => setEditingDate({ taskId: task.id, value: e.target.value })}
              onBlur={async () => {
                if (editingDate.value) {
                  await onUpdateTask(task.id, { due_date: new Date(editingDate.value).toISOString() });
                }
                setEditingDate(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.currentTarget.blur();
                if (e.key === 'Escape') setEditingDate(null);
                e.stopPropagation();
              }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-brand rounded px-2 outline-none focus:ring-1 focus:ring-brand text-muted-foreground"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 13,
                height: 28,
                width: 130,
              }}
            />
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const val = task.due_date ? format(new Date(task.due_date), 'yyyy-MM-dd') : '';
                setEditingDate({ taskId: task.id, value: val });
              }}
              className="flex items-center hover:opacity-80 transition-opacity bg-transparent border-none p-0 cursor-pointer"
              style={{ gap: 8 }}
            >
              {task.due_date ? (
                <>
                  <Calendar className="text-muted-foreground" style={{ width: 14, height: 14 }} strokeWidth={1.17} />
                  <span
                    className="text-muted-foreground"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: 14,
                      lineHeight: '20px',
                    }}
                  >
                    {format(task.due_date, 'MMM dd')}
                  </span>
                </>
              ) : (
                <span className="text-text-disabled" style={{ fontFamily: 'Inter, sans-serif', fontSize: 14 }}>Set date…</span>
              )}
            </button>
          )}
        </div>

        {/* Priority */}
        <div className="flex min-w-0 items-center" style={{ width: colWidths.priority, flexShrink: 0 }}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex max-w-full min-w-0 items-center hover:opacity-80 transition-opacity"
                style={{
                  padding: '4px 8px',
                  gap: 6,
                  background: priority.bg,
                  borderRadius: 10,
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 12,
                  lineHeight: '16px',
                  color: priority.fg,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <Flag className="shrink-0" style={{ width: 12, height: 12, color: priority.fg }} strokeWidth={1.5} />
                <span className="min-w-0 truncate">{task.priority}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
              {priorityOptions.map((p) => {
                const pc = priorityConfig[p];
                return (
                  <DropdownMenuItem
                    key={p}
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateTask(task.id, { priority: p });
                    }}
                    className="flex items-center gap-2"
                  >
                    <span
                      className="inline-flex items-center"
                      style={{
                        padding: '2px 6px',
                        background: pc.bg,
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 500,
                        color: pc.fg,
                        gap: 4,
                      }}
                    >
                      <Flag style={{ width: 10, height: 10, color: pc.fg }} strokeWidth={1.5} />
                      {p}
                    </span>
                    {task.priority === p && <Check style={{ width: 12, height: 12 }} className="ml-auto text-blue-600" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status */}
        <div className="flex min-w-0 items-center" style={{ width: colWidths.status, flexShrink: 0 }}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex max-w-full min-w-0 items-center hover:opacity-80 transition-opacity"
                style={{
                  padding: '4px 8px',
                  background: statusBadgeConfig[task.status]?.bg || 'hsl(var(--status-planning-bg))',
                  boxShadow: `inset 0px 0px 0px 1px ${statusBadgeConfig[task.status]?.ring || 'hsl(var(--status-planning-ring))'}`,
                  borderRadius: 10,
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 12,
                  lineHeight: '16px',
                  color: statusBadgeConfig[task.status]?.fg || 'hsl(var(--status-planning-fg))',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <span className="truncate">{statusLabel}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
              {statusOptions.map((s) => {
                const sc = statusBadgeConfig[s];
                return (
                  <DropdownMenuItem
                    key={s}
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateTask(task.id, {
                        status: s,
                        completed_at: s === 'Completed' ? new Date().toISOString() : null,
                      });
                    }}
                    className="flex items-center gap-2"
                  >
                    <span
                      className="inline-flex items-center"
                      style={{
                        padding: '2px 6px',
                        background: sc.bg,
                        boxShadow: `inset 0px 0px 0px 1px ${sc.ring}`,
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 500,
                        color: sc.fg,
                      }}
                    >
                      {s}
                    </span>
                    {task.status === s && <Check style={{ width: 12, height: 12 }} className="ml-auto text-blue-600" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };

  return (
    <div>
      {statusOrder.map((status) => {
        const statusTasks = sortTasks(groupedTasks[status] || []);
        if (statusTasks.length === 0) return null;

        const config = statusConfig[status];
        const isCollapsed = collapsedGroups.has(status);

        return (
          <div
            key={status}
            style={{ paddingBottom: 24, display: 'flex', flexDirection: 'column' }}
          >
            {/* Group header — outside horizontal scroll so it stays fixed horizontally */}
            <div
              onClick={() => toggleGroup(status)}
              className="flex items-center cursor-pointer group bg-surface-2 dark:bg-[hsl(222_33%_9%)]"
              style={{
                height: 36,
                padding: '6px 16px',
                gap: 10,
                borderRadius: 8,
                position: 'sticky',
                top: 0,
                zIndex: 10,
              }}
            >
              <div className="flex items-center flex-1" style={{ gap: 8 }}>
                {isCollapsed ? (
                  <ChevronRight className="text-muted-foreground" style={{ width: 16, height: 16 }} strokeWidth={1.67} />
                ) : (
                  <ChevronDown className="text-muted-foreground" style={{ width: 16, height: 16 }} strokeWidth={1.67} />
                )}
                <div
                  style={{
                    width: 6,
                    height: 20,
                    background: config.dot,
                    borderRadius: 20,
                  }}
                />
                <span
                  className="text-foreground"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    fontSize: 14,
                    lineHeight: '20px',
                  }}
                >
                  {config.label}
                </span>
                <span
                  className="inline-flex items-center bg-surface-3/60 text-muted-foreground"
                  style={{
                    padding: '0 8px',
                    borderRadius: 9999,
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: 12,
                    lineHeight: '16px',
                  }}
                >
                  {statusTasks.length}
                </span>
              </div>

              <button
                type="button"
                className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center text-muted-foreground"
                style={{
                  gap: 4,
                  padding: '0 8px',
                  height: 24,
                  borderRadius: 6,
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: 12,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onAddTask(status);
                }}
              >
                <Plus style={{ width: 12, height: 12 }} strokeWidth={1.67} />
                Add Task
              </button>
            </div>

            {/* Columns + rows — horizontally scrollable */}
            {!isCollapsed && (
              <div style={{ overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }} className="[&::-webkit-scrollbar]:hidden">
                <div style={{ minWidth: listMinWidth }}>
                  <ColumnHeaders
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onToggleSort={handleToggleSort}
                  />
                  <div>
                    {statusTasks.map((task, index) => (
                      <React.Fragment key={task.id}>
                        {renderTaskRow(task, index, false)}
                        {!collapsedSubtasks.has(task.id) &&
                          getSubtasks(task).map((sub) => renderTaskRow(sub, 1, true))}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {Object.keys(groupedTasks).length === 0 && (
        <div className="text-center py-16">
          <div className="text-muted-foreground mb-4">No tasks found</div>
          <button
            onClick={() => onAddTask('Planning')}
            className="inline-flex items-center bg-brand text-brand-foreground"
            style={{
              gap: 8,
              padding: '8px 12px',
              height: 38,
              backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 100%)',
              boxShadow: '0px 1px 2px rgba(14,18,27,0.239216), 0px 0px 0px 1px hsl(var(--brand))',
              borderRadius: 7,
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 14,
            }}
          >
            <Plus style={{ width: 16, height: 16 }} strokeWidth={1.67} />
            Create your first task
          </button>
        </div>
      )}
    </div>
  );
};
