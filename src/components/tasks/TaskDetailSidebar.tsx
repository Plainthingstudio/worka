import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  X,
  Calendar,
  Flag,
  User,
  MessageSquare,
  Paperclip,
  Send,
  Upload,
  MoreHorizontal,
  Clock,
  Tag,
  Link,
  CheckCircle,
  Circle
} from 'lucide-react';
import { TaskWithRelations, TaskStatus, TaskPriority } from '@/types/task';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TaskDetailSidebarProps {
  task: TaskWithRelations | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (taskId: string, updates: any) => Promise<boolean>;
  onDeleteTask: (taskId: string) => Promise<boolean>;
  onAddComment: (taskId: string, content: string) => Promise<boolean>;
  onUploadAttachment: (taskId: string, file: File) => Promise<boolean>;
}

const statusOptions: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'Planning', label: 'Planning', color: 'bg-gray-500' },
  { value: 'In progress', label: 'In Progress', color: 'bg-blue-500' },
  { value: 'Completed', label: 'Completed', color: 'bg-green-500' },
  { value: 'Paused', label: 'Paused', color: 'bg-yellow-500' },
  { value: 'Cancelled', label: 'Cancelled', color: 'bg-red-500' }
];

const priorityOptions: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'Low', label: 'Low', color: 'text-gray-500' },
  { value: 'Normal', label: 'Normal', color: 'text-blue-500' },
  { value: 'High', label: 'High', color: 'text-orange-500' },
  { value: 'Urgent', label: 'Urgent', color: 'text-red-500' }
];

export const TaskDetailSidebar = ({
  task,
  isOpen,
  onClose,
  onUpdateTask,
  onDeleteTask,
  onAddComment,
  onUploadAttachment
}: TaskDetailSidebarProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [newComment, setNewComment] = useState('');

  React.useEffect(() => {
    if (task) {
      setEditedTitle(task.title);
      setEditedDescription(task.description || '');
    }
  }, [task]);

  if (!task) return null;

  const handleSaveEdit = async () => {
    const success = await onUpdateTask(task.id, {
      title: editedTitle,
      description: editedDescription
    });
    if (success) {
      setIsEditing(false);
    }
  };

  const handleStatusChange = async (status: TaskStatus) => {
    await onUpdateTask(task.id, { 
      status,
      completed_at: status === 'Completed' ? new Date().toISOString() : null
    });
  };

  const handlePriorityChange = async (priority: TaskPriority) => {
    await onUpdateTask(task.id, { priority });
  };

  const handleAddComment = async () => {
    if (newComment.trim()) {
      const success = await onAddComment(task.id, newComment);
      if (success) {
        setNewComment('');
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onUploadAttachment(task.id, file);
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
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:max-w-none p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={async () => {
                    const isCompleted = task.status === 'Completed';
                    await onUpdateTask(task.id, {
                      status: isCompleted ? 'In progress' : 'Completed',
                      completed_at: isCompleted ? null : new Date().toISOString(),
                    });
                  }}
                >
                  {task.status === 'Completed' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </Button>
                {isEditing ? (
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="text-lg font-semibold border-none p-0 h-auto focus-visible:ring-0"
                    onBlur={handleSaveEdit}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveEdit();
                      }
                    }}
                    autoFocus
                  />
                ) : (
                  <SheetTitle 
                    className={cn(
                      "text-lg cursor-pointer hover:bg-muted/50 px-2 py-1 rounded",
                      task.status === 'Completed' && "line-through text-muted-foreground"
                    )}
                    onClick={() => setIsEditing(true)}
                  >
                    {task.title}
                  </SheetTitle>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </SheetHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Quick Properties */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Flag className="h-3 w-3" />
                    Status
                  </label>
                  <Select value={task.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", option.color)} />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Flag className="h-3 w-3" />
                    Priority
                  </label>
                  <Select value={task.priority} onValueChange={handlePriorityChange}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Flag className={cn("h-3 w-3", option.color)} />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Assignees
                  </label>
                  <div className="text-sm text-muted-foreground">
                    {task.assignees.length > 0 ? (
                      `${task.assignees.length} assignee${task.assignees.length > 1 ? 's' : ''}`
                    ) : (
                      'Unassigned'
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Due Date
                  </label>
                  <div className="text-sm text-muted-foreground">
                    {task.due_date ? format(task.due_date, 'MMM dd, yyyy') : 'No due date'}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Description</label>
                {isEditing ? (
                  <Textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    placeholder="Add a description..."
                    className="min-h-[100px]"
                    onBlur={handleSaveEdit}
                  />
                ) : (
                  <div
                    className="text-sm text-muted-foreground cursor-pointer hover:bg-muted/50 p-2 rounded min-h-[50px]"
                    onClick={() => setIsEditing(true)}
                  >
                    {task.description || 'Add a description...'}
                  </div>
                )}
              </div>

              <Separator />

              {/* Tabs for Comments and Attachments */}
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
                    Task created on {format(task.created_at, 'MMM dd, yyyy at h:mm a')}
                  </div>
                  {task.completed_at && (
                    <div className="text-sm text-muted-foreground">
                      Task completed on {format(task.completed_at, 'MMM dd, yyyy at h:mm a')}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="comments" className="space-y-4 mt-4">
                  {/* Add Comment */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAddComment();
                        }
                      }}
                    />
                    <Button 
                      size="icon" 
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-3">
                    {task.comments?.map((comment) => (
                      <div key={comment.id} className="bg-muted/30 p-3 rounded-lg">
                        <div className="text-sm mb-1">{comment.content}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(comment.created_at, 'MMM dd, yyyy at h:mm a')}
                        </div>
                      </div>
                    )) || (
                      <div className="text-sm text-muted-foreground text-center py-4">
                        No comments yet
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="attachments" className="space-y-4 mt-4">
                  {/* Upload Attachment */}
                  <div>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById('file-upload')?.click()}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </Button>
                  </div>

                  {/* Attachments List */}
                  <div className="space-y-2">
                    {task.attachments?.map((attachment) => (
                      <div key={attachment.id} className="flex items-center gap-3 p-2 border rounded-lg">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{attachment.file_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatFileSize(attachment.file_size)}
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => window.open(attachment.file_url, '_blank')}
                        >
                          Open
                        </Button>
                      </div>
                    )) || (
                      <div className="text-sm text-muted-foreground text-center py-4">
                        No attachments yet
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};