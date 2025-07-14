
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
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
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { TaskPriority, TaskType, TaskStatus } from '@/types/task';
import { Project, ProjectStatus } from '@/types';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { cn } from '@/lib/utils';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['Low', 'Normal', 'High', 'Urgent']),
  task_type: z.enum(['Primary', 'Secondary', 'Tertiary']),
  status: z.enum(['Planning', 'In progress', 'Completed', 'Paused', 'Cancelled']),
  due_date: z.date().optional(),
  assignees: z.array(z.string()).optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface CreateTaskFromProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => void;
  project: Project;
}

const mapProjectStatusToTaskStatus = (projectStatus: ProjectStatus): TaskStatus => {
  switch (projectStatus) {
    case "Planning":
      return "Planning";
    case "In progress":
      return "In progress";
    case "Completed":
    case "Paused":
    case "Cancelled":
    default:
      return "Planning";
  }
};

export const CreateTaskFromProjectDialog = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  project 
}: CreateTaskFromProjectDialogProps) => {
  const { teamMembers, fetchTeamMembers } = useTeamMembers();

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: project.name,
      description: `Task created from project: ${project.name}`,
      priority: 'Normal',
      task_type: 'Primary',
      status: mapProjectStatusToTaskStatus(project.status),
      due_date: project.deadline,
      assignees: [],
    },
  });

  useEffect(() => {
    if (isOpen) {
      fetchTeamMembers().then((members) => {
        // Pre-select project team members if available
        if (project.teamMembers && project.teamMembers.length > 0) {
          const projectAssignees = members
            .filter(member => project.teamMembers?.includes(member.id))
            .map(member => member.user_id);
          form.setValue('assignees', projectAssignees);
        }
      });
    }
  }, [isOpen, fetchTeamMembers, project.teamMembers, form]);

  const handleSubmit = (data: TaskFormData) => {
    onSubmit(data);
    form.reset();
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Task from Project</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter task title" {...field} />
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
                    <Textarea 
                      placeholder="Enter task description"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
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
                          <SelectValue placeholder="Select task type" />
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

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Planning">Planning</SelectItem>
                      <SelectItem value="In progress">In progress</SelectItem>
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
              name="due_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assignees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignees</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      const currentAssignees = field.value || [];
                      if (!currentAssignees.includes(value)) {
                        field.onChange([...currentAssignees, value]);
                      }
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignees" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.user_id}>
                          {member.name} ({member.position})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {field.value && field.value.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {field.value.map((assigneeId) => {
                        const member = teamMembers.find(m => m.user_id === assigneeId);
                        return member ? (
                          <span
                            key={assigneeId}
                            className="bg-primary/10 text-primary px-2 py-1 rounded text-sm flex items-center gap-1"
                          >
                            {member.name}
                            <button
                              type="button"
                              onClick={() => {
                                field.onChange(field.value?.filter(id => id !== assigneeId));
                              }}
                              className="ml-1 hover:text-destructive"
                            >
                              ×
                            </button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit">
                Create Task
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
