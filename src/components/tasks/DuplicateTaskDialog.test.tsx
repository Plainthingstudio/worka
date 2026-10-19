import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { TaskWithRelations } from '@/types/task';
import { DuplicateTaskDialog } from './DuplicateTaskDialog';

const now = new Date('2026-10-19T00:00:00.000Z');

const makeTask = (overrides: Partial<TaskWithRelations> = {}): TaskWithRelations => ({
  id: 'task-1',
  project_id: 'project-1',
  user_id: 'owner-1',
  title: 'Homepage exploration',
  description: 'Explore two visual directions',
  status: 'In progress',
  priority: 'High',
  task_type: 'Secondary',
  assignees: ['member-a'],
  due_date: new Date('2026-10-24T00:00:00.000Z'),
  created_at: now,
  updated_at: now,
  attachments: [],
  subtasks: [],
  ...overrides,
});

describe('DuplicateTaskDialog', () => {
  it('defaults every relevant parent-task copy option to checked', () => {
    render(
      <DuplicateTaskDialog
        task={makeTask({ subtasks: [makeTask({ id: 'sub-1', parent_task_id: 'task-1' })] })}
        open
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        isDuplicating={false}
      />,
    );

    expect(screen.getByDisplayValue('Homepage exploration (Copy)')).toBeDisabled();
    expect(screen.getByText(/comments are never copied/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Description' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Assignees' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Due date' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Task type' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Attachments' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'All subtasks' })).toBeChecked();
  });

  it('does not offer All subtasks when duplicating a subtask directly', () => {
    render(
      <DuplicateTaskDialog
        task={makeTask({ parent_task_id: 'parent-1' })}
        open
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        isDuplicating={false}
      />,
    );

    expect(screen.queryByRole('checkbox', { name: 'All subtasks' })).not.toBeInTheDocument();
  });

  it('submits the selected options only once while confirmation is pending', async () => {
    const user = userEvent.setup();
    let resolveConfirmation: (() => void) | undefined;
    const onConfirm = vi.fn(() => new Promise<void>((resolve) => {
      resolveConfirmation = resolve;
    }));

    render(
      <DuplicateTaskDialog
        task={makeTask()}
        open
        onOpenChange={vi.fn()}
        onConfirm={onConfirm}
        isDuplicating={false}
      />,
    );

    const duplicateButton = screen.getByRole('button', { name: 'Duplicate task' });
    await user.dblClick(duplicateButton);

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledWith({
      description: true,
      assignees: true,
      dueDate: true,
      taskType: true,
      attachments: true,
      subtasks: true,
    });

    await act(async () => {
      resolveConfirmation?.();
    });
  });

  it('disables confirmation while duplication is running', () => {
    render(
      <DuplicateTaskDialog
        task={makeTask()}
        open
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        isDuplicating
      />,
    );

    expect(screen.getByRole('button', { name: 'Duplicating…' })).toBeDisabled();
  });
});
