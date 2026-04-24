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
import { Calendar as CalendarIcon, Check, ChevronsUpDown, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { TaskPriority, TaskType, TaskStatus, TASK_STATUS_OPTIONS, TASK_STATUSES } from '@/types/task';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { BriefSelector } from './BriefSelector';

const subtaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['Low', 'Normal', 'High', 'Urgent']),
  task_type: z.enum(['Primary', 'Secondary', 'Tertiary']),
  status: z.enum(TASK_STATUSES),
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
  const [assigneeSearch, setAssigneeSearch] = useState('');
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
    }
  }, [isOpen, teamMembers.length]);

  useEffect(() => {
    if (!isOpen) return;

    const assignees = initialData?.assignees || [];
    setSelectedAssignees(assignees);
    setAssigneeSearch('');
    form.reset({
      title: initialData?.title || '',
      description: initialData?.description || '',
      priority: initialData?.priority || 'Normal',
      task_type: initialData?.task_type || 'Primary',
      status: initialData?.status || 'Planning',
      assignees,
      due_date: initialData?.due_date,
    });
  }, [isOpen, initialData]);

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
    setAssigneeSearch('');
    setAssigneesOpen(false);
    onClose();
  };

  const toggleAssignee = (memberId: string) => {
    setSelectedAssignees((currentAssignees) => {
      const newAssignees = currentAssignees.includes(memberId) 
        ? currentAssignees.filter(id => id !== memberId)
        : [...currentAssignees, memberId];
      
      form.setValue('assignees', newAssignees, { shouldDirty: true });
      return newAssignees;
    });
  };

  const getSelectedAssigneeNames = () => {
    return selectedAssignees
      .map(id => teamMembers.find(member => member.user_id === id || member.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  const filteredTeamMembers = teamMembers.filter((member) => {
    const query = assigneeSearch.trim().toLowerCase();
    if (!query) return true;

    return `${member.name} ${member.position}`.toLowerCase().includes(query);
  });

  return (
    <>
      <style>{`
        [data-radix-dialog-overlay] {
          z-index: 80 !important;
        }
      `}</style>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto z-[120]">
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
                        <SelectContent className="z-[130]">
                          {TASK_STATUS_OPTIONS.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
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
                        <SelectContent className="z-[130]">
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
                        <SelectContent className="z-[130]">
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
                    <PopoverContent className="w-auto p-0 z-[130]" align="start">
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

                <div className="relative space-y-2">
                  <FormLabel>Assignees</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={assigneesOpen}
                    className="w-full justify-between"
                    onClick={() => {
                      setAssigneesOpen((open) => !open);
                      setAssigneeSearch('');
                    }}
                  >
                    {selectedAssignees.length > 0 ? (
                      <span className="truncate">
                        {selectedAssignees.length === 1 
                          ? getSelectedAssigneeNames()
                          : `${selectedAssignees.length} assignees selected`
                        }
                      </span>
                    ) : (
                      "Select assignees..."
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>

                  {assigneesOpen && (
                    <div className="absolute left-0 right-0 top-full z-[160] mt-2 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg">
                      <div className="flex items-center border-b px-3">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <input
                          value={assigneeSearch}
                          onChange={(event) => setAssigneeSearch(event.target.value)}
                          placeholder="Search team members..."
                          className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                          autoFocus
                        />
                      </div>
                      <div className="max-h-72 overflow-y-auto p-1">
                        {filteredTeamMembers.length === 0 ? (
                          <div className="px-3 py-2 text-sm text-muted-foreground">
                            No team members found.
                          </div>
                        ) : (
                          filteredTeamMembers.map((member) => {
                            const assigneeId = member.user_id || member.id;
                            const isSelected = selectedAssignees.includes(assigneeId);

                            return (
                              <button
                                key={member.id}
                                type="button"
                                onClick={() => toggleAssignee(assigneeId)}
                                className="flex w-full cursor-pointer items-center rounded-sm px-2 py-2 text-left text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    isSelected ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span>{member.name}</span>
                                  <span className="text-xs text-muted-foreground">{member.position}</span>
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                      <div className="border-t px-3 py-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-full justify-center text-xs"
                          onClick={() => setAssigneesOpen(false)}
                        >
                          {selectedAssignees.length > 1 ? "Done selecting assignees" : "Done selecting"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedAssignees.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedAssignees.map((assigneeId) => {
                    const member = teamMembers.find(m => m.user_id === assigneeId || m.id === assigneeId);
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
    </>
  );
};
