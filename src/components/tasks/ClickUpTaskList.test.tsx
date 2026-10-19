import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { TaskWithRelations } from '@/types/task';
import { ClickUpTaskList } from './ClickUpTaskList';

vi.mock('@/hooks/useTeamMembers', () => ({
  useTeamMembers: () => ({ teamMembers: [] }),
}));

const now = new Date('2026-10-19T00:00:00.000Z');
const child: TaskWithRelations = {
  id: 'child-1',
  project_id: 'project-1',
  user_id: 'owner-1',
  parent_task_id: 'parent-1',
  title: 'Child task',
  status: 'Planning',
  priority: 'Normal',
  task_type: 'Primary',
  assignees: [],
  created_at: now,
  updated_at: now,
};
const parent: TaskWithRelations = {
  id: 'parent-1',
  project_id: 'project-1',
  user_id: 'owner-1',
  title: 'Parent task',
  status: 'Planning',
  priority: 'Normal',
  task_type: 'Primary',
  assignees: [],
  created_at: now,
  updated_at: now,
  subtasks: [child],
};

describe('ClickUpTaskList quick-create subtask action', () => {
  it('shows the action only on parent rows and opens the correct parent without selecting the row', async () => {
    const user = userEvent.setup();
    const onTaskClick = vi.fn();
    const onAddSubtask = vi.fn();

    render(
      <ClickUpTaskList
        tasks={[parent]}
        isLoading={false}
        onTaskClick={onTaskClick}
        onUpdateTask={vi.fn().mockResolvedValue(true)}
        onAddTask={vi.fn()}
        onAddSubtask={onAddSubtask}
      />,
    );

    const quickCreate = screen.getByRole('button', { name: 'Create subtask for Parent task' });
    expect(screen.queryByRole('button', { name: 'Create subtask for Child task' })).not.toBeInTheDocument();
    expect(quickCreate).toHaveClass('group-hover:opacity-100');
    expect(quickCreate).toHaveClass('group-focus-within:opacity-100');
    expect(quickCreate).not.toHaveClass('sm:opacity-0');
    expect(quickCreate).toHaveClass('[@media(hover:hover)]:opacity-0');

    await user.click(quickCreate);

    expect(onAddSubtask).toHaveBeenCalledOnce();
    expect(onAddSubtask).toHaveBeenCalledWith('parent-1');
    expect(onTaskClick).not.toHaveBeenCalled();
  });
});

describe('ClickUpTaskList stage subtask controls', () => {
  it('collapses and expands every subtask in one stage without collapsing the whole stage', async () => {
    const user = userEvent.setup();
    const progressChild: TaskWithRelations = {
      ...child,
      id: 'progress-child',
      parent_task_id: 'progress-parent',
      title: 'Progress child',
      status: 'In progress',
    };
    const progressParent: TaskWithRelations = {
      ...parent,
      id: 'progress-parent',
      title: 'Progress parent',
      status: 'In progress',
      subtasks: [progressChild],
    };

    render(
      <ClickUpTaskList
        tasks={[parent, progressParent]}
        isLoading={false}
        onTaskClick={vi.fn()}
        onUpdateTask={vi.fn().mockResolvedValue(true)}
        onAddTask={vi.fn()}
        onAddSubtask={vi.fn()}
      />,
    );

    const collapseSubtasks = screen.getByRole('button', { name: 'Collapse subtasks in Planning' });
    const addTask = screen.getAllByRole('button', { name: 'Add Task' })[0];

    expect(collapseSubtasks.className).toBe(addTask.className);
    expect(collapseSubtasks.querySelector('svg')).not.toBeNull();
    expect(collapseSubtasks).not.toHaveClass('border');

    await user.click(collapseSubtasks);

    expect(screen.getByText('Parent task')).toBeInTheDocument();
    expect(screen.queryByText('Child task')).not.toBeInTheDocument();
    expect(screen.getByText('Progress child')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Expand subtasks in Planning' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Expand subtasks in Planning' }));
    expect(screen.getByText('Child task')).toBeInTheDocument();
  });
});
