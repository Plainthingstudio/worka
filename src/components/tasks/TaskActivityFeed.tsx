
import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  User, 
  MessageSquare, 
  Paperclip, 
  Flag, 
  Users, 
  Calendar,
  CheckCircle,
  Clock,
  Plus,
  Send,
  Upload,
  Download,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { TaskWithRelations } from '@/types/task';

interface TaskActivityFeedActivity {
  id: string;
  task_id: string;
  user_id: string;
  activity_type: 'comment' | 'status_change' | 'assignee_change' | 'priority_change' | 'attachment' | 'task_created' | 'due_date_change' | 'task_updated';
  content?: string | null;
  metadata: any;
  attachments: any[];
  created_at: Date;
  user_name?: string;  // Add user name field
  user_email?: string; // Add user email field
}

interface TaskActivityFeedProps {
  task: TaskWithRelations;
  activities: TaskActivityFeedActivity[];
  onAddActivity: (content: string, files?: File[]) => Promise<boolean>;
  onUploadAttachment: (taskId: string, file: File) => Promise<boolean>;
  isLoading?: boolean;
  showActivities?: boolean; // New prop to control whether to show activities
}

export const TaskActivityFeed = ({ 
  task, 
  activities, 
  onAddActivity, 
  onUploadAttachment,
  isLoading = false,
  showActivities = true // Default to true for backward compatibility
}: TaskActivityFeedProps) => {
  const [newComment, setNewComment] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File "${file.name}" is too large. Maximum size is 5MB.`);
        return false;
      }
      return true;
    });
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!newComment.trim() && selectedFiles.length === 0) return;
    
    setIsSubmitting(true);
    try {
      const success = await onAddActivity(newComment, selectedFiles);
      if (success) {
        setNewComment('');
        setSelectedFiles([]);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'comment': return <MessageSquare className="h-4 w-4" />;
      case 'attachment': return <Paperclip className="h-4 w-4" />;
      case 'status_change': return <CheckCircle className="h-4 w-4" />;
      case 'assignee_change': return <Users className="h-4 w-4" />;
      case 'priority_change': return <Flag className="h-4 w-4" />;
      case 'due_date_change': return <Calendar className="h-4 w-4" />;
      case 'task_created': return <Plus className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityDescription = (activity: TaskActivityFeedActivity) => {
    const { activity_type, metadata, content } = activity;
    
    switch (activity_type) {
      case 'comment':
        return content || 'Added a comment';
      case 'status_change':
        return `Changed status from ${metadata.old_value || 'Unknown'} to ${metadata.new_value || 'Unknown'}`;
      case 'assignee_change':
        if (metadata.action === 'added') {
          return `Assigned ${metadata.assignee_name || 'user'}`;
        } else if (metadata.action === 'removed') {
          return `Unassigned ${metadata.assignee_name || 'user'}`;
        }
        return 'Updated assignees';
      case 'priority_change':
        return `Changed priority from ${metadata.old_value || 'Unknown'} to ${metadata.new_value || 'Unknown'}`;
      case 'due_date_change':
        if (metadata.old_value && metadata.new_value) {
          return `Changed due date from ${format(new Date(metadata.old_value), 'MMM dd, yyyy')} to ${format(new Date(metadata.new_value), 'MMM dd, yyyy')}`;
        } else if (metadata.new_value) {
          return `Set due date to ${format(new Date(metadata.new_value), 'MMM dd, yyyy')}`;
        } else {
          return 'Removed due date';
        }
      case 'attachment':
        return `Uploaded ${activity.attachments?.length || 1} file(s)`;
      case 'task_created':
        return 'Created this task';
      default:
        return 'Updated the task';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const sortedActivities = [...activities].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  console.log('TaskActivityFeed: Rendering activities:', sortedActivities.map(a => ({ id: a.id, user_name: a.user_name, user_id: a.user_id })));

  if (!showActivities) {
    // Only render the comment input section
    return (
      <div className="space-y-4">
        <Input
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          className="border-none p-0 focus-visible:ring-0 text-sm"
        />
        
        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                <div className="flex items-center gap-2">
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{file.name}</span>
                  <span className="text-xs text-muted-foreground">({formatFileSize(file.size)})</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              multiple
              onChange={handleFileSelect}
              accept="image/*,application/pdf,.doc,.docx,.txt,.zip,.rar"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => document.getElementById('file-upload')?.click()}
              className="h-8 px-2"
            >
              <Upload className="h-4 w-4 mr-1" />
              Attach
            </Button>
          </div>
          
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting || (!newComment.trim() && selectedFiles.length === 0)}
            className="h-8"
          >
            <Send className="h-4 w-4 mr-1" />
            {isSubmitting ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Activity Feed - Scrollable */}
      <div className="flex-1 overflow-y-auto mb-4">
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">Loading activities...</div>
          ) : sortedActivities.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No activities yet</div>
          ) : (
            sortedActivities.map((activity) => {
              const displayName = activity.user_name || 'Unknown User';
              const avatarInitial = displayName.charAt(0).toUpperCase();
              
              console.log(`Rendering activity ${activity.id} by user ${activity.user_id} with name: "${displayName}"`);
              
              return (
                <div key={activity.id} className="flex gap-3 p-3 border rounded-lg">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {avatarInitial}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-sm">
                        {getActivityIcon(activity.activity_type)}
                        <span className="font-medium">{displayName}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(activity.created_at), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                    
                    <div className="text-sm">{getActivityDescription(activity)}</div>
                    
                    {/* Attachments */}
                    {activity.attachments && activity.attachments.length > 0 && (
                      <div className="space-y-2">
                        {activity.attachments.map((attachment: any, index: number) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                            <Paperclip className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{attachment.file_name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 ml-auto"
                              asChild
                            >
                              <a href={attachment.file_url} target="_blank" rel="noopener noreferrer">
                                <Download className="h-3 w-3" />
                              </a>
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Separator */}
      <Separator className="mb-4" />

      {/* Fixed Comment Input at Bottom */}
      <div className="border rounded-lg p-4 space-y-4 bg-background">
        <Input
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          className="border-none p-0 focus-visible:ring-0 text-sm"
        />
        
        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                <div className="flex items-center gap-2">
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{file.name}</span>
                  <span className="text-xs text-muted-foreground">({formatFileSize(file.size)})</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              multiple
              onChange={handleFileSelect}
              accept="image/*,application/pdf,.doc,.docx,.txt,.zip,.rar"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => document.getElementById('file-upload')?.click()}
              className="h-8 px-2"
            >
              <Upload className="h-4 w-4 mr-1" />
              Attach
            </Button>
          </div>
          
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting || (!newComment.trim() && selectedFiles.length === 0)}
            className="h-8"
          >
            <Send className="h-4 w-4 mr-1" />
            {isSubmitting ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </div>
    </div>
  );
};
