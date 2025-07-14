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
  User
} from 'lucide-react';
import { TaskWithRelations, TaskStatus } from '@/types/task';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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

export const ClickUpTaskList = ({ 
  tasks, 
  isLoading, 
  onTaskClick, 
  onUpdateTask, 
  onAddTask 
}: ClickUpTaskListProps) => {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

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

  // Group tasks by status
  const groupedTasks = tasks.reduce((acc, task) => {
    const status = task.status;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(task);
    return acc;
  }, {} as Record<string, TaskWithRelations[]>);

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
          <div className="col-span-4">Name</div>
          <div className="col-span-2">Assignee</div>
          <div className="col-span-2">Due date</div>
          <div className="col-span-1">Priority</div>
          <div className="col-span-2">Status</div>
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
                {statusTasks.map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      "grid grid-cols-12 gap-4 px-4 py-3 hover:bg-muted/50 cursor-pointer group border-l-2",
                      priorityColors[task.priority]
                    )}
                    onClick={() => onTaskClick(task)}
                  >
                    {/* Name */}
                    <div className="col-span-4 flex items-center gap-2">
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
                    </div>

                    {/* Assignee */}
                    <div className="col-span-2 flex items-center">
                      {task.assignees.length > 0 ? (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {task.assignees.length} assignee{task.assignees.length > 1 ? 's' : ''}
                          </span>
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
                      <div className="flex items-center gap-1">
                        <Flag className={cn(
                          "h-3 w-3",
                          task.priority === 'Urgent' && "text-red-500",
                          task.priority === 'High' && "text-orange-500",
                          task.priority === 'Normal' && "text-blue-500",
                          task.priority === 'Low' && "text-gray-400"
                        )} />
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-span-2 flex items-center">
                      <Badge 
                        variant="secondary" 
                        className={cn("text-white text-xs h-5", config.color)}
                      >
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
                ))}
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