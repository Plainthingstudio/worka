import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Check, ChevronsUpDown } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { TaskPriority, TaskType, TaskStatus } from '@/types/task';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { BriefSelector } from './BriefSelector';

const subtaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['Low', 'Normal', 'High', 'Urgent']),
  task_type: z.enum(['Primary', 'Secondary', 'Tertiary']),
  status: z.enum(['Planning', 'In progress', 'Paused', 'Completed', 'Cancelled']),
  assignees: z.array(z.string()).optional(),
  due_date: z.date().optional(),
});

type SubtaskFormData = z.infer<typeof subtaskSchema>;

interface SubtaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SubtaskFormData & { parent_task_id: string }) => Promise<void>;
  parentTaskId: string;
  title?: string;
  initialData?: Partial<SubtaskFormData>;
}

export const SubtaskDialog = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  parentTaskId, 
  title = "Create Subtask",
  initialData 
}: SubtaskDialogProps) => {
  const [dateOpen, setDateOpen] = useState(false);
  const [assigneesOpen, setAssigneesOpen] = useState(false);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const { teamMembers, fetchTeamMembers } = useTeamMembers();

  const form = useForm<SubtaskFormData>({
    resolver: zodResolver(subtaskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'Normal',
      task_type: 'Primary',
      status: 'Planning',
      assignees: [],
      due_date: undefined,
      ...initialData,
    },
  });

  useEffect(() => {
    if (isOpen) {
      // Only fetch team members if we don't have them already
      if (teamMembers.length === 0) {
        fetchTeamMembers();
      }
      const assignees = initialData?.assignees || [];
      setSelectedAssignees(assignees);
      form.setValue('assignees', assignees);
    }
  }, [isOpen, initialData, form, teamMembers.length, fetchTeamMembers]);

  const handleSubmit = async (data: SubtaskFormData) => {
    try {
      await onSubmit({
        ...data,
        parent_task_id: parentTaskId,
        assignees: selectedAssignees,
      });
      form.reset();
      setSelectedAssignees([]);
      onClose();
    } catch (error) {
      console.error('Error creating subtask:', error);
    }
  };

  const handleClose = () => {
    form.reset();
    setSelectedAssignees([]);
    onClose();
  };

  const toggleAssignee = (memberId: string) => {
    const newAssignees = selectedAssignees.includes(memberId) 
      ? selectedAssignees.filter(id => id !== memberId)
      : [...selectedAssignees, memberId];
    
    setSelectedAssignees(newAssignees);
    form.setValue('assignees', newAssignees);
  };

  const getSelectedAssigneeNames = () => {
    return selectedAssignees
      .map(id => teamMembers.find(member => member.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto z-[80]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter subtask title..." {...field} />
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
                      placeholder="Enter subtask description..." 
                      rows={3} 
                      {...field} 
                    />
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
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="z-[210]">
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
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="z-[210]">
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
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="z-[210]">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <FormLabel>Due Date</FormLabel>
                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !form.watch('due_date') && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.watch('due_date') ? (
                        format(form.watch('due_date')!, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[210]" align="start">
                    <Calendar
                      mode="single"
                      selected={form.watch('due_date')}
                      onSelect={(date) => {
                        form.setValue('due_date', date);
                        setDateOpen(false);
                      }}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <FormLabel>Assignees</FormLabel>
                <Popover open={assigneesOpen} onOpenChange={setAssigneesOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={assigneesOpen}
                      className="w-full justify-between"
                    >
                      {selectedAssignees.length > 0 ? (
                        <span className="truncate">
                          {selectedAssignees.length === 1 
                            ? getSelectedAssigneeNames()
                            : `${selectedAssignees.length} selected`
                          }
                        </span>
                      ) : (
                        "Select assignees..."
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 z-[210]">
                    <Command>
                      <CommandInput placeholder="Search team members..." />
                      <CommandEmpty>No team member found.</CommandEmpty>
                      <CommandList>
                        <CommandGroup>
                          {teamMembers.map((member) => (
                            <CommandItem
                              key={member.id}
                              onSelect={() => toggleAssignee(member.id)}
                              className="cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedAssignees.includes(member.id) ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span>{member.name}</span>
                                <span className="text-xs text-muted-foreground">{member.position}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {selectedAssignees.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedAssignees.map((assigneeId) => {
                  const member = teamMembers.find(m => m.id === assigneeId);
                  return member ? (
                    <Badge 
                      key={assigneeId} 
                      variant="secondary" 
                      className="text-xs"
                    >
                      {member.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit">
                Create Subtask
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};