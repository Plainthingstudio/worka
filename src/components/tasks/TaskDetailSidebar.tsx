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
import { Badge } from '@/components/ui/badge';
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
  MessageSquare, 
  Paperclip, 
  Flag, 
  X,
  Users,
  CheckCircle,
  ExternalLink,
  MoreHorizontal,
  Edit,
  Trash2,
  Target,
  Clock,
  Plus,
  Download,
  ChevronDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TaskWithRelations } from '@/types/task';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useTaskActivities } from '@/hooks/useTaskActivities';
import { TaskActivityFeed } from './TaskActivityFeed';
import { BriefSelector } from './BriefSelector';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTaskProject } from '@/hooks/useTaskProject';
import DeleteConfirmationDialog from '@/components/projects/DeleteConfirmationDialog';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { getStatusSolidClass } from '@/utils/statusColors';

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
  onAddSubtask?: (taskId: string) => void;
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
  allTasks = []
}: TaskDetailSidebarProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const { teamMembers, fetchTeamMembers } = useTeamMembers();
  const navigate = useNavigate();
  const { project } = useTaskProject(task?.project_id || null);
  const { activities, isLoading: activitiesLoading, addActivity, updateActivity, deleteActivity } = useTaskActivities(task?.id || '');
  const { userRole, isLoading: roleLoading } = useUserRole();
  const { toast } = useToast();

  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchTeamMembers();
    }
  }, [isOpen, fetchTeamMembers]);

  useEffect(() => {
    const fetchUserNames = async () => {
      if (activities.length === 0) return;
      
      const userIds = [...new Set(activities.map(activity => activity.user_id))];
      const names: Record<string, string> = {};
      
      for (const userId of userIds) {
        try {
          // First try to get from team_members
          const { data: teamMember } = await supabase
            .from('team_members')
            .select('name')
            .eq('user_id', userId)
            .single();
          
          if (teamMember?.name) {
            names[userId] = teamMember.name;
          } else {
            // Fallback to profiles table
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', userId)
              .single();
            
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

  // Reset form when task changes
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

  // Don't render if task is null or not open
  if (!task || !isOpen) {
    return null;
  }

  const handleSeeProject = () => {
    if (task.project_id) {
      navigate(`/projects/${task.project_id}`);
    }
  };

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

  const handleDeleteTask = async () => {
    if (!task) return;
    const success = await onDeleteTask(task.id);
    if (success) {
      setIsDeleteDialogOpen(false);
      onClose();
    }
  };

  const handleBriefChange = () => {
    // Refresh task data when brief connection changes
    window.location.reload(); // Simple refresh for now
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

  const getActivityDescription = (activity: any) => {
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
    if (confirmed) {
      await deleteActivity(activityId);
    }
  };

  return (
    <TooltipProvider>
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
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                 {isEditing && userRole !== 'team' ? (
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
                   <div className="flex flex-col">
                     <h2 
                       className={`text-lg font-semibold px-2 py-1 rounded ${
                         userRole !== 'team' ? 'cursor-text hover:bg-gray-50' : 'cursor-default'
                       }`}
                       onClick={() => userRole !== 'team' && setIsEditing(true)}
                     >
                       {task.title}
                     </h2>
                     {task.parent_task_id && allTasks.length > 0 && (() => {
                       const parentTask = allTasks.find(t => t.id === task.parent_task_id);
                       return parentTask ? (
                          <p className="text-sm text-muted-foreground ml-2">
                            Main task: <button 
                              onClick={() => navigate('/tasks')} 
                              className="hover:underline cursor-pointer text-left"
                            >
                              {parentTask.title}
                            </button>
                          </p>
                       ) : null;
                     })()}
                   </div>
                 )}
              </div>
              <div className="flex items-center gap-2">
                {!roleLoading && userRole !== 'team' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-background border z-[80]">
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
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* See Project Button */}
            {task.project_id && !roleLoading && userRole !== 'team' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSeeProject}
                className="w-full flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                {project ? `Go to ${project.name}` : 'See Project'}
              </Button>
            )}
          </div>

          {/* Task Details - Scrollable Content */}
          <div className="flex-1 flex flex-col min-h-0">
            <ScrollArea className="flex-1">
              <div className="p-6 space-y-8">
                {/* Task Details Container */}
                <div className="space-y-3">
                {/* Created Time */}
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground w-24">Created time</span>
                  <span className="text-sm">
                    {format(new Date(task.created_at), 'MMMM dd, yyyy')}
                  </span>
                </div>

                {/* Status */}
                <div className="flex items-center gap-3">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground w-24">Status</span>
                  <div>
                    {userRole === 'team' ? (
                      <Badge variant={form.watch('status').toLowerCase().replace(' ', '-') as any}>
                        {form.watch('status')}
                      </Badge>
                    ) : (
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <Select onValueChange={(value) => {
                            field.onChange(value);
                            form.handleSubmit(handleSubmit)();
                          }} value={field.value}>
                             <SelectTrigger className="text-sm w-48 border-none shadow-none px-0 py-0 h-auto hover:bg-transparent focus:ring-0 group [&>svg]:hidden">
                               <div className="flex items-center gap-2">
                                 <Badge variant={field.value.toLowerCase().replace(' ', '-') as any}>
                                   {field.value}
                                 </Badge>
                                 <ChevronDown className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                               </div>
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
                    )}
                  </div>
                </div>

                {/* Priority */}
                <div className="flex items-center gap-3">
                  <Flag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground w-24">Priority</span>
                  <div>
                    {userRole === 'team' ? (
                      <div className="flex items-center gap-2 text-sm px-0 w-48">
                        {getPriorityIcon(form.watch('priority'))}
                        {form.watch('priority')}
                      </div>
                    ) : (
                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <Select onValueChange={(value) => {
                            field.onChange(value);
                            form.handleSubmit(handleSubmit)();
                          }} value={field.value}>
                            <SelectTrigger className="text-sm w-48 border-none shadow-none px-0 py-0 h-auto hover:bg-transparent focus:ring-0 group [&>svg]:hidden">
                              <div className="flex items-center gap-2">
                                {getPriorityIcon(field.value)}
                                <SelectValue />
                                <ChevronDown className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
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
                    )}
                  </div>
                </div>

                {/* Due Date */}
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground w-24">Due date</span>
                  <div>
                    {userRole === 'team' ? (
                      task.due_date ? (
                        <div className="flex items-center text-sm px-0 w-48">
                          {format(task.due_date, 'MMMM dd, yyyy')}
                        </div>
                      ) : (
                        <div className="flex items-center text-sm px-0 w-48 text-muted-foreground">
                          No due date
                        </div>
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
                                className="w-48 justify-between text-left font-normal text-sm border-none shadow-none px-0 py-0 h-auto hover:bg-transparent focus:ring-0 group"
                              >
                                <span>{field.value ? format(field.value, 'MMMM dd, yyyy') : 'Set due date'}</span>
                                <ChevronDown className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
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
                     )}
                   </div>
                 </div>

                {/* Assignees */}
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground w-24">Assignees</span>
                  <div>
                    {userRole === 'team' ? (
                      <div>
                        {task.assignees && task.assignees.length > 0 ? (
                          <div className="flex -space-x-2">
                             {task.assignees.map((assigneeId) => {
                               const member = teamMembers.find(m => m.user_id === assigneeId);
                               if (!member) return null;
                               
                               const initials = member.name
                                 .split(' ')
                                 .map(n => n[0])
                                 .join('')
                                 .toUpperCase()
                                 .slice(0, 2);
                               
                               return (
                                 <Tooltip key={assigneeId}>
                                   <TooltipTrigger asChild>
                                     <Avatar className="h-8 w-8 border-2 border-background cursor-pointer">
                                       <AvatarFallback className="text-xs font-medium">
                                         {initials}
                                       </AvatarFallback>
                                     </Avatar>
                                   </TooltipTrigger>
                                   <TooltipContent>
                                     <p>{member.name}</p>
                                   </TooltipContent>
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
                            {/* Avatar circles for assignees */}
                            <div className="flex -space-x-2">
                              {field.value?.map((assigneeId) => {
                                const member = teamMembers.find(m => m.user_id === assigneeId);
                                if (!member) return null;
                                
                                const initials = member.name
                                  .split(' ')
                                  .map(n => n[0])
                                  .join('')
                                  .toUpperCase()
                                  .slice(0, 2);
                                
                                 return (
                                   <Tooltip key={assigneeId}>
                                     <TooltipTrigger asChild>
                                       <div className="relative group">
                                         <Avatar className="h-8 w-8 border-2 border-background cursor-pointer">
                                           <AvatarFallback className="text-xs font-medium">
                                             {initials}
                                           </AvatarFallback>
                                         </Avatar>
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
                                     <TooltipContent>
                                       <p>{member.name}</p>
                                     </TooltipContent>
                                   </Tooltip>
                                 );
                              })}
                            </div>
                            
                            {/* Add assignee button */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-full">
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="z-[80]">
                                {teamMembers.filter(member => 
                                  !field.value?.includes(member.user_id)
                                ).map(member => (
                                  <DropdownMenuItem
                                    key={member.id}
                                    onClick={() => {
                                      const currentAssignees = field.value || [];
                                      const newAssignees = [...currentAssignees, member.user_id];
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
                  </div>
                </div>

                </div>

                {/* Brief Connection Section - Always show if brief exists, or if user can connect briefs */}
                {(userRole !== 'team' || (task.brief_id && task.brief_type)) && (
                  <BriefSelector
                    taskId={task.id}
                    currentBrief={task.brief_id ? {
                      id: task.brief_id,
                      type: task.brief_type || '',
                    } : null}
                    onBriefChange={handleBriefChange}
                  />
                )}

                {/* Description */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Description</h3>
                  {userRole === 'team' ? (
                    <div className="p-3 bg-muted rounded-md min-h-[100px] text-sm">
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
                              className="resize-none text-sm"
                              onBlur={() => form.handleSubmit(handleSubmit)()}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* Subtasks Section */}
                {!task.parent_task_id && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium">Subtasks ({task.subtasks?.length || 0})</h3>
                      {onAddSubtask && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onAddSubtask(task.id)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Subtask
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2 mb-6">
                      {task.subtasks?.map((subtask) => (
                        <div key={subtask.id} className="border rounded-lg p-3 hover:bg-muted/50 cursor-pointer" onClick={(e) => {
                          e.stopPropagation();
                          // Open subtask details by calling parent's onUpdateTask with the subtask
                          // We'll simulate opening the subtask by setting it as the current task
                          onClose(); // Close current sidebar
                          setTimeout(() => {
                            // Trigger opening the subtask details
                            window.dispatchEvent(new CustomEvent('openTaskDetails', { detail: subtask }));
                          }, 100);
                        }}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${subtask.status === 'Completed' ? 'bg-green-500' : 'bg-gray-400'}`} />
                              <span className="text-sm font-medium">{subtask.title}</span>
                              <Badge variant={subtask.status === 'Completed' ? 'default' : 'secondary'} className="text-xs">
                                {subtask.status}
                              </Badge>
                            </div>
                            {getPriorityIcon(subtask.priority)}
                          </div>
                          {subtask.description && (
                            <p className="text-xs text-muted-foreground mb-2">{subtask.description}</p>
                          )}
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-3">
                              {subtask.assignees.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
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
                        <div className="text-center text-muted-foreground py-4 text-sm">
                          No subtasks yet. Click "Add Subtask" to create one.
                        </div>
                      )}
                    </div>
                    <Separator className="mb-4" />
                  </div>
                )}

                {/* Activity Section */}
                <div>
                  <h3 className="text-sm font-medium mb-4">Activity</h3>
                  <div className="space-y-3 mb-6">
                    {activitiesLoading ? (
                      <div className="text-center text-muted-foreground py-8">Loading activities...</div>
                    ) : activities.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">No activities yet</div>
                    ) : (
                       activities.map((activity) => {
                         const isOwnComment = currentUserId === activity.user_id && activity.activity_type === 'comment';
                         const isEditing = editingActivityId === activity.id;
                         
                         return (
                           <div key={activity.id} className="flex gap-3 p-3 border rounded-lg">
                             <Avatar className="h-8 w-8">
                               <AvatarFallback className="text-xs">
                                 {userNames[activity.user_id]?.charAt(0)?.toUpperCase() || 'U'}
                               </AvatarFallback>
                             </Avatar>
                             
                             <div className="flex-1 space-y-2 min-w-0 overflow-hidden">
                               <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-2">
                                   <div className="flex items-center gap-1 text-sm">
                                     {getActivityIcon(activity.activity_type)}
                                     <span className="font-medium">{userNames[activity.user_id] || 'User'}</span>
                                   </div>
                                   <span className="text-xs text-muted-foreground">
                                     {format(new Date(activity.created_at), 'MMM dd, yyyy HH:mm')}
                                   </span>
                                 </div>
                                 
                                 {/* Edit/Delete dropdown for own comments */}
                                 {isOwnComment && (
                                   <DropdownMenu>
                                     <DropdownMenuTrigger asChild>
                                       <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                         <MoreHorizontal className="h-3 w-3" />
                                       </Button>
                                     </DropdownMenuTrigger>
                                     <DropdownMenuContent align="end" className="bg-background border z-[80]">
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
                               
                               {/* Activity content - either editable or display */}
                               {isEditing ? (
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
                                      placeholder="Edit your comment... (Press Ctrl+Enter to save)"
                                    />
                                    <div className="text-xs text-muted-foreground">Press Enter for line breaks, Ctrl+Enter to save</div>
                                   <div className="flex gap-2">
                                     <Button 
                                       size="sm" 
                                       onClick={() => handleEditSave(activity.id)}
                                       className="h-6 text-xs"
                                     >
                                       <CheckCircle className="h-3 w-3 mr-1" />
                                       Save
                                     </Button>
                                     <Button 
                                       variant="outline" 
                                       size="sm" 
                                       onClick={handleEditCancel}
                                       className="h-6 text-xs"
                                     >
                                       Cancel
                                     </Button>
                                   </div>
                                 </div>
                               ) : (
                                  <div className="text-sm whitespace-pre-wrap break-words">
                                    {activity.activity_type === 'comment' ? activity.content : getActivityDescription(activity)}
                                  </div>
                               )}
                               
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
              </div>
            </ScrollArea>

            {/* Fixed Comment Input at Bottom */}
            <div className="border-t bg-background p-6">
              <TaskActivityFeed
                task={task}
                activities={[]}
                onAddActivity={addActivity}
                onUploadAttachment={onUploadAttachment}
                onUpdateActivity={updateActivity}
                onDeleteActivity={deleteActivity}
                currentUserId={currentUserId}
                isLoading={activitiesLoading}
                showActivities={false}
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
