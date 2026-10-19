import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import type { TaskWithRelations } from '@/types/task';
import { TaskDetailSidebar } from './TaskDetailSidebar';

const stableMocks = vi.hoisted(() => ({
  fetchTeamMembers: vi.fn(),
  addActivity: vi.fn(),
  updateActivity: vi.fn(),
  deleteActivity: vi.fn(),
  toast: vi.fn(),
}));

vi.mock('@/hooks/useTeamMembers', () => ({
  useTeamMembers: () => ({ teamMembers: [], fetchTeamMembers: stableMocks.fetchTeamMembers }),
}));
vi.mock('@/hooks/useTaskProject', () => ({ useTaskProject: () => ({ project: null }) }));
vi.mock('@/hooks/useTaskActivities', () => ({
  useTaskActivities: () => ({
    activities: [],
    isLoading: false,
    addActivity: stableMocks.addActivity,
    updateActivity: stableMocks.updateActivity,
    deleteActivity: stableMocks.deleteActivity,
  }),
}));
vi.mock('@/hooks/useUserRole', () => ({
  useUserRole: () => ({ userRole: 'owner', isLoading: false }),
}));
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: stableMocks.toast }),
}));
vi.mock('@/components/project-details/ProjectFilesSection', () => ({ default: () => null }));
vi.mock('./BriefSelector', () => ({ BriefSelector: () => null }));
vi.mock('@/integrations/appwrite/client', () => ({
  account: { get: vi.fn().mockResolvedValue({ $id: 'owner-1' }) },
  databases: { listDocuments: vi.fn().mockResolvedValue({ documents: [] }) },
  DATABASE_ID: 'database',
  Query: { equal: vi.fn() },
  storage: { getFileView: vi.fn() },
}));

const now = new Date('2026-10-19T00:00:00.000Z');
const task: TaskWithRelations = {
  id: 'task-1',
  project_id: 'project-1',
  user_id: 'owner-1',
  title: 'Homepage exploration',
  status: 'Planning',
  priority: 'Normal',
  task_type: 'Primary',
  assignees: [],
  created_at: now,
  updated_at: now,
  comments: [],
  attachments: [],
  subtasks: [],
  activities: [],
};

describe('TaskDetailSidebar duplicate action', () => {
  it('calls the duplicate callback from More actions', async () => {
    const user = userEvent.setup();
    const onDuplicateTask = vi.fn();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <TaskDetailSidebar
            task={task}
            isOpen
            onClose={vi.fn()}
            onUpdateTask={vi.fn().mockResolvedValue(true)}
            onDeleteTask={vi.fn().mockResolvedValue(true)}
            onAddComment={vi.fn().mockResolvedValue(true)}
            onUploadAttachment={vi.fn().mockResolvedValue(true)}
            onDeleteAttachment={vi.fn().mockResolvedValue(true)}
            onDuplicateTask={onDuplicateTask}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'More actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'Duplicate' }));

    expect(onDuplicateTask).toHaveBeenCalledOnce();
    expect(onDuplicateTask).toHaveBeenCalledWith(task);
  });
});
