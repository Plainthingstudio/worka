import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { TaskStatus, TASK_STATUS_OPTIONS, TASK_STATUSES } from '@/types/task';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { PriorityIndicator } from './PriorityIndicator';
import TeamMemberMultiSelect from '@/components/team/TeamMemberMultiSelect';
import { UserAvatar } from '@/components/ui/avatar';
import { mergeAssigneeIds } from './subtaskAssignees';

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
  parentAssignees?: string[];
  title?: string;
  initialData?: Partial<SubtaskFormData>;
}

export const SubtaskDialog = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  parentTaskId, 
  parentAssignees = [],
  title = "Create Subtask",
  initialData 
}: SubtaskDialogProps) => {
  const [dateOpen, setDateOpen] = useState(false);
  const { teamMembers, fetchTeamMembers } = useTeamMembers();
  const uniqueParentAssignees = Array.from(new Set(parentAssignees));

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
  }, [fetchTeamMembers, isOpen, teamMembers.length]);

  useEffect(() => {
    if (!isOpen) return;

    const assignees = initialData?.assignees || [];
    form.reset({
      title: initialData?.title || '',
      description: initialData?.description || '',
      priority: initialData?.priority || 'Normal',
      task_type: initialData?.task_type || 'Primary',
      status: initialData?.status || 'Planning',
      assignees,
      due_date: initialData?.due_date,
    });
  }, [form, isOpen, initialData]);

  const handleSubmit = async (data: SubtaskFormData) => {
    try {
      await onSubmit({
        ...data,
        parent_task_id: parentTaskId,
      });
      form.reset();
      onClose();
    } catch (error) {
      console.error('Error creating subtask:', error);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

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
            <DialogDescription>
              Add a subtask and choose who should work on it.
            </DialogDescription>
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
                        rows={6}
                        className="min-h-[160px] resize-y leading-6"
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <PriorityIndicator priority={field.value} size="sm" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="z-[130]">
                          <SelectItem value="Low"><PriorityIndicator priority="Low" size="sm" /></SelectItem>
                          <SelectItem value="Normal"><PriorityIndicator priority="Normal" size="sm" /></SelectItem>
                          <SelectItem value="High"><PriorityIndicator priority="High" size="sm" /></SelectItem>
                          <SelectItem value="Urgent"><PriorityIndicator priority="Urgent" size="sm" /></SelectItem>
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

                <FormField
                  control={form.control}
                  name="assignees"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between gap-2">
                        <FormLabel>Assignees</FormLabel>
                        {uniqueParentAssignees.length > 0 && (() => {
                          const selectedIds = field.value || [];
                          const allParentMembersAdded = uniqueParentAssignees.every((id) => selectedIds.includes(id));
                          const parentMembers = uniqueParentAssignees
                            .map((id) => teamMembers.find((member) => member.user_id === id || member.id === id))
                            .filter((member): member is typeof teamMembers[number] => Boolean(member));

                          return (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 gap-2 px-2 text-xs text-primary"
                              onClick={() => {
                                form.setValue(
                                  'assignees',
                                  mergeAssigneeIds(selectedIds, uniqueParentAssignees),
                                  { shouldDirty: true, shouldValidate: true },
                                );
                              }}
                              aria-label={allParentMembersAdded ? 'Parent team added' : `Use parent team · ${uniqueParentAssignees.length}`}
                            >
                              {parentMembers.length > 0 && (
                                <span className="flex items-center" aria-hidden="true">
                                  {parentMembers.slice(0, 3).map((member, index) => (
                                    <span key={member.id} style={{ marginLeft: index === 0 ? 0 : -5 }}>
                                      <UserAvatar name={member.name} avatarUrl={member.avatarUrl} size={20} />
                                    </span>
                                  ))}
                                </span>
                              )}
                              <span>{allParentMembersAdded ? 'Parent team added' : `Use parent team · ${uniqueParentAssignees.length}`}</span>
                            </Button>
                          );
                        })()}
                      </div>
                      <TeamMemberMultiSelect
                        teamMembers={teamMembers}
                        selectedIds={field.value || []}
                        onChange={field.onChange}
                        getMemberValue={(member) => member.user_id}
                        placeholder="Select assignees"
                        emptySelectionText="No assignees assigned yet. Select members from the dropdown above."
                        popoverPortalled
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
