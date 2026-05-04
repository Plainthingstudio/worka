import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Calendar,
  User,
  Paperclip,
  Flag,
  X,
  Users,
  CheckCircle,
  Circle,
  ExternalLink,
  MoreHorizontal,
  Edit,
  Trash2,
  Target,
  Clock,
  Plus,
  Download,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TaskWithRelations, TASK_STATUS_OPTIONS, TASK_STATUSES } from '@/types/task';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useTaskActivities } from '@/hooks/useTaskActivities';
import { BriefSelector } from './BriefSelector';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTaskProject } from '@/hooks/useTaskProject';
import DeleteConfirmationDialog from '@/components/projects/DeleteConfirmationDialog';
import { Avatar, AvatarFallback, InitialAvatar } from '@/components/ui/avatar';
import { account, databases, DATABASE_ID, Query } from '@/integrations/appwrite/client';
import { Badge } from '@/components/ui/badge';
import { CommentInput } from './CommentInput';
import { MentionText } from './MentionText';
import { dispatchMentionNotifications } from '@/utils/mentionNotifications';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['Low', 'Normal', 'High', 'Urgent']),
  task_type: z.enum(['Primary', 'Secondary', 'Tertiary']),
  status: z.enum(TASK_STATUSES),
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
  onAddSubtask?: (taskId: string) => void;
  onTaskSelect?: (task: TaskWithRelations) => void;
  allTasks?: TaskWithRelations[];
}

export const TaskDetailSidebar = ({
  task,
  isOpen,
  onClose,
  onUpdateTask,
  onDeleteTask,
  onAddComment,
  onUploadAttachment,
  onAddSubtask,
  onTaskSelect,
  allTasks = []
}: TaskDetailSidebarProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [isSubtasksOpen, setIsSubtasksOpen] = useState(true);
  const [isActivityOpen, setIsActivityOpen] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const { teamMembers, fetchTeamMembers } = useTeamMembers();
  const navigate = useNavigate();
  const { project } = useTaskProject(task?.project_id || null);
  const { activities, isLoading: activitiesLoading, addActivity, updateActivity, deleteActivity } = useTaskActivities(task?.id || '');
  const { userRole, isLoading: roleLoading } = useUserRole();
  const { toast } = useToast();

  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const user = await account.get();
        if (user) setCurrentUserId(user.$id);
      } catch {
        // not authenticated
      }
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (isOpen) fetchTeamMembers();
  }, [isOpen, fetchTeamMembers]);

  useEffect(() => {
    const fetchUserNames = async () => {
      if (activities.length === 0) return;

      const userIds = [...new Set(activities.map(activity => activity.user_id))];
      const names: Record<string, string> = {};

      for (const userId of userIds) {
        try {
          const teamMemberResponse = await databases.listDocuments(DATABASE_ID, 'team_members', [
            Query.equal('user_id', userId)
          ]);
          const teamMember = teamMemberResponse.documents[0] ?? null;

          if (teamMember?.name) {
            names[userId] = teamMember.name;
          } else {
            const profileResponse = await databases.listDocuments(DATABASE_ID, 'profiles', [
              Query.equal('$id', userId)
            ]);
            const profile = profileResponse.documents[0] ?? null;
            names[userId] = profile?.full_name || 'Demo User';
          }
        } catch (error) {
          console.error('Error fetching user name:', error);
          names[userId] = 'Demo User';
        }
      }

      setUserNames(names);
    };

    fetchUserNames();
  }, [activities]);

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
  }, [task]);

  if (!task || !isOpen) return null;

  const parentTask = task.parent_task_id
    ? allTasks.find((t) => t.id === task.parent_task_id)
    : null;

  const handleSeeProject = () => {
    if (task.project_id) navigate(`/projects/${task.project_id}`);
  };

  const handleSubmit = async (data: TaskFormData) => {
    if (!task) return;
    const success = await onUpdateTask(task.id, {
      ...data,
      due_date: data.due_date?.toISOString(),
    });
    if (success) setIsEditing(false);
  };

  const handleDeleteTask = async () => {
    if (!task) return;
    const success = await onDeleteTask(task.id);
    if (success) {
      setIsDeleteDialogOpen(false);
      onClose();
    }
  };

  const handleBriefChange = () => {
    window.location.reload();
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

  const mentionCandidates = teamMembers.map((m) => ({
    user_id: m.user_id,
    name: m.name,
  }));

  const candidateNames = mentionCandidates.map((c) => c.name);

  const handleSubmitComment = async (content: string, files: File[], mentionedUserIds: string[]) => {
    if (!task) return false;
    setIsSubmittingComment(true);
    try {
      const success = await addActivity(content, files);
      if (success && mentionedUserIds.length > 0) {
        await dispatchMentionNotifications({
          mentionedUserIds,
          taskId: task.id,
          taskTitle: task.title,
          commentContent: content,
        });
      }
      return success;
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleEditStart = (activity: any) => {
    setEditingActivityId(activity.id);
    setEditingContent(activity.content || '');
  };

  const handleEditSave = async (activityId: string) => {
    if (!editingContent.trim()) return;
    const success = await updateActivity(activityId, editingContent);
    if (success) {
      setEditingActivityId(null);
      setEditingContent('');
    }
  };

  const handleEditCancel = () => {
    setEditingActivityId(null);
    setEditingContent('');
  };

  const handleDelete = async (activityId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this comment?');
    if (confirmed) await deleteActivity(activityId);
  };

  const getActivityDescription = (activity: any) => {
    const { activity_type, metadata, content } = activity;
    switch (activity_type) {
      case 'comment': return content || 'Added a comment';
      case 'status_change':
        return `Changed status from ${metadata.old_value || 'Unknown'} to ${metadata.new_value || 'Unknown'}`;
      case 'assignee_change':
        if (metadata.action === 'added') return `Assigned ${metadata.assignee_name || 'user'}`;
        if (metadata.action === 'removed') return `Unassigned ${metadata.assignee_name || 'user'}`;
        return 'Updated assignees';
      case 'priority_change':
        return `Changed priority from ${metadata.old_value || 'Unknown'} to ${metadata.new_value || 'Unknown'}`;
      case 'due_date_change':
        if (metadata.old_value && metadata.new_value) {
          return `Changed due date from ${format(new Date(metadata.old_value), 'MMM dd, yyyy')} to ${format(new Date(metadata.new_value), 'MMM dd, yyyy')}`;
        }
        if (metadata.new_value) return `Set due date to ${format(new Date(metadata.new_value), 'MMM dd, yyyy')}`;
        return 'Removed due date';
      case 'attachment':
        return `Uploaded ${activity.attachments?.length || 1} file(s)`;
      case 'task_created': return 'Created this task';
      default: return 'Updated the task';
    }
  };

  return (
    <TooltipProvider>
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 z-[60]" onClick={onClose} />
      )}

      <div
        className={cn(
          "fixed top-0 right-0 w-[550px] h-full z-[70] flex flex-col transition-transform duration-300 ease-in-out bg-card border-l border-border-soft",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        style={{
          boxShadow: "0px 20px 25px -5px rgba(0,0,0,0.25), 0px 8px 10px -6px rgba(0,0,0,0.2)",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <Form {...form}>
          {/* Top bar — project name + Go to Project + actions */}
          <div
            className="flex items-center justify-between shrink-0 border-b border-border-soft"
            style={{
              height: 52,
              padding: "8px 24px",
            }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="truncate text-foreground"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  fontSize: 12,
                  lineHeight: "28px",
                }}
              >
                {project?.name || 'Project'}
                {parentTask && (
                  <>
                    <span className="text-text-tertiary" style={{ margin: "0 6px" }}>/</span>
                    <button
                      type="button"
                      onClick={() => onTaskSelect?.(parentTask)}
                      className="hover:underline text-muted-foreground"
                      style={{ fontWeight: 500 }}
                    >
                      {parentTask.title}
                    </button>
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {task.project_id && !roleLoading && userRole !== 'team' && (
                <button
                  type="button"
                  onClick={handleSeeProject}
                  className="inline-flex items-center transition-colors hover:bg-accent bg-card border border-border-soft text-foreground"
                  style={{
                    gap: 8,
                    padding: "4px 8px",
                    height: 28,
                    boxShadow: "0px 1px 2px rgba(15,23,42,0.05)",
                    borderRadius: 7,
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                    fontSize: 12,
                    lineHeight: "20px",
                  }}
                >
                  <ExternalLink style={{ width: 12, height: 12 }} strokeWidth={1.67} />
                  Go to Project
                </button>
              )}

              {!roleLoading && userRole !== 'team' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center transition-colors hover:bg-accent text-foreground"
                      style={{ width: 24, height: 24, borderRadius: 7 }}
                      aria-label="More actions"
                    >
                      <MoreHorizontal style={{ width: 16, height: 16 }} strokeWidth={1.67} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover border z-[80]">
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        form.setValue('status', 'Completed');
                        form.handleSubmit(handleSubmit)();
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as completed
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
              )}

              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center transition-colors hover:bg-accent text-foreground"
                style={{ width: 24, height: 24, borderRadius: 7 }}
                aria-label="Close"
              >
                <X style={{ width: 16, height: 16 }} strokeWidth={1.67} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col min-h-0">
            <ScrollArea className="flex-1">
              <div style={{ padding: "24px 24px 0", display: "flex", flexDirection: "column", gap: 32 }}>
                {/* Task title + parent reference */}
                <div className="space-y-3">
                  {/* Mark complete button */}
                  {userRole !== 'team' && (
                    <button
                      type="button"
                      onClick={() => {
                        const nextStatus = task.status === 'Completed' ? 'In progress' : 'Completed';
                        form.setValue('status', nextStatus);
                        form.handleSubmit(handleSubmit)();
                      }}
                      className={cn(
                        "inline-flex items-center transition-colors hover:bg-accent bg-card border border-border-soft",
                        task.status === 'Completed' ? "text-green-700 dark:text-green-400" : "text-foreground"
                      )}
                      style={{
                        gap: 8,
                        padding: "6px 10px",
                        height: 30,
                        boxShadow: "0px 1px 2px rgba(15,23,42,0.05)",
                        borderRadius: 7,
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 500,
                        fontSize: 13,
                        lineHeight: "18px",
                      }}
                    >
                      <CheckCircle
                        style={{ width: 14, height: 14 }}
                        strokeWidth={1.67}
                      />
                      {task.status === 'Completed' ? 'Completed' : 'Mark complete'}
                    </button>
                  )}

                  {isEditing && userRole !== 'team' ? (
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              style={{
                                fontFamily: "Inter, sans-serif",
                                fontWeight: 600,
                                fontSize: 24,
                                lineHeight: "28px",
                                border: "none",
                                padding: 0,
                                height: "auto",
                              }}
                              className="focus-visible:ring-0 text-foreground bg-transparent"
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
                      onClick={() => userRole !== 'team' && setIsEditing(true)}
                      className={cn("text-foreground", userRole !== 'team' && 'cursor-text')}
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 600,
                        fontSize: 24,
                        lineHeight: "28px",
                      }}
                    >
                      {task.title}
                    </h2>
                  )}

                  {/* Main task breadcrumb (only if subtask) */}
                  {parentTask && (
                    <p className="text-xs text-muted-foreground">
                      Main task:{' '}
                      <button
                        type="button"
                        onClick={() => onTaskSelect?.(parentTask)}
                        className="hover:underline text-foreground"
                        style={{ fontWeight: 500 }}
                      >
                        {parentTask.title}
                      </button>
                    </p>
                  )}
                </div>

                {/* Field rows */}
                <div className="space-y-3">
                  {/* Created time */}
                  <FieldRow icon={<Clock style={iconStyle} strokeWidth={1.67} />} label="Created time">
                    <span style={fieldValueStyle}>{format(new Date(task.created_at), 'MMMM dd, yyyy')}</span>
                  </FieldRow>

                  {/* Status */}
                  <FieldRow icon={<Target style={iconStyle} strokeWidth={1.67} />} label="Status">
                    {userRole === 'team' ? (
                      <Badge variant={form.watch('status').toLowerCase().replace(' ', '-') as any}>
                        {form.watch('status')}
                      </Badge>
                    ) : (
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              form.handleSubmit(handleSubmit)();
                            }}
                            value={field.value}
                          >
                            <SelectTrigger className="text-sm w-48 border-none shadow-none bg-transparent px-0 py-0 h-auto hover:bg-transparent focus:ring-0 group [&>svg]:hidden">
                              <div className="flex items-center gap-2">
                                <Badge variant={field.value.toLowerCase().replace(' ', '-') as any}>
                                  {field.value}
                                </Badge>
                                <ChevronDown className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </SelectTrigger>
                            <SelectContent className="bg-popover border z-[80]">
                              {TASK_STATUS_OPTIONS.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    )}
                  </FieldRow>

                  {/* Priority */}
                  <FieldRow icon={<Flag style={iconStyle} strokeWidth={1.67} />} label="Priority">
                    {userRole === 'team' ? (
                      <div className="flex items-center gap-2 text-sm">
                        {getPriorityIcon(form.watch('priority'))}
                        {form.watch('priority')}
                      </div>
                    ) : (
                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              form.handleSubmit(handleSubmit)();
                            }}
                            value={field.value}
                          >
                            <SelectTrigger className="text-sm w-48 border-none shadow-none bg-transparent px-0 py-0 h-auto hover:bg-transparent focus:ring-0 group [&>svg]:hidden">
                              <div className="flex items-center gap-2">
                                {getPriorityIcon(field.value)}
                                <SelectValue />
                                <ChevronDown className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </SelectTrigger>
                            <SelectContent className="bg-popover border z-[80]">
                              <SelectItem value="Low">Low</SelectItem>
                              <SelectItem value="Normal">Normal</SelectItem>
                              <SelectItem value="High">High</SelectItem>
                              <SelectItem value="Urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    )}
                  </FieldRow>

                  {/* Due date */}
                  <FieldRow icon={<Calendar style={iconStyle} strokeWidth={1.67} />} label="Due date">
                    {userRole === 'team' ? (
                      task.due_date ? (
                        <span className="text-foreground" style={fieldValueStyle}>{format(task.due_date, 'MMMM dd, yyyy')}</span>
                      ) : (
                        <span className="text-muted-foreground" style={fieldValueStyle}>No due date</span>
                      )
                    ) : (
                      <FormField
                        control={form.control}
                        name="due_date"
                        render={({ field }) => (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-48 justify-between text-left font-normal text-sm border-none shadow-none bg-transparent px-0 py-0 h-auto hover:bg-transparent focus:ring-0 group"
                              >
                                <span className="text-foreground" style={fieldValueStyle}>
                                  {field.value ? format(field.value, 'MMMM dd, yyyy') : 'Set due date'}
                                </span>
                                <ChevronDown className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-popover border z-[80]" align="start">
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
                    )}
                  </FieldRow>

                  {/* Assignees */}
                  <FieldRow icon={<Users style={iconStyle} strokeWidth={1.67} />} label="Assignees" alignTop>
                    {userRole === 'team' ? (
                      <div>
                        {task.assignees && task.assignees.length > 0 ? (
                          <div className="flex -space-x-2">
                            {task.assignees.map((assigneeId) => {
                              const member = teamMembers.find(m => m.user_id === assigneeId);
                              if (!member) return null;
                              return (
                                <Tooltip key={assigneeId}>
                                  <TooltipTrigger asChild>
                                    <InitialAvatar name={member.name} size={32} />
                                  </TooltipTrigger>
                                  <TooltipContent><p>{member.name}</p></TooltipContent>
                                </Tooltip>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">No assignees</div>
                        )}
                      </div>
                    ) : (
                      <FormField
                        control={form.control}
                        name="assignees"
                        render={({ field }) => (
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                              {field.value?.map((assigneeId) => {
                                const member = teamMembers.find(m => m.user_id === assigneeId);
                                if (!member) return null;
                                return (
                                  <Tooltip key={assigneeId}>
                                    <TooltipTrigger asChild>
                                      <div className="relative group">
                                        <InitialAvatar name={member.name} size={32} className="cursor-pointer" />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newAssignees = field.value?.filter(id => id !== assigneeId) || [];
                                            field.onChange(newAssignees);
                                            form.handleSubmit(handleSubmit)();
                                          }}
                                          className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"
                                        >
                                          <X className="h-2 w-2" />
                                        </button>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent><p>{member.name}</p></TooltipContent>
                                  </Tooltip>
                                );
                              })}
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-full">
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="z-[80]">
                                {teamMembers.filter(m => !field.value?.includes(m.user_id)).map(member => (
                                  <DropdownMenuItem
                                    key={member.id}
                                    onClick={() => {
                                      const newAssignees = [...(field.value || []), member.user_id];
                                      field.onChange(newAssignees);
                                      form.handleSubmit(handleSubmit)();
                                    }}
                                  >
                                    <User className="h-4 w-4 mr-2" />
                                    {member.name}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}
                      />
                    )}
                  </FieldRow>
                </div>

                {/* Brief Connection */}
                {(userRole !== 'team' || (task.brief_id && task.brief_type)) && (
                  <BriefSelector
                    taskId={task.id}
                    currentBrief={task.brief_id ? { id: task.brief_id, type: task.brief_type || '' } : null}
                    onBriefChange={handleBriefChange}
                  />
                )}

                {/* Description */}
                <div className="space-y-3">
                  <h3 style={sectionTitleStyle}>Description</h3>
                  {userRole === 'team' ? (
                    <div className="p-3 bg-surface-2 text-foreground rounded-md min-h-[100px] text-sm">
                      {task.description || 'No description'}
                    </div>
                  ) : (
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Add a description..."
                              rows={6}
                              className="resize-none text-sm border border-border-soft text-foreground bg-card"
                              style={{ borderRadius: 10, padding: "8px 12px" }}
                              onBlur={() => form.handleSubmit(handleSubmit)()}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* Subtasks (collapsible) */}
                {!task.parent_task_id && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <button
                        type="button"
                        onClick={() => setIsSubtasksOpen((v) => !v)}
                        className="flex items-center gap-2"
                      >
                        {isSubtasksOpen ? (
                          <ChevronDown className="text-foreground" style={{ width: 12, height: 12 }} strokeWidth={2} />
                        ) : (
                          <ChevronUp className="text-foreground" style={{ width: 12, height: 12 }} strokeWidth={2} />
                        )}
                        <h3 className="text-foreground" style={sectionTitleStyle}>Subtasks ({task.subtasks?.length || 0})</h3>
                      </button>
                      {onAddSubtask && (
                        <button
                          type="button"
                          onClick={() => onAddSubtask(task.id)}
                          className="inline-flex items-center justify-center transition-colors hover:bg-accent bg-card border border-border-soft text-foreground"
                          style={{
                            gap: 8,
                            padding: "8px 12px",
                            height: 36,
                            boxShadow: "0px 1px 2px rgba(15,23,42,0.05)",
                            borderRadius: 7,
                            fontFamily: "Inter, sans-serif",
                            fontWeight: 500,
                            fontSize: 14,
                          }}
                        >
                          <Plus className="text-foreground" style={{ width: 16, height: 16 }} strokeWidth={1.67} />
                          Add Subtask
                        </button>
                      )}
                    </div>

                    {isSubtasksOpen && (
                      <div>
                        {task.subtasks?.map((subtask, index) => {
                          const firstAssignee = subtask.assignees?.[0]
                            ? teamMembers.find(m => m.user_id === subtask.assignees[0])
                            : undefined;
                          const statusBadge = getSubtaskStatusBadge(subtask.status);

                          return (
                            <div
                              key={subtask.id}
                              className={cn(
                                "flex items-center hover:bg-accent/40 cursor-pointer transition-colors border-b border-border-soft/50",
                                index === 0 && "border-t"
                              )}
                              style={{
                                padding: "12px 0",
                                gap: 24,
                                minHeight: 48,
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                onClose();
                                setTimeout(() => {
                                  window.dispatchEvent(new CustomEvent('openTaskDetails', { detail: subtask }));
                                }, 100);
                              }}
                            >
                              {/* Toggle-complete radio + title */}
                              <div className="flex items-center flex-1 min-w-0" style={{ gap: 12 }}>
                                <button
                                  type="button"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    const isCompleted = subtask.status === 'Completed';
                                    await onUpdateTask(subtask.id, {
                                      status: isCompleted ? 'In progress' : 'Completed',
                                      completed_at: isCompleted ? null : new Date().toISOString(),
                                    });
                                  }}
                                  className="inline-flex items-center justify-center shrink-0 hover:opacity-80 transition-opacity"
                                  style={{ width: 20, height: 20, borderRadius: 10 }}
                                  aria-label={subtask.status === 'Completed' ? 'Mark as incomplete' : 'Mark as complete'}
                                  title={subtask.status === 'Completed' ? 'Mark as incomplete' : 'Mark as complete'}
                                >
                                  {subtask.status === 'Completed' ? (
                                    <CheckCircle className="text-green-600 dark:text-green-400" style={{ width: 16, height: 16 }} strokeWidth={1.67} />
                                  ) : (
                                    <Circle className="text-muted-foreground" style={{ width: 16, height: 16 }} strokeWidth={1.67} />
                                  )}
                                </button>
                                <span
                                  className="truncate text-foreground"
                                  style={{
                                    fontFamily: "Inter, sans-serif",
                                    fontWeight: 500,
                                    fontSize: 14,
                                    lineHeight: "20px",
                                    textDecoration: subtask.status === 'Completed' ? 'line-through' : 'none',
                                  }}
                                >
                                  {subtask.title}
                                </span>
                              </div>

                              {/* Status badge */}
                              <span
                                className="inline-flex items-center shrink-0"
                                style={{
                                  padding: "4px 8px",
                                  background: statusBadge.bg,
                                  boxShadow: `inset 0px 0px 0px 1px ${statusBadge.ring}`,
                                  borderRadius: 10,
                                  fontFamily: "Inter, sans-serif",
                                  fontWeight: 500,
                                  fontSize: 12,
                                  lineHeight: "16px",
                                  color: statusBadge.fg,
                                }}
                              >
                                {subtask.status}
                              </span>

                              {/* Assignee avatar */}
                              <div className="shrink-0">
                                {firstAssignee ? (
                                  <InitialAvatar name={firstAssignee.name} size={24} />
                                ) : (
                                  <span
                                    className="text-muted-foreground"
                                    style={{
                                      fontFamily: "Inter, sans-serif",
                                      fontSize: 12,
                                    }}
                                  >
                                    —
                                  </span>
                                )}
                              </div>

                              {/* Due date */}
                              <span
                                className="shrink-0 text-muted-foreground"
                                style={{
                                  fontFamily: "Inter, sans-serif",
                                  fontWeight: 400,
                                  fontSize: 14,
                                  lineHeight: "20px",
                                  minWidth: 50,
                                }}
                              >
                                {subtask.due_date ? format(subtask.due_date, 'MMM dd') : '—'}
                              </span>
                            </div>
                          );
                        })}
                        {(!task.subtasks || task.subtasks.length === 0) && (
                          <div
                            className="text-center py-4 text-muted-foreground"
                            style={{
                              fontFamily: "Inter, sans-serif",
                              fontSize: 14,
                            }}
                          >
                            No subtasks yet. Click "Add Subtask" to create one.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Activity (collapsible) */}
                <div>
                  <button
                    type="button"
                    onClick={() => setIsActivityOpen((v) => !v)}
                    className="flex items-center gap-2 mb-3"
                  >
                    {isActivityOpen ? (
                      <ChevronDown className="text-foreground" style={{ width: 12, height: 12 }} strokeWidth={2} />
                    ) : (
                      <ChevronUp className="text-foreground" style={{ width: 12, height: 12 }} strokeWidth={2} />
                    )}
                    <h3 className="text-foreground" style={sectionTitleStyle}>Activity</h3>
                  </button>

                  {isActivityOpen && (
                    <div className="space-y-3">
                      {activitiesLoading ? (
                        <div className="text-center text-muted-foreground py-8">Loading activities...</div>
                      ) : activities.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">No activities yet</div>
                      ) : (
                        activities.map((activity) => {
                          const isOwnComment = currentUserId === activity.user_id && activity.activity_type === 'comment';
                          const isEditingThis = editingActivityId === activity.id;

                          return (
                            <div
                              key={activity.id}
                              className="flex gap-3 border border-border-soft"
                              style={{ padding: 13, borderRadius: 12 }}
                            >
                              <InitialAvatar name={userNames[activity.user_id] || 'User'} size={32} className="shrink-0" />

                              <div className="flex-1 space-y-2 min-w-0">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className="text-foreground"
                                      style={{
                                        fontFamily: "Inter, sans-serif",
                                        fontWeight: 500,
                                        fontSize: 14,
                                      }}
                                    >
                                      {userNames[activity.user_id] || 'User'}
                                    </span>
                                    <span
                                      className="text-muted-foreground"
                                      style={{
                                        fontFamily: "Inter, sans-serif",
                                        fontSize: 12,
                                      }}
                                    >
                                      {format(new Date(activity.created_at), 'MMM dd, yyyy HH:mm')}
                                    </span>
                                  </div>

                                  {isOwnComment && (
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                          <MoreHorizontal className="h-3 w-3" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="bg-popover border z-[80]">
                                        <DropdownMenuItem onClick={() => handleEditStart(activity)}>
                                          <Edit className="h-3 w-3 mr-2" />
                                          Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => handleDelete(activity.id)}
                                          className="text-destructive"
                                        >
                                          <Trash2 className="h-3 w-3 mr-2" />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  )}
                                </div>

                                {isEditingThis ? (
                                  <div className="space-y-2">
                                    <Textarea
                                      value={editingContent}
                                      onChange={(e) => setEditingContent(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                          e.preventDefault();
                                          handleEditSave(activity.id);
                                        }
                                      }}
                                      className="text-sm resize-none min-h-[80px]"
                                      autoFocus
                                      rows={3}
                                    />
                                    <div className="flex gap-2">
                                      <Button size="sm" onClick={() => handleEditSave(activity.id)} className="h-6 text-xs">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Save
                                      </Button>
                                      <Button variant="outline" size="sm" onClick={handleEditCancel} className="h-6 text-xs">
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                ) : activity.activity_type === 'comment' ? (
                                  <div
                                    className="text-sm break-words text-foreground"
                                    style={{ fontFamily: "Inter, sans-serif", fontSize: 14, lineHeight: "20px" }}
                                  >
                                    <MentionText content={activity.content || ''} candidates={candidateNames} />
                                  </div>
                                ) : (
                                  <div className="text-sm text-muted-foreground" style={{ fontFamily: "Inter, sans-serif", fontSize: 14 }}>
                                    {getActivityDescription(activity)}
                                  </div>
                                )}

                                {activity.attachments && activity.attachments.length > 0 && (
                                  <div className="space-y-2">
                                    {activity.attachments.map((attachment: any, index: number) => (
                                      <div
                                        key={index}
                                        className="flex items-center gap-2 p-2 rounded bg-surface-2"
                                        style={{ borderRadius: 4 }}
                                      >
                                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-foreground">{attachment.file_name}</span>
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
                  )}
                </div>

                <div style={{ height: 24 }} />
              </div>
            </ScrollArea>

            {/* Chat input (compact w/ mentions) */}
            <div
              className="shrink-0 border-t border-border-soft bg-surface-2"
              style={{ padding: 16 }}
            >
              <CommentInput
                candidates={mentionCandidates}
                onSubmit={handleSubmitComment}
                isSubmitting={isSubmittingComment}
              />
            </div>
          </div>
        </Form>
      </div>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteTask}
      />
    </TooltipProvider>
  );
};

/* ── helpers ─────────────────────────────────────── */

const iconStyle: React.CSSProperties = { width: 16, height: 16, color: "hsl(var(--muted-foreground))" };

const fieldLabelStyle: React.CSSProperties = {
  fontFamily: "Inter, sans-serif",
  fontWeight: 400,
  fontSize: 14,
  lineHeight: "20px",
  color: "hsl(var(--muted-foreground))",
  width: 96,
};

const fieldValueStyle: React.CSSProperties = {
  fontFamily: "Inter, sans-serif",
  fontWeight: 400,
  fontSize: 14,
  lineHeight: "20px",
  color: "hsl(var(--foreground))",
};

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: "Inter, sans-serif",
  fontWeight: 500,
  fontSize: 14,
  lineHeight: "20px",
  color: "hsl(var(--foreground))",
};

const FieldRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  alignTop?: boolean;
}> = ({ icon, label, children, alignTop }) => (
  <div className={cn("flex", alignTop ? "items-start" : "items-center")} style={{ gap: 24 }}>
    <div className="flex items-center" style={{ gap: 8, width: 120 }}>
      {icon}
      <span style={fieldLabelStyle}>{label}</span>
    </div>
    <div className="flex-1 min-w-0">{children}</div>
  </div>
);

function getSubtaskStatusBadge(status: string): { bg: string; fg: string; ring: string } {
  const planning  = { bg: 'hsl(var(--status-planning-bg))',  fg: 'hsl(var(--status-planning-fg))',  ring: 'hsl(var(--status-planning-ring))' };
  switch (status) {
    case 'Planning':           return planning;
    case 'In progress':        return { bg: 'hsl(var(--status-progress-bg))',  fg: 'hsl(var(--status-progress-fg))',  ring: 'hsl(var(--status-progress-ring))' };
    case 'Awaiting Feedback':  return { bg: 'hsl(var(--status-feedback-bg))',  fg: 'hsl(var(--status-feedback-fg))',  ring: 'hsl(var(--status-feedback-ring))' };
    case 'Paused':             return { bg: 'hsl(var(--status-paused-bg))',    fg: 'hsl(var(--status-paused-fg))',    ring: 'hsl(var(--status-paused-ring))' };
    case 'Completed':          return { bg: 'hsl(var(--status-completed-bg))', fg: 'hsl(var(--status-completed-fg))', ring: 'hsl(var(--status-completed-ring))' };
    case 'Cancelled':          return { bg: 'hsl(var(--status-cancelled-bg))', fg: 'hsl(var(--status-cancelled-fg))', ring: 'hsl(var(--status-cancelled-ring))' };
    default:                   return planning;
  }
}
