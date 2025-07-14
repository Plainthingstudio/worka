
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flag, Calendar, User, MessageSquare, Paperclip, MoreHorizontal, Plus, MoreVertical } from 'lucide-react';
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
  { status: 'Planning', title: 'PLANNING', color: 'bg-purple-500', bgColor: 'bg-purple-50', textColor: 'text-purple-700' },
  { status: 'In progress', title: 'IN PROGRESS', color: 'bg-yellow-500', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700' },
  { status: 'Paused', title: 'PAUSED', color: 'bg-gray-500', bgColor: 'bg-gray-50', textColor: 'text-gray-700' },
  { status: 'Completed', title: 'COMPLETED', color: 'bg-green-500', bgColor: 'bg-green-50', textColor: 'text-green-700' },
  { status: 'Cancelled', title: 'CANCELLED', color: 'bg-red-500', bgColor: 'bg-red-50', textColor: 'text-red-700' },
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
            <div className={`${column.color} text-white px-4 py-3 rounded-t-lg flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm font-medium uppercase tracking-wide">{column.title}</span>
                <span className="text-sm opacity-80">{columnTasks.length}</span>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/20">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Column Content */}
            <div className={`${column.bgColor} flex-1 p-3 space-y-3 overflow-y-auto rounded-b-lg`}>
              {columnTasks.map((task) => (
                <Card 
                  key={task.id} 
                  className="bg-white hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 border-l-transparent hover:border-l-primary"
                  onClick={() => onTaskClick?.(task)}
                >
                  <CardContent className="p-4">
                    {/* Task Title */}
                    <h4 className="font-medium text-sm mb-3 line-clamp-2 text-gray-900">{task.title}</h4>
                    
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
                        {task.assignees.length > 0 ? (
                          <div className="flex -space-x-1">
                            {task.assignees.slice(0, 3).map((assignee, index) => (
                              <Avatar key={index} className="h-6 w-6 border-2 border-white">
                                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                  {getInitials(assignee)}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {task.assignees.length > 3 && (
                              <div className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                                <span className="text-xs text-gray-600">+{task.assignees.length - 3}</span>
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
              ))}

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
