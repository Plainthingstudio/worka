import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Calendar, 
  User, 
  MessageSquare, 
  Paperclip, 
  Flag, 
  Upload,
  Download,
  Send,
  ExternalLink,
  MoreHorizontal,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { TaskWithRelations, TaskPriority, TaskType, TaskStatus } from '@/types/task';
import { format } from 'date-fns';
import { useTaskProject } from '@/hooks/useTaskProject';
import DeleteConfirmationDialog from '@/components/projects/DeleteConfirmationDialog';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['Low', 'Normal', 'High', 'Urgent']),
  task_type: z.enum(['Primary', 'Secondary', 'Tertiary']),
  status: z.enum(['Planning', 'In progress', 'Paused', 'Completed', 'Cancelled']),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskDetailDialogProps {
  task: TaskWithRelations;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (taskId: string, updates: any) => Promise<boolean>;
  onDeleteTask: (taskId: string) => Promise<boolean>;
  onAddComment: (taskId: string, content: string) => Promise<boolean>;
  onUploadAttachment: (taskId: string, file: File) => Promise<boolean>;
}

export const TaskDetailDialog = ({ 
  task, 
  isOpen, 
  onClose, 
  onUpdateTask, 
  onDeleteTask, 
  onAddComment, 
  onUploadAttachment 
}: TaskDetailDialogProps) => {
  const [newComment, setNewComment] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { project } = useTaskProject(task.project_id);

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      task_type: task.task_type,
      status: task.status,
    },
  });

  const handleSeeProject = () => {
    if (task.project_id) {
      navigate(`/projects/${task.project_id}`);
    }
  };

  const handleSubmit = async (data: TaskFormData) => {
    const success = await onUpdateTask(task.id, data);
    if (success) {
      onClose();
    }
  };

  const handleDeleteTask = async () => {
    const success = await onDeleteTask(task.id);
    if (success) {
      setIsDeleteDialogOpen(false);
      onClose();
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    const success = await onAddComment(task.id, newComment);
    if (success) {
      setNewComment('');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size must be less than 10MB');
      return;
    }

    console.log('Starting file upload from TaskDetailDialog:', file.name);
    setIsUploading(true);
    
    try {
      const success = await onUploadAttachment(task.id, file);
      console.log('Upload result:', success);
      
      if (success) {
        console.log('File uploaded successfully');
      } else {
        console.error('File upload failed');
      }
    } catch (error) {
      console.error('File upload error:', error);
    } finally {
      setIsUploading(false);
      event.target.value = ''; // Reset input
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-destructive';
      case 'High': return 'bg-orange-500';
      case 'Normal': return 'bg-blue-500';
      case 'Low': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Sort comments by creation date in descending order (newest first)
  const sortedComments = task.comments?.slice().sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ) || [];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`} />
                {task.title}
              </DialogTitle>
              <div className="flex items-center gap-2">
                {task.project_id && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleSeeProject}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {project ? `Go to ${project.name}` : 'See Project'}
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-background border z-[80]">
                    <DropdownMenuItem onClick={() => {}}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setIsDeleteDialogOpen(true)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </DialogHeader>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="comments">
                Comments ({task.comments?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="attachments">
                Attachments ({task.attachments?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="subtasks">
                Subtasks ({task.subtasks?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea rows={4} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Planning">Planning</SelectItem>
                              <SelectItem value="In progress">In Progress</SelectItem>
                              <SelectItem value="Paused">Paused</SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                              <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Low">Low</SelectItem>
                              <SelectItem value="Normal">Normal</SelectItem>
                              <SelectItem value="High">High</SelectItem>
                              <SelectItem value="Urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="task_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Task Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Primary">Primary</SelectItem>
                              <SelectItem value="Secondary">Secondary</SelectItem>
                              <SelectItem value="Tertiary">Tertiary</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Calendar className="h-4 w-4" />
                        Due Date
                      </div>
                      <div>
                        {task.due_date ? format(task.due_date, 'MMM dd, yyyy') : 'No due date'}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <User className="h-4 w-4" />
                        Assignees
                      </div>
                      <div>
                        {task.assignees.length > 0 ? `${task.assignees.length} assigned` : 'No assignees'}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="comments" className="space-y-4">
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {sortedComments.map((comment) => (
                    <div key={comment.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">User</span>
                        <span className="text-xs text-muted-foreground">
                          {format(comment.created_at, 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  ))}
                  {(!task.comments || task.comments.length === 0) && (
                    <div className="text-center text-muted-foreground">No comments yet</div>
                  )}
                </div>
              </ScrollArea>

              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={2}
                  className="flex-1"
                />
                <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="attachments" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Attachments</h3>
                <div>
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept="image/*,application/pdf,.doc,.docx,.txt,.zip,.rar"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    disabled={isUploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploading ? 'Uploading...' : 'Upload File'}
                  </Button>
                </div>
              </div>

              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {task.attachments?.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between border rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">{attachment.file_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatFileSize(attachment.file_size)} • {format(attachment.created_at, 'MMM dd, yyyy')}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={attachment.file_url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  ))}
                  {(!task.attachments || task.attachments.length === 0) && (
                    <div className="text-center text-muted-foreground">No attachments</div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="subtasks" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Subtasks</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // This will be handled by the parent component
                    console.log('Create subtask for task:', task.id);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subtask
                </Button>
              </div>

              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {task.subtasks?.map((subtask) => (
                    <div key={subtask.id} className="border rounded-lg p-3 hover:bg-muted/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getPriorityColor(subtask.priority)}`} />
                          <span className="text-sm font-medium">{subtask.title}</span>
                          <Badge variant={subtask.status === 'Completed' ? 'default' : 'secondary'} className="text-xs">
                            {subtask.status}
                          </Badge>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            console.log('Open subtask:', subtask.id);
                            // This will open the subtask in detail view
                          }}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                      {subtask.description && (
                        <p className="text-xs text-muted-foreground mb-2">{subtask.description}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          {subtask.assignees.length > 0 && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {subtask.assignees.length}
                            </span>
                          )}
                          {subtask.due_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(subtask.due_date, 'MMM dd')}
                            </span>
                          )}
                        </div>
                        <span>{format(subtask.created_at, 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                  ))}
                  {(!task.subtasks || task.subtasks.length === 0) && (
                    <div className="text-center text-muted-foreground py-8">
                      No subtasks yet. Click "Add Subtask" to create one.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteTask}
      />
    </>
  );
};
