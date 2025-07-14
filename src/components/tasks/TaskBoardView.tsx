import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flag, Calendar, User, MessageSquare, Paperclip, MoreHorizontal } from 'lucide-react';
import { TaskWithRelations, TaskStatus } from '@/types/task';
import { TaskDetailDialog } from './TaskDetailDialog';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskBoardViewProps {
  tasks: TaskWithRelations[];
  isLoading: boolean;
  onUpdateTask: (taskId: string, updates: any) => Promise<boolean>;
  onDeleteTask: (taskId: string) => Promise<boolean>;
  onAddComment: (taskId: string, content: string) => Promise<boolean>;
  onUploadAttachment: (taskId: string, file: File) => Promise<boolean>;
}

const statusColumns: { status: TaskStatus; title: string; color: string }[] = [
  { status: 'Planning', title: 'Planning', color: 'bg-gray-100' },
  { status: 'In progress', title: 'In Progress', color: 'bg-blue-100' },
  { status: 'Paused', title: 'Paused', color: 'bg-yellow-100' },
  { status: 'Completed', title: 'Completed', color: 'bg-green-100' },
  { status: 'Cancelled', title: 'Cancelled', color: 'bg-red-100' },
];

export const TaskBoardView = ({ 
  tasks, 
  isLoading, 
  onUpdateTask, 
  onDeleteTask, 
  onAddComment, 
  onUploadAttachment 
}: TaskBoardViewProps) => {
  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-destructive';
      case 'High': return 'bg-orange-500';
      case 'Normal': return 'bg-blue-500';
      case 'Low': return 'bg-gray-500';
      default: return 'bg-gray-500';
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
    <div className="flex gap-6 overflow-x-auto pb-4">
      {statusColumns.map((column) => {
        const columnTasks = tasks.filter(task => task.status === column.status);
        
        return (
          <div key={column.status} className="min-w-[300px] flex-shrink-0">
            <Card className={`h-full ${column.color}`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-sm font-medium">{column.title}</span>
                  <Badge variant="secondary" className="text-xs">
                    {columnTasks.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {columnTasks.map((task) => (
                  <Card 
                    key={task.id} 
                    className="bg-white hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedTask(task)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
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

                      {task.description && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-1 mb-2">
                        <Badge 
                          variant="secondary" 
                          className={`text-white text-xs ${getPriorityColor(task.priority)}`}
                        >
                          <Flag className="h-2 w-2 mr-1" />
                          {task.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {task.task_type}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          {task.due_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(task.due_date, 'MMM dd')}
                            </div>
                          )}
                          
                          {task.assignees.length > 0 && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {task.assignees.length}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {task.comments && task.comments.length > 0 && (
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {task.comments.length}
                            </div>
                          )}

                          {task.attachments && task.attachments.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Paperclip className="h-3 w-3" />
                              {task.attachments.length}
                            </div>
                          )}
                        </div>
                      </div>

                      {task.subtasks && task.subtasks.length > 0 && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Subtasks: {task.subtasks.filter(st => st.status === 'Completed').length}/{task.subtasks.length}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {columnTasks.length === 0 && (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    No tasks in {column.title.toLowerCase()}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      })}

      {selectedTask && (
        <TaskDetailDialog
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
          onAddComment={onAddComment}
          onUploadAttachment={onUploadAttachment}
        />
      )}
    </div>
  );
};