import React from 'react';
import { Copy } from 'lucide-react';
import type { TaskWithRelations } from '@/types/task';
import type { DuplicateTaskOptions } from '@/services/taskDuplicationService';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface DuplicateTaskDialogProps {
  task: TaskWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (options: DuplicateTaskOptions) => void | Promise<void>;
  isDuplicating: boolean;
}

const defaultOptions: DuplicateTaskOptions = {
  description: true,
  assignees: true,
  dueDate: true,
  taskType: true,
  attachments: true,
  subtasks: true,
};

const copyChoices: Array<{
  key: Exclude<keyof DuplicateTaskOptions, 'subtasks'>;
  label: string;
}> = [
  { key: 'description', label: 'Description' },
  { key: 'assignees', label: 'Assignees' },
  { key: 'dueDate', label: 'Due date' },
  { key: 'taskType', label: 'Task type' },
  { key: 'attachments', label: 'Attachments' },
];

export const DuplicateTaskDialog = ({
  task,
  open,
  onOpenChange,
  onConfirm,
  isDuplicating,
}: DuplicateTaskDialogProps) => {
  const [options, setOptions] = React.useState<DuplicateTaskOptions>(defaultOptions);
  const [submissionPending, setSubmissionPending] = React.useState(false);
  const submissionGuard = React.useRef(false);

  React.useEffect(() => {
    if (open) {
      setOptions(defaultOptions);
      setSubmissionPending(false);
      submissionGuard.current = false;
    }
  }, [open, task?.id]);

  if (!task) return null;

  const setChoice = (key: keyof DuplicateTaskOptions, checked: boolean) => {
    setOptions((current) => ({ ...current, [key]: checked }));
  };

  const handleConfirm = async () => {
    if (submissionGuard.current || isDuplicating) return;
    submissionGuard.current = true;
    setSubmissionPending(true);

    try {
      await onConfirm(options);
    } finally {
      submissionGuard.current = false;
      setSubmissionPending(false);
    }
  };

  const pending = isDuplicating || submissionPending;
  const canCopySubtasks = !task.parent_task_id && Boolean(task.subtasks?.length);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-4 w-4" />
            Duplicate task
          </DialogTitle>
          <DialogDescription>
            Choose what to include in the new task. Comments are never copied.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Input value={`${task.title} (Copy)`} disabled aria-label="Copied task title" />

          <div className="grid gap-3 sm:grid-cols-2">
            {copyChoices.map(({ key, label }) => (
              <label key={key} className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={options[key]}
                  onCheckedChange={(checked) => setChoice(key, checked === true)}
                />
                <span>{label}</span>
              </label>
            ))}

            {canCopySubtasks && (
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={options.subtasks}
                  onCheckedChange={(checked) => setChoice('subtasks', checked === true)}
                />
                <span>All subtasks</span>
              </label>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            The copy starts in Planning with Normal priority. Comments and activity history stay on the original task.
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={pending}>
            {pending ? 'Duplicating…' : 'Duplicate task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
