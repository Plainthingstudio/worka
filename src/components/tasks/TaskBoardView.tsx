
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flag, Calendar, User, MessageSquare, Paperclip, MoreHorizontal, Plus, MoreVertical, GripVertical } from 'lucide-react';
import { TaskWithRelations, TaskStatus } from '@/types/task';
import { ClickUpTaskDetail } from './ClickUpTaskDetail';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, InitialAvatar } from '@/components/ui/avatar';
import { useAssigneeNames } from '@/hooks/useAssigneeNames';

interface TaskBoardViewProps {
  tasks: TaskWithRelations[];
  isLoading: boolean;
  onUpdateTask: (taskId: string, updates: any) => Promise<boolean>;
  onDeleteTask: (taskId: string) => Promise<boolean>;
  onAddComment: (taskId: string, content: string) => Promise<boolean>;
  onUploadAttachment: (taskId: string, file: File) => Promise<boolean>;
  onAddTask?: (status: TaskStatus) => void;
  onTaskClick?: (task: TaskWithRelations) => void;
}

const statusColumns: { status: TaskStatus; title: string; color: string; bgColor: string; textColor: string; dotClass: string }[] = [
  { status: 'Planning',          title: 'Planning',          color: 'text-muted-foreground',     bgColor: 'bg-surface-3', textColor: 'text-muted-foreground', dotClass: 'bg-slate-400 dark:bg-slate-500' },
  { status: 'In progress',       title: 'In Progress',       color: 'text-blue-600 dark:text-blue-300',     bgColor: 'bg-surface-3', textColor: 'text-muted-foreground', dotClass: 'bg-blue-500' },
  { status: 'Awaiting Feedback', title: 'Awaiting Feedback', color: 'text-violet-600 dark:text-violet-300', bgColor: 'bg-surface-3', textColor: 'text-muted-foreground', dotClass: 'bg-violet-500' },
  { status: 'Paused',            title: 'Paused',            color: 'text-yellow-600 dark:text-yellow-300', bgColor: 'bg-surface-3', textColor: 'text-muted-foreground', dotClass: 'bg-yellow-500' },
  { status: 'Completed',         title: 'Completed',         color: 'text-green-600 dark:text-green-300',   bgColor: 'bg-surface-3', textColor: 'text-muted-foreground', dotClass: 'bg-green-500' },
  { status: 'Cancelled',         title: 'Cancelled',         color: 'text-red-600 dark:text-red-300',       bgColor: 'bg-surface-3', textColor: 'text-muted-foreground', dotClass: 'bg-red-500' },
];

export const TaskBoardView = ({ 
  tasks, 
  isLoading, 
  onUpdateTask, 
  onDeleteTask, 
  onAddComment, 
  onUploadAttachment,
  onAddTask,
  onTaskClick 
}: TaskBoardViewProps) => {
  const { getAssigneeNames } = useAssigneeNames();
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-destructive';
      case 'High': return 'bg-orange-500';
      case 'Normal': return 'bg-blue-500';
      case 'Low': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityTextColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'text-red-500 dark:text-red-400';
      case 'High': return 'text-orange-500 dark:text-orange-400';
      case 'Normal': return 'text-blue-500 dark:text-blue-400';
      case 'Low': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getPriorityBorderColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'border-l-red-500';
      case 'High': return 'border-l-orange-500';
      case 'Normal': return 'border-l-blue-500';
      case 'Low': return 'border-l-green-500';
      default: return 'border-l-border-soft';
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    await onUpdateTask(taskId, { 
      status: newStatus,
      completed_at: newStatus === 'Completed' ? new Date().toISOString() : null,
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading tasks...</div>;
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 h-full">
      {statusColumns.map((column) => {
        const columnTasks = tasks.filter(task => task.status === column.status);
        
        return (
          <div key={column.status} className="min-w-[280px] flex-shrink-0 flex flex-col h-full">
            {/* Column Header */}
            <div className="px-4 py-3 flex items-center justify-between bg-transparent">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${column.dotClass}`}></div>
                <span className={`text-sm font-medium ${column.color}`}>{column.title}</span>
                <div className="bg-muted text-muted-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                  {columnTasks.length}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={() => onAddTask?.(column.status)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Column Content */}
            <div 
              className={`${column.bgColor} flex-1 p-4 space-y-3 overflow-y-auto rounded-lg transition-all duration-300 relative ${
                dragOverColumn === column.status && draggedTask ? 
                  'bg-primary/10 border-2 border-primary border-dashed shadow-lg transform scale-105' : 
                  ''
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverColumn(column.status);
              }}
              onDragLeave={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX;
                const y = e.clientY;
                
                // Only remove highlight if mouse is actually outside the element
                if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
                  setDragOverColumn(null);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverColumn(null);
                const taskId = e.dataTransfer.getData('taskId');
                const currentStatus = e.dataTransfer.getData('currentStatus');
                
                if (taskId && currentStatus !== column.status) {
                  handleStatusChange(taskId, column.status);
                }
                setDraggedTask(null);
              }}
            >
              {/* Drop Zone Indicator */}
              {dragOverColumn === column.status && draggedTask && (
                <div className="absolute inset-0 flex items-center justify-center bg-primary/5 rounded-lg border-2 border-primary border-dashed pointer-events-none">
                  <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium animate-pulse">
                    Drop task here
                  </div>
                </div>
              )}
              {columnTasks.map((task) => {
                const assigneeNames = getAssigneeNames(task.assignees || []);
                console.log('Board task assignees for', task.title, ':', task.assignees, 'converted to names:', assigneeNames);
                
                return (
                  <Card
                    key={task.id}
                    className={`bg-card hover:shadow-lg transition-all duration-300 cursor-pointer group relative ${
                      draggedTask === task.id ?
                        'opacity-50 transform rotate-2 scale-95 shadow-2xl z-50' :
                        'hover:scale-[1.02] hover:shadow-md'
                    }`}
                    draggable
                    onDragStart={(e) => {
                      setDraggedTask(task.id);
                      e.dataTransfer.setData('taskId', task.id);
                      e.dataTransfer.setData('currentStatus', task.status);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragEnd={(e) => {
                      setDraggedTask(null);
                      setDragOverColumn(null);
                    }}
                    onClick={() => onTaskClick?.(task)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        {/* Task Title */}
                        <h4 className="font-medium text-sm line-clamp-2 text-foreground flex-1">{task.title}</h4>
                        {/* Drag Handle */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing mt-0.5">
                          <GripVertical className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </div>
                      
                      {/* Priority Badge */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`flex items-center gap-1 text-xs ${getPriorityTextColor(task.priority)}`}>
                          <Flag className="h-3 w-3" />
                          <span>{task.priority}</span>
                        </div>
                      </div>
                      
                      {/* Task Meta Info */}
                      <div className="flex items-center justify-between">
                        {/* Left side - Assignees */}
                        <div className="flex items-center gap-2">
                          {assigneeNames.length > 0 ? (
                            <div className="flex -space-x-1">
                              {assigneeNames.slice(0, 3).map((name, index) => (
                                <InitialAvatar key={index} name={name} size={24} />
                              ))}
                              {assigneeNames.length > 3 && (
                                <div className="h-6 w-6 rounded-full bg-muted border border-card flex items-center justify-center">
                                  <span className="text-[11px] text-muted-foreground">+{assigneeNames.length - 3}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs bg-muted">
                                <User className="h-3 w-3" />
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>

                        {/* Right side - Due Date & Actions */}
                        <div className="flex items-center gap-2">
                          {task.due_date && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {format(task.due_date, 'MMM d')}
                            </div>
                          )}
                          
                          {/* Attachment/Comment indicators */}
                          <div className="flex items-center gap-1">
                            {task.comments && task.comments.length > 0 && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MessageSquare className="h-3 w-3" />
                              </div>
                            )}
                            {task.attachments && task.attachments.length > 0 && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Paperclip className="h-3 w-3" />
                              </div>
                            )}
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {statusColumns.map((status) => (
                                <DropdownMenuItem 
                                  key={status.status}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(task.id, status.status);
                                  }}
                                >
                                  Move to {status.title}
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteTask(task.id);
                                }}
                                className="text-destructive"
                              >
                                Delete Task
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {/* Add Task Button */}
              <Button
                variant="ghost"
                className={`w-full h-10 border-2 border-dashed border-border ${column.textColor} hover:bg-card/50 justify-start gap-2`}
                onClick={() => onAddTask?.(column.status)}
              >
                <Plus className="h-4 w-4" />
                Add Task
              </Button>

              {columnTasks.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  No tasks
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
