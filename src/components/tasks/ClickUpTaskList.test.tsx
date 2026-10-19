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

    await user.click(quickCreate);

    expect(onAddSubtask).toHaveBeenCalledOnce();
    expect(onAddSubtask).toHaveBeenCalledWith('parent-1');
    expect(onTaskClick).not.toHaveBeenCalled();
  });
});
