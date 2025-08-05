
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronDown, 
  ChevronRight,
  Calendar, 
  Flag,
  CheckCircle,
  Circle,
  Plus,
  MoreHorizontal,
  User,
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
  'Planning': { label: 'PLANNING', color: 'bg-gray-500', icon: Circle },
  'In progress': { label: 'IN PROGRESS', color: 'bg-blue-500', icon: Circle },
  'Completed': { label: 'COMPLETED', color: 'bg-green-500', icon: CheckCircle },
  'Paused': { label: 'PAUSED', color: 'bg-yellow-500', icon: Circle },
  'Cancelled': { label: 'CANCELLED', color: 'bg-red-500', icon: Circle }
};

const priorityColors = {
  'Urgent': 'border-l-red-500',
  'High': 'border-l-orange-500',
  'Normal': 'border-l-blue-500',
  'Low': 'border-l-gray-400'
};

const priorityTextColors = {
  'Urgent': 'text-red-500',
  'High': 'text-orange-500',
  'Normal': 'text-blue-500',
  'Low': 'text-gray-400'
};

const getBriefTypeColor = (type: string) => {
  switch (type) {
    case 'UI Design': return 'bg-blue-500';
    case 'Graphic Design': return 'bg-green-500';
    case 'Illustration Design': return 'bg-purple-500';
    default: return 'bg-gray-500';
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
    // Only include main tasks (not subtasks) in the main grouping
    if (!task.parent_task_id) {
      const status = task.status;
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(task);
    }
    return acc;
  }, {} as Record<string, TaskWithRelations[]>);

  console.log('All tasks data:', tasks.map(t => ({ 
    id: t.id, 
    title: t.title, 
    parent_task_id: t.parent_task_id,
    status: t.status 
  })));
  
  console.log('Grouped tasks:', groupedTasks);
  
  // Check for any subtasks
  const allSubtasks = tasks.filter(task => task.parent_task_id);
  console.log('Found subtasks:', allSubtasks.map(t => ({ 
    id: t.id, 
    title: t.title, 
    parent_task_id: t.parent_task_id 
  })));

  // Check exact data types and values
  console.log('Detailed task analysis:');
  tasks.forEach(task => {
    console.log(`Task: ${task.title}, ID: ${task.id} (${typeof task.id}), Parent: ${task.parent_task_id} (${typeof task.parent_task_id})`);
  });

  // Helper function to get subtasks for a parent task
  const getSubtasks = (parentTaskId: string): TaskWithRelations[] => {
    const subtasks = tasks.filter(task => task.parent_task_id === parentTaskId);
    console.log(`Checking subtasks for parent ${parentTaskId}:`, subtasks);
    console.log('All tasks:', tasks.map(t => ({ id: t.id, title: t.title, parent_task_id: t.parent_task_id })));
    return subtasks;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-muted-foreground">Loading tasks...</div>
      </div>
    );
  }

  const statusOrder: TaskStatus[] = ['Planning', 'In progress', 'Completed', 'Paused', 'Cancelled'];

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b z-10">
        <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-medium text-muted-foreground">
          <div className="col-span-3">Name</div>
          <div className="col-span-2">Assignee</div>
          <div className="col-span-2">Due date</div>
          <div className="col-span-1">Priority</div>
          <div className="col-span-2">Brief</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1"></div>
        </div>
      </div>

      {/* Task Groups */}
      {statusOrder.map((status) => {
        const statusTasks = groupedTasks[status] || [];
        if (statusTasks.length === 0) return null;

        const config = statusConfig[status];
        const isCollapsed = collapsedGroups.has(status);
        const StatusIcon = config.icon;

        return (
          <div key={status} className="border-b">
            {/* Group Header */}
            <div 
              className="flex items-center gap-2 px-4 py-3 bg-muted/30 hover:bg-muted/50 cursor-pointer group"
              onClick={() => toggleGroup(status)}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
              <StatusIcon className={cn("h-4 w-4 text-white rounded-full p-0.5", config.color)} />
              <span className="font-medium text-sm">{config.label}</span>
              <span className="text-xs text-muted-foreground">{statusTasks.length}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity h-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddTask(status);
                }}
              >
                <Plus className="h-3 w-3" />
                Add Task
              </Button>
            </div>

            {/* Task List */}
            {!isCollapsed && (
              <div className="divide-y">
                {statusTasks.map((task) => {
                  const assigneeNames = getAssigneeNames(task.assignees || []);
                  const subtasks = getSubtasks(task.id);
                  
                  return (
                    <React.Fragment key={task.id}>
                      {/* Parent Task */}
                      <div
                        className={cn(
                          "grid grid-cols-12 gap-4 px-4 py-3 hover:bg-muted/50 cursor-pointer group border-l-2",
                          priorityColors[task.priority]
                        )}
                        onClick={() => onTaskClick(task)}
                      >
                        {/* Name */}
                        <div className="col-span-3 flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 p-0"
                            onClick={(e) => toggleTaskComplete(task, e)}
                          >
                            {task.status === 'Completed' ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                            )}
                          </Button>
                          <span className={cn(
                            "text-sm truncate",
                            task.status === 'Completed' && "line-through text-muted-foreground"
                          )}>
                            {task.title}
                          </span>
                          {subtasks.length > 0 && (
                            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              {subtasks.length}
                            </span>
                          )}
                        </div>

                        {/* Assignee */}
                        <div className="col-span-2 flex items-center">
                          {assigneeNames.length > 0 ? (
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-1">
                                {assigneeNames.slice(0, 2).map((name, index) => (
                                  <Avatar key={index} className="h-5 w-5 border border-white">
                                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                      {getInitials(name)}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                                {assigneeNames.length > 2 && (
                                  <div className="h-5 w-5 rounded-full bg-gray-200 border border-white flex items-center justify-center">
                                    <span className="text-xs text-gray-600">+{assigneeNames.length - 2}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">–</span>
                          )}
                        </div>

                        {/* Due Date */}
                        <div className="col-span-2 flex items-center">
                          {task.due_date ? (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {format(task.due_date, 'MMM dd')}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">–</span>
                          )}
                        </div>

                        {/* Priority */}
                        <div className="col-span-1 flex items-center">
                          <div className={cn("flex items-center gap-1 text-xs", priorityTextColors[task.priority])}>
                            <Flag className="h-3 w-3" />
                            <span>{task.priority}</span>
                          </div>
                        </div>

                        {/* Brief */}
                        <div className="col-span-2 flex items-center">
                          {task.brief_type ? (
                            <div className="flex items-center gap-1">
                              <FileText className="h-3 w-3 text-muted-foreground" />
                              <Badge className={`${getBriefTypeColor(task.brief_type)} text-white text-xs h-4`}>
                                {task.brief_type.split(' ')[0]}
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">–</span>
                          )}
                        </div>

                        {/* Status */}
                        <div className="col-span-1 flex items-center">
                          <Badge variant={getStatusBadgeVariant(status)}>
                            {status}
                          </Badge>
                        </div>

                        {/* Actions */}
                        <div className="col-span-1 flex items-center justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Subtasks */}
                      {subtasks.map((subtask) => {
                        const subtaskAssigneeNames = getAssigneeNames(subtask.assignees || []);
                        
                        return (
                          <div
                            key={subtask.id}
                            className={cn(
                              "grid grid-cols-12 gap-4 pl-8 pr-4 py-2 hover:bg-muted/30 cursor-pointer group border-l-2 bg-muted/10",
                              priorityColors[subtask.priority]
                            )}
                            onClick={() => onTaskClick(subtask)}
                          >
                            {/* Name */}
                            <div className="col-span-3 flex items-center gap-2">
                              <div className="w-3 h-px bg-border"></div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 p-0"
                                onClick={(e) => toggleTaskComplete(subtask, e)}
                              >
                                {subtask.status === 'Completed' ? (
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                ) : (
                                  <Circle className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                )}
                              </Button>
                              <span className={cn(
                                "text-sm truncate",
                                subtask.status === 'Completed' && "line-through text-muted-foreground"
                              )}>
                                {subtask.title}
                              </span>
                            </div>

                            {/* Assignee */}
                            <div className="col-span-2 flex items-center">
                              {subtaskAssigneeNames.length > 0 ? (
                                <div className="flex items-center gap-2">
                                  <div className="flex -space-x-1">
                                    {subtaskAssigneeNames.slice(0, 2).map((name, index) => (
                                      <Avatar key={index} className="h-4 w-4 border border-white">
                                        <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                          {getInitials(name)}
                                        </AvatarFallback>
                                      </Avatar>
                                    ))}
                                    {subtaskAssigneeNames.length > 2 && (
                                      <div className="h-4 w-4 rounded-full bg-gray-200 border border-white flex items-center justify-center">
                                        <span className="text-xs text-gray-600">+{subtaskAssigneeNames.length - 2}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">–</span>
                              )}
                            </div>

                            {/* Due Date */}
                            <div className="col-span-2 flex items-center">
                              {subtask.due_date ? (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    {format(subtask.due_date, 'MMM dd')}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">–</span>
                              )}
                            </div>

                            {/* Priority */}
                            <div className="col-span-1 flex items-center">
                              <div className={cn("flex items-center gap-1 text-xs", priorityTextColors[subtask.priority])}>
                                <Flag className="h-3 w-3" />
                                <span>{subtask.priority}</span>
                              </div>
                            </div>

                            {/* Brief */}
                            <div className="col-span-2 flex items-center">
                              {subtask.brief_type ? (
                                <div className="flex items-center gap-1">
                                  <FileText className="h-3 w-3 text-muted-foreground" />
                                  <Badge className={`${getBriefTypeColor(subtask.brief_type)} text-white text-xs h-4`}>
                                    {subtask.brief_type.split(' ')[0]}
                                  </Badge>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">–</span>
                              )}
                            </div>

                            {/* Status */}
                            <div className="col-span-1 flex items-center">
                              <Badge variant={getStatusBadgeVariant(subtask.status)} className="text-xs h-4">
                                {subtask.status}
                              </Badge>
                            </div>

                            {/* Actions */}
                            <div className="col-span-1 flex items-center justify-end">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
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
            )}
          </div>
        );
      })}

      {tasks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-sm text-muted-foreground mb-4">
            No tasks found. Create your first task to get started.
          </div>
          <Button onClick={() => onAddTask('Planning')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      )}
    </div>
  );
};
