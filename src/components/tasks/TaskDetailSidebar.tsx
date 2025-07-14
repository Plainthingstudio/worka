import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
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
import { cn } from '@/lib/utils';
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

interface TaskDetailSidebarProps {
  task: TaskWithRelations | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (taskId: string, updates: any) => Promise<boolean>;
  onDeleteTask: (taskId: string) => Promise<boolean>;
  onAddComment: (taskId: string, content: string) => Promise<boolean>;
  onUploadAttachment: (taskId: string, file: File) => Promise<boolean>;
}

export const TaskDetailSidebar = ({ 
  task, 
  isOpen, 
  onClose, 
  onUpdateTask, 
  onDeleteTask, 
  onAddComment, 
  onUploadAttachment 
}: TaskDetailSidebarProps) => {
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
      title: '',
      description: '',
      priority: 'Normal',
      task_type: 'Primary', 
      status: 'Planning',
      assignees: [],
      due_date: undefined,
    },
  });

  // Reset form when task changes - removed form from dependency array to prevent infinite re-renders
  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'Normal',
        task_type: task.task_type || 'Primary',
        status: task.status || 'Planning',
        assignees: task.assignees || [],
        due_date: task.due_date ? new Date(task.due_date) : undefined,
      });
    }
  }, [task]); // Only depend on task, not form

  // Don't render if task is null or not open
  if (!task || !isOpen) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-500 hover:bg-green-600';
      case 'In progress': return 'bg-blue-500 hover:bg-blue-600';
      case 'Planning': return 'bg-gray-500 hover:bg-gray-600';
      case 'Paused': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'Cancelled': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
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

  // Sort comments by creation date in descending order (newest first)
  const sortedComments = task.comments?.slice().sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ) || [];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-[60]" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 right-0 w-[500px] h-full bg-background border-l shadow-xl z-[70] flex flex-col transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <Form {...form}>
          {/* Header */}
          <div className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-gray-600" />
                </div>
                {isEditing ? (
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input 
                            {...field} 
                            className="text-lg font-semibold border-none p-0 h-auto focus-visible:ring-0"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                form.handleSubmit(handleSubmit)();
                                setIsEditing(false);
                              } else if (e.key === 'Escape') {
                                e.preventDefault();
                                form.reset({
                                  title: task.title || '',
                                  description: task.description || '',
                                  priority: task.priority || 'Normal',
                                  task_type: task.task_type || 'Primary',
                                  status: task.status || 'Planning',
                                  assignees: task.assignees || [],
                                  due_date: task.due_date ? new Date(task.due_date) : undefined,
                                });
                                setIsEditing(false);
                              }
                            }}
                            onBlur={() => {
                              form.handleSubmit(handleSubmit)();
                              setIsEditing(false);
                            }}
                            autoFocus
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
          </div>
          <ScrollArea className="flex-1 p-6">
            {/* Status and Priority Row */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Target className="h-4 w-4" />
                  Status
                </div>
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <Select onValueChange={(value) => {
                      field.onChange(value);
                      form.handleSubmit(handleSubmit)();
                    }} value={field.value}>
                      <SelectTrigger className={`${getStatusColor(field.value)} text-white border-none text-sm h-9`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border z-[80]">
                        <SelectItem value="Planning">Planning</SelectItem>
                        <SelectItem value="In progress">In Progress</SelectItem>
                        <SelectItem value="Paused">Paused</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Flag className="h-4 w-4" />
                  Priority
                </div>
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <Select onValueChange={(value) => {
                      field.onChange(value);
                      form.handleSubmit(handleSubmit)();
                    }} value={field.value}>
                      <SelectTrigger className="text-sm h-9">
                        <div className="flex items-center gap-2">
                          {getPriorityIcon(field.value)}
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-background border z-[80]">
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Normal">Normal</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
            {/* Assignees and Due Date Row */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  Assignees
                </div>
                <FormField
                  control={form.control}
                  name="assignees"
                  render={({ field }) => (
                    <div className="space-y-3">
                      <Select
                        onValueChange={(value) => {
                          const currentAssignees = field.value || [];
                          if (!currentAssignees.includes(value)) {
                            const newAssignees = [...currentAssignees, value];
                            field.onChange(newAssignees);
                            form.handleSubmit(handleSubmit)();
                          }
                        }}
                      >
                        <SelectTrigger className="text-sm h-9">
                          <SelectValue placeholder="Add assignee" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border z-[80]">
                          {teamMembers.map((member) => (
                            <SelectItem key={member.id} value={member.user_id}>
                              {member.name} ({member.position})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {field.value && field.value.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {field.value.map((assigneeId) => {
                            const member = teamMembers.find(m => m.user_id === assigneeId);
                            return member ? (
                              <Badge key={assigneeId} variant="secondary" className="text-sm">
                                {member.name}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newAssignees = field.value?.filter(id => id !== assigneeId) || [];
                                    field.onChange(newAssignees);
                                    form.handleSubmit(handleSubmit)();
                                  }}
                                  className="ml-2 hover:text-destructive"
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
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Due Date
                </div>
                <FormField
                  control={form.control}
                  name="due_date"
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal text-sm h-9"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, 'MMM dd, yyyy') : 'Set due date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-background border z-[80]" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            form.handleSubmit(handleSubmit)();
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>
            </div>
            {/* Description */}
            <div className="space-y-3 mb-8">
              <h3 className="text-sm font-medium">Description</h3>
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
                        className="resize-none text-sm"
                        onBlur={() => form.handleSubmit(handleSubmit)()}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

          {/* Tabs */}
          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-10">
              <TabsTrigger value="activity" className="text-sm">Activity</TabsTrigger>
              <TabsTrigger value="comments" className="text-sm">
                Comments ({task.comments?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="attachments" className="text-sm">
                Files ({task.attachments?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="space-y-4 mt-6">
              <div className="text-sm text-muted-foreground">
                Task created on {format(new Date(task.created_at), 'MMM dd, yyyy HH:mm')}
              </div>
            </TabsContent>

            <TabsContent value="comments" className="space-y-4 mt-6">
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {sortedComments.map((comment) => (
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
                </div>
              </ScrollArea>
              <div className="flex gap-3 mt-4">
                <Input
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="text-sm h-9"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                />
                <Button size="sm" onClick={handleAddComment} className="h-9 px-3">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="attachments" className="space-y-4 mt-6">
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {task.attachments?.map((attachment) => (
                    <div key={attachment.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{attachment.file_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(attachment.file_size)}
                        </p>
                      </div>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="mt-4">
                <label className="block">
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isUploading}
                    className="w-full h-9 text-sm"
                    onClick={(e) => {
                      const input = e.currentTarget.parentNode?.querySelector('input[type="file"]') as HTMLInputElement;
                      input?.click();
                    }}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploading ? 'Uploading...' : 'Upload File'}
                  </Button>
                </label>
              </div>
            </TabsContent>
          </Tabs>
          </ScrollArea>
        </Form>
      </div>
    </>
  );
};
