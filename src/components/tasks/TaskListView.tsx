import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, 
  Calendar, 
  User, 
  MessageSquare, 
  Paperclip,
  Flag,
  CheckCircle,
  Circle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TaskWithRelations } from '@/types/task';
import { TaskDetailDialog } from './TaskDetailDialog';
import { format } from 'date-fns';

interface TaskListViewProps {
  tasks: TaskWithRelations[];
  isLoading: boolean;
  onUpdateTask: (taskId: string, updates: any) => Promise<boolean>;
  onDeleteTask: (taskId: string) => Promise<boolean>;
  onAddComment: (taskId: string, content: string) => Promise<boolean>;
  onUploadAttachment: (taskId: string, file: File) => Promise<boolean>;
}

export const TaskListView = ({ 
  tasks, 
  isLoading, 
  onUpdateTask, 
  onDeleteTask, 
  onAddComment, 
  onUploadAttachment 
}: TaskListViewProps) => {
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

  const getTaskTypeColor = (taskType: string) => {
    switch (taskType) {
      case 'Primary': return 'bg-primary';
      case 'Secondary': return 'bg-secondary';
      case 'Tertiary': return 'bg-muted';
      default: return 'bg-muted';
    }
  };

  const toggleTaskComplete = async (task: TaskWithRelations) => {
    const isCompleted = task.status === 'Completed';
    await onUpdateTask(task.id, {
      status: isCompleted ? 'In progress' : 'Completed',
      completed_at: isCompleted ? null : new Date().toISOString(),
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading tasks...</div>;
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No tasks found. Create your first task to get started.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task.id} className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 mt-1"
                  onClick={() => toggleTaskComplete(task)}
                >
                  {task.status === 'Completed' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </Button>

                <div className="flex-1 min-w-0" onClick={() => setSelectedTask(task)}>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className={`font-medium ${task.status === 'Completed' ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </h3>
                    <div className="flex gap-1">
                      <Badge 
                        variant="secondary" 
                        className={`text-white text-xs ${getPriorityColor(task.priority)}`}
                      >
                        <Flag className="h-3 w-3 mr-1" />
                        {task.priority}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getTaskTypeColor(task.task_type)}`}
                      >
                        {task.task_type}
                      </Badge>
                    </div>
                  </div>

                  {task.description && (
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {task.due_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(task.due_date, 'MMM dd, yyyy')}
                      </div>
                    )}
                    
                    {task.assignees.length > 0 && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {task.assignees.length} assignee{task.assignees.length > 1 ? 's' : ''}
                      </div>
                    )}

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

                    {task.subtasks && task.subtasks.length > 0 && (
                      <div className="text-xs">
                        {task.subtasks.filter(st => st.status === 'Completed').length}/{task.subtasks.length} subtasks
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSelectedTask(task)}>
                    Edit Task
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDeleteTask(task.id)}
                    className="text-destructive"
                  >
                    Delete Task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      ))}

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