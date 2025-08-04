import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { getStatusSolidClass } from '@/utils/statusColors';
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
  Calendar, 
  User, 
  MessageSquare, 
  Paperclip, 
  Flag, 
  X,
  Send,
  Upload,
  Download,
  Clock,
  Target,
  Users,
  CheckCircle
} from 'lucide-react';
import { TaskWithRelations } from '@/types/task';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['Low', 'Normal', 'High', 'Urgent']),
  task_type: z.enum(['Primary', 'Secondary', 'Tertiary']),
  status: z.enum(['Planning', 'In progress', 'Paused', 'Completed', 'Cancelled']),
  assignees: z.array(z.string()).optional(),
  due_date: z.date().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface ClickUpTaskDetailProps {
  task: TaskWithRelations | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (taskId: string, updates: any) => Promise<boolean>;
  onDeleteTask: (taskId: string) => Promise<boolean>;
  onAddComment: (taskId: string, content: string) => Promise<boolean>;
  onUploadAttachment: (taskId: string, file: File) => Promise<boolean>;
}

export const ClickUpTaskDetail = ({ 
  task, 
  isOpen, 
  onClose, 
  onUpdateTask, 
  onDeleteTask, 
  onAddComment, 
  onUploadAttachment 
}: ClickUpTaskDetailProps) => {
  const [newComment, setNewComment] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { teamMembers, fetchTeamMembers } = useTeamMembers();

  useEffect(() => {
    if (isOpen) {
      fetchTeamMembers();
    }
  }, [isOpen, fetchTeamMembers]);

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      priority: task?.priority || 'Normal',
      task_type: task?.task_type || 'Primary',
      status: task?.status || 'Planning',
      assignees: task?.assignees || [],
      due_date: task?.due_date ? new Date(task.due_date) : undefined,
    },
  });

  // Don't render if task is null
  if (!task) {
    return null;
  }

  const handleSubmit = async (data: TaskFormData) => {
    if (!task) return;
    const success = await onUpdateTask(task.id, {
      ...data,
      due_date: data.due_date?.toISOString(),
    });
    if (success) {
      setIsEditing(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !task) return;
    
    const success = await onAddComment(task.id, newComment);
    if (success) {
      setNewComment('');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!task) return;
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    await onUploadAttachment(task.id, file);
    setIsUploading(false);
    event.target.value = '';
  };


  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'Urgent': return <Flag className="h-3 w-3 text-red-500" />;
      case 'High': return <Flag className="h-3 w-3 text-orange-500" />;
      case 'Normal': return <Flag className="h-3 w-3 text-blue-500" />;
      case 'Low': return <Flag className="h-3 w-3 text-gray-500" />;
      default: return <Flag className="h-3 w-3 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-gray-600" />
                </div>
                {isEditing ? (
                  <Form {...form}>
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input 
                              {...field} 
                              className="text-lg font-semibold border-none p-0 h-auto focus-visible:ring-0"
                              onBlur={() => form.handleSubmit(handleSubmit)()}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Form>
                ) : (
                  <h2 
                    className="text-lg font-semibold cursor-text hover:bg-gray-50 px-2 py-1 rounded"
                    onClick={() => setIsEditing(true)}
                  >
                    {task.title}
                  </h2>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="flex flex-1 overflow-hidden">
            {/* Left Content */}
            <div className="flex-1 p-6 overflow-auto">
              {/* Status and Priority Row */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Target className="h-4 w-4" />
                    Status
                  </div>
                  <Form {...form}>
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <Select onValueChange={(value) => {
                          field.onChange(value);
                          form.handleSubmit(handleSubmit)();
                        }} defaultValue={field.value}>
                          <SelectTrigger className={`${getStatusSolidClass(field.value)} text-white border-none`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Planning">Planning</SelectItem>
                            <SelectItem value="In progress">In Progress</SelectItem>
                            <SelectItem value="Paused">Paused</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </Form>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Flag className="h-4 w-4" />
                    Priority
                  </div>
                  <Form {...form}>
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <Select onValueChange={(value) => {
                          field.onChange(value);
                          form.handleSubmit(handleSubmit)();
                        }} defaultValue={field.value}>
                          <SelectTrigger>
                            <div className="flex items-center gap-2">
                              {getPriorityIcon(field.value)}
                              <SelectValue />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Normal">Normal</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </Form>
                </div>
              </div>

              {/* Assignees and Due Date Row */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    Assignees
                  </div>
                  <Form {...form}>
                    <FormField
                      control={form.control}
                      name="assignees"
                      render={({ field }) => (
                        <div className="space-y-2">
                          <Select
                            onValueChange={(value) => {
                              const currentAssignees = field.value || [];
                              if (!currentAssignees.includes(value)) {
                                const newAssignees = [...currentAssignees, value];
                                field.onChange(newAssignees);
                                form.setValue('assignees', newAssignees);
                                form.handleSubmit(handleSubmit)();
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Add assignee" />
                            </SelectTrigger>
                            <SelectContent>
                              {teamMembers.map((member) => (
                                <SelectItem key={member.id} value={member.user_id}>
                                  {member.name} ({member.position})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {field.value && field.value.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {field.value.map((assigneeId) => {
                                const member = teamMembers.find(m => m.user_id === assigneeId);
                                return member ? (
                                  <Badge key={assigneeId} variant="secondary" className="text-xs">
                                    {member.name}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newAssignees = field.value?.filter(id => id !== assigneeId) || [];
                                        field.onChange(newAssignees);
                                        form.setValue('assignees', newAssignees);
                                        form.handleSubmit(handleSubmit)();
                                      }}
                                      className="ml-1 hover:text-destructive"
                                    >
                                      ×
                                    </button>
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    />
                  </Form>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Due Date
                  </div>
                  <Form {...form}>
                    <FormField
                      control={form.control}
                      name="due_date"
                      render={({ field }) => (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, 'MMM dd, yyyy') : 'Set due date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                field.onChange(date);
                                form.setValue('due_date', date);
                                form.handleSubmit(handleSubmit)();
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      )}
                    />
                  </Form>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2 mb-6">
                <h3 className="text-sm font-medium">Description</h3>
                <Form {...form}>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Add a description..."
                            rows={4}
                            className="resize-none"
                            onBlur={() => form.handleSubmit(handleSubmit)()}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Form>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="activity" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="comments">
                    Comments ({task.comments?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="attachments">
                    Attachments ({task.attachments?.length || 0})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="activity" className="space-y-4 mt-4">
                  <div className="text-sm text-muted-foreground">
                    Task created on {format(new Date(task.created_at), 'MMM dd, yyyy HH:mm')}
                  </div>
                </TabsContent>

                <TabsContent value="comments" className="space-y-4 mt-4">
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {task.comments?.map((comment) => (
                        <div key={comment.id} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">User</span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(comment.created_at), 'MMM dd, yyyy HH:mm')}
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

                <TabsContent value="attachments" className="space-y-4 mt-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">Attachments</h3>
                    <div>
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={handleFileUpload}
                        accept="image/*,application/pdf,.doc,.docx,.txt"
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
                                {formatFileSize(attachment.file_size)} • {format(new Date(attachment.created_at), 'MMM dd, yyyy')}
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
              </Tabs>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};