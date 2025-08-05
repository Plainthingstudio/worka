import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, 
  ChevronRight,
  Calendar, 
  Flag,
  CheckCircle,
  Circle,
  Plus,
  MoreHorizontal,
  FileText
} from 'lucide-react';
import { TaskWithRelations, TaskStatus } from '@/types/task';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAssigneeNames } from '@/hooks/useAssigneeNames';
import { getStatusBadgeVariant } from '@/components/projects/utils/projectItemUtils';

interface ClickUpTaskListProps {
  tasks: TaskWithRelations[];
  isLoading: boolean;
  onTaskClick: (task: TaskWithRelations) => void;
  onUpdateTask: (taskId: string, updates: any) => Promise<boolean>;
  onAddTask: (status: TaskStatus) => void;
}

const statusConfig = {
  'Planning': { label: 'PLANNING', color: 'bg-slate-500', icon: Circle },
  'In progress': { label: 'IN PROGRESS', color: 'bg-amber-500', icon: Circle },
  'Completed': { label: 'COMPLETED', color: 'bg-emerald-500', icon: CheckCircle },
  'Paused': { label: 'PAUSED', color: 'bg-orange-500', icon: Circle },
  'Cancelled': { label: 'CANCELLED', color: 'bg-red-500', icon: Circle }
};

const priorityConfig = {
  'Urgent': { 
    color: 'text-red-600 dark:text-red-400', 
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    borderColor: 'border-l-red-500'
  },
  'High': { 
    color: 'text-orange-600 dark:text-orange-400', 
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    borderColor: 'border-l-orange-500'
  },
  'Normal': { 
    color: 'text-blue-600 dark:text-blue-400', 
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-l-blue-500'
  },
  'Low': { 
    color: 'text-slate-500 dark:text-slate-400', 
    bgColor: 'bg-slate-50 dark:bg-slate-950/30',
    borderColor: 'border-l-slate-400'
  }
};

const getBriefTypeConfig = (type: string) => {
  switch (type) {
    case 'UI Design': 
      return { color: 'bg-blue-500 text-white', label: 'UI' };
    case 'Graphic Design': 
      return { color: 'bg-green-500 text-white', label: 'GD' };
    case 'Illustration Design': 
      return { color: 'bg-purple-500 text-white', label: 'IL' };
    default: 
      return { color: 'bg-slate-500 text-white', label: type?.substring(0, 2) || '—' };
  }
};

export const ClickUpTaskList = ({ 
  tasks, 
  isLoading, 
  onTaskClick, 
  onUpdateTask, 
  onAddTask 
}: ClickUpTaskListProps) => {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [collapsedSubtasks, setCollapsedSubtasks] = useState<Set<string>>(new Set());
  const { getAssigneeNames } = useAssigneeNames();

  const toggleGroup = (status: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(status)) {
      newCollapsed.delete(status);
    } else {
      newCollapsed.add(status);
    }
    setCollapsedGroups(newCollapsed);
  };

  const toggleSubtasks = (taskId: string) => {
    const newCollapsed = new Set(collapsedSubtasks);
    if (newCollapsed.has(taskId)) {
      newCollapsed.delete(taskId);
    } else {
      newCollapsed.add(taskId);
    }
    setCollapsedSubtasks(newCollapsed);
  };

  const toggleTaskComplete = async (task: TaskWithRelations, e: React.MouseEvent) => {
    e.stopPropagation();
    const isCompleted = task.status === 'Completed';
    await onUpdateTask(task.id, {
      status: isCompleted ? 'In progress' : 'Completed',
      completed_at: isCompleted ? null : new Date().toISOString(),
    });
  };

  const getInitials = (name: string) => {
    if (!name || typeof name !== 'string') {
      return '?';
    }
    
    const initials = name
      .trim()
      .split(' ')
      .filter(word => word.length > 0)
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
    
    return initials || '?';
  };

  // Group tasks by status, excluding subtasks from main list
  const groupedTasks = tasks.reduce((acc, task) => {
    if (!task.parent_task_id) {
      const status = task.status;
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(task);
    }
    return acc;
  }, {} as Record<string, TaskWithRelations[]>);

  // Helper function to get subtasks for a parent task
  const getSubtasks = (task: TaskWithRelations): TaskWithRelations[] => {
    return task.subtasks || [];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-sm text-muted-foreground">Loading tasks...</div>
      </div>
    );
  }

  const statusOrder: TaskStatus[] = ['Planning', 'In progress', 'Completed', 'Paused', 'Cancelled'];

  return (
    <div className="bg-background">

      {/* Task Groups */}
      <div className="divide-y divide-border">
        {statusOrder.map((status) => {
          const statusTasks = groupedTasks[status] || [];
          if (statusTasks.length === 0) return null;

          const config = statusConfig[status];
          const isCollapsed = collapsedGroups.has(status);
          const StatusIcon = config.icon;

          return (
            <div key={status} className="bg-background">
              {/* Group Header */}
              <div 
                className="flex items-center gap-3 pl-4 pr-6 py-4 bg-muted/20 hover:bg-muted/30 cursor-pointer transition-colors group border-l-4 border-l-transparent hover:border-l-primary/20"
                onClick={() => toggleGroup(status)}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform" />
                  )}
                  <div className={cn("h-6 w-6 rounded-full flex items-center justify-center", config.color)}>
                    <StatusIcon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="font-semibold text-sm text-foreground">{config.label}</span>
                  <div className="h-5 px-2 bg-muted/60 rounded-full flex items-center">
                    <span className="text-xs font-medium text-muted-foreground">{statusTasks.length}</span>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-7 px-3 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddTask(status);
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Task
                </Button>
              </div>

              {/* Task List */}
              {!isCollapsed && (
                <div>
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-6 pl-12 pr-6 py-4 text-xs font-semibold text-muted-foreground tracking-wider bg-muted/10 border-b border-border/50">
                    <div className="col-span-3">Task</div>
                    <div className="col-span-2">Assignee</div>
                    <div className="col-span-2">Due Date</div>
                    <div className="col-span-1">Priority</div>
                    <div className="col-span-2">Brief</div>
                    <div className="col-span-2">Status</div>
                  </div>
                  
                  {/* Tasks */}
                  <div className="divide-y divide-border/50">
                  {statusTasks.map((task) => {
                    const assigneeNames = getAssigneeNames(task.assignees || []);
                    const subtasks = getSubtasks(task);
                    const priorityStyle = priorityConfig[task.priority];
                    
                    return (
                      <React.Fragment key={task.id}>
                        {/* Parent Task */}
                        <div
                          className={cn(
                            "grid grid-cols-12 gap-6 pl-12 pr-6 py-4 hover:bg-muted/10 cursor-pointer group transition-colors border-l-2",
                            priorityStyle.borderColor,
                            task.status === 'Completed' && "opacity-75"
                          )}
                          onClick={() => onTaskClick(task)}
                        >
                          {/* Task Name */}
                          <div className="col-span-3 flex items-center gap-3 min-w-0">
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {subtasks.length > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 w-5 p-0 hover:bg-muted/50"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSubtasks(task.id);
                                  }}
                                >
                                  {collapsedSubtasks.has(task.id) ? (
                                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                  ) : (
                                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                  )}
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0 hover:bg-muted/50"
                                onClick={(e) => toggleTaskComplete(task, e)}
                              >
                                {task.status === 'Completed' ? (
                                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                                ) : (
                                  <Circle className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                                )}
                              </Button>
                            </div>
                            
                            <div className="min-w-0 flex-1">
                              <span className={cn(
                                "text-sm font-medium truncate block",
                                task.status === 'Completed' && "line-through text-muted-foreground"
                              )}>
                                {task.title}
                              </span>
                            </div>
                            
                            {subtasks.length > 0 && (
                              <div className="flex-shrink-0">
                                <div className="h-5 px-2 bg-muted/60 rounded-md flex items-center">
                                  <span className="text-xs font-medium text-muted-foreground">{subtasks.length}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Assignee */}
                          <div className="col-span-2 flex items-center">
                            {assigneeNames.length > 0 ? (
                              <div className="flex -space-x-1">
                                {assigneeNames.slice(0, 3).map((name, index) => (
                                  <Avatar key={index} className="h-6 w-6 border-2 border-background ring-1 ring-border">
                                    <AvatarFallback className="text-xs bg-primary text-primary-foreground font-medium">
                                      {getInitials(name)}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                                {assigneeNames.length > 3 && (
                                  <div className="h-6 w-6 rounded-full bg-muted border-2 border-background ring-1 ring-border flex items-center justify-center">
                                    <span className="text-xs font-medium text-muted-foreground">+{assigneeNames.length - 3}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </div>

                          {/* Due Date */}
                          <div className="col-span-2 flex items-center">
                            {task.due_date ? (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  {format(task.due_date, 'MMM dd')}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </div>

                          {/* Priority */}
                          <div className="col-span-1 flex items-center">
                            <div className={cn(
                              "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium",
                              priorityStyle.color,
                              priorityStyle.bgColor
                            )}>
                              <Flag className="h-3 w-3" />
                              <span>{task.priority}</span>
                            </div>
                          </div>

                          {/* Brief */}
                          <div className="col-span-2 flex items-center">
                            {task.brief_type ? (
                              <div className="flex items-center gap-2">
                                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                <Badge 
                                  className={cn(
                                    "h-5 px-2 text-xs font-medium rounded-md",
                                    getBriefTypeConfig(task.brief_type).color
                                  )}
                                >
                                  {getBriefTypeConfig(task.brief_type).label}
                                </Badge>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </div>

                          {/* Status */}
                          <div className="col-span-2 flex items-center justify-between">
                            <Badge 
                              variant={getStatusBadgeVariant(status)}
                              className="text-xs font-medium"
                            >
                              {status}
                            </Badge>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        {/* Subtasks */}
                        {!collapsedSubtasks.has(task.id) && subtasks.map((subtask) => {
                          const subtaskAssigneeNames = getAssigneeNames(subtask.assignees || []);
                          const subtaskPriorityStyle = priorityConfig[subtask.priority];
                          
                          return (
                            <div
                              key={subtask.id}
                              className={cn(
                                "grid grid-cols-12 gap-6 pl-16 pr-6 py-3 hover:bg-muted/5 cursor-pointer group transition-colors border-l-2 bg-muted/5",
                                subtaskPriorityStyle.borderColor,
                                subtask.status === 'Completed' && "opacity-60"
                              )}
                              onClick={() => onTaskClick(subtask)}
                            >
                              {/* Subtask Name */}
                              <div className="col-span-3 flex items-center gap-3 min-w-0">
                                <div className="w-6 h-0.5 bg-border"></div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0 hover:bg-muted/50 flex-shrink-0"
                                  onClick={(e) => toggleTaskComplete(subtask, e)}
                                >
                                  {subtask.status === 'Completed' ? (
                                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                                  ) : (
                                    <Circle className="h-3.5 w-3.5 text-muted-foreground hover:text-primary transition-colors" />
                                  )}
                                </Button>
                                <span className={cn(
                                  "text-sm truncate",
                                  subtask.status === 'Completed' && "line-through text-muted-foreground"
                                )}>
                                  {subtask.title}
                                </span>
                              </div>

                              {/* Subtask Assignee */}
                              <div className="col-span-2 flex items-center">
                                {subtaskAssigneeNames.length > 0 ? (
                                  <div className="flex -space-x-1">
                                    {subtaskAssigneeNames.slice(0, 2).map((name, index) => (
                                      <Avatar key={index} className="h-5 w-5 border-2 border-background ring-1 ring-border">
                                        <AvatarFallback className="text-xs bg-primary text-primary-foreground font-medium">
                                          {getInitials(name)}
                                        </AvatarFallback>
                                      </Avatar>
                                    ))}
                                    {subtaskAssigneeNames.length > 2 && (
                                      <div className="h-5 w-5 rounded-full bg-muted border-2 border-background ring-1 ring-border flex items-center justify-center">
                                        <span className="text-xs font-medium text-muted-foreground">+{subtaskAssigneeNames.length - 2}</span>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-sm text-muted-foreground">—</span>
                                )}
                              </div>

                              {/* Subtask Due Date */}
                              <div className="col-span-2 flex items-center">
                                {subtask.due_date ? (
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                      {format(subtask.due_date, 'MMM dd')}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-sm text-muted-foreground">—</span>
                                )}
                              </div>

                              {/* Subtask Priority */}
                              <div className="col-span-1 flex items-center">
                                <div className={cn(
                                  "flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium",
                                  subtaskPriorityStyle.color,
                                  subtaskPriorityStyle.bgColor
                                )}>
                                  <Flag className="h-2.5 w-2.5" />
                                  <span>{subtask.priority}</span>
                                </div>
                              </div>

                              {/* Subtask Brief */}
                              <div className="col-span-2 flex items-center">
                                {subtask.brief_type ? (
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-3 w-3 text-muted-foreground" />
                                    <Badge 
                                      className={cn(
                                        "h-4 px-1.5 text-xs font-medium rounded",
                                        getBriefTypeConfig(subtask.brief_type).color
                                      )}
                                    >
                                      {getBriefTypeConfig(subtask.brief_type).label}
                                    </Badge>
                                  </div>
                                ) : (
                                  <span className="text-sm text-muted-foreground">—</span>
                                )}
                              </div>

                              {/* Subtask Status */}
                              <div className="col-span-2 flex items-center justify-between">
                                <Badge 
                                  variant={getStatusBadgeVariant(subtask.status)}
                                  className="text-xs"
                                >
                                  {subtask.status}
                                </Badge>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        {/* Empty State */}
        {Object.keys(groupedTasks).length === 0 && (
          <div className="text-center py-16">
            <div className="text-muted-foreground mb-4">No tasks found</div>
            <Button onClick={() => onAddTask('Planning')} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create your first task
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};