
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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

const statusColumns: { status: TaskStatus; title: string; color: string; bgColor: string; textColor: string }[] = [
  { status: 'Planning', title: 'To do', color: 'text-orange-600', bgColor: 'bg-slate-100', textColor: 'text-gray-700' },
  { status: 'In progress', title: 'In Progress', color: 'text-blue-600', bgColor: 'bg-slate-100', textColor: 'text-gray-700' },
  { status: 'Paused', title: 'Paused', color: 'text-gray-600', bgColor: 'bg-slate-100', textColor: 'text-gray-700' },
  { status: 'Completed', title: 'Done', color: 'text-green-600', bgColor: 'bg-slate-100', textColor: 'text-gray-700' },
  { status: 'Cancelled', title: 'Cancelled', color: 'text-red-600', bgColor: 'bg-slate-100', textColor: 'text-gray-700' },
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
      case 'Urgent': return 'text-red-500';
      case 'High': return 'text-orange-500';
      case 'Normal': return 'text-blue-500';
      case 'Low': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getPriorityBorderColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'border-l-red-500';
      case 'High': return 'border-l-orange-500';
      case 'Normal': return 'border-l-blue-500';
      case 'Low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
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
                <div className={`w-2 h-2 rounded-full ${column.color === 'text-orange-600' ? 'bg-orange-500' : column.color === 'text-blue-600' ? 'bg-blue-500' : column.color === 'text-gray-600' ? 'bg-gray-500' : column.color === 'text-green-600' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`text-sm font-medium ${column.color}`}>{column.title}</span>
                <div className="bg-gray-200 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                  {columnTasks.length}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-gray-400 hover:text-gray-600"
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
                    className={`bg-white hover:shadow-lg transition-all duration-300 cursor-pointer group relative ${
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
                        <h4 className="font-medium text-sm line-clamp-2 text-gray-900 flex-1">{task.title}</h4>
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
                                <Avatar key={index} className="h-6 w-6 border-2 border-white">
                                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                    {getInitials(name)}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {assigneeNames.length > 3 && (
                                <div className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                                  <span className="text-xs text-gray-600">+{assigneeNames.length - 3}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs bg-gray-200">
                                <User className="h-3 w-3" />
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>

                        {/* Right side - Due Date & Actions */}
                        <div className="flex items-center gap-2">
                          {task.due_date && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="h-3 w-3" />
                              {format(task.due_date, 'MMM d')}
                            </div>
                          )}
                          
                          {/* Attachment/Comment indicators */}
                          <div className="flex items-center gap-1">
                            {task.comments && task.comments.length > 0 && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <MessageSquare className="h-3 w-3" />
                              </div>
                            )}
                            {task.attachments && task.attachments.length > 0 && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
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
                className={`w-full h-10 border-2 border-dashed border-gray-300 ${column.textColor} hover:bg-white/50 justify-start gap-2`}
                onClick={() => onAddTask?.(column.status)}
              >
                <Plus className="h-4 w-4" />
                Add Task
              </Button>

              {columnTasks.length === 0 && (
                <div className="text-center text-gray-400 text-sm py-8">
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
