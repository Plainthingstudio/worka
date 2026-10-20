import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Project } from '@/types';
import { useProjectToTask } from './useProjectToTask';

const mocks = vi.hoisted(() => ({
  createDocument: vi.fn(),
  logTaskCreated: vi.fn(),
  notifyTaskCreated: vi.fn(),
}));

vi.mock('@/integrations/appwrite/client', () => ({
  account: { get: vi.fn().mockResolvedValue({ $id: 'user-1' }) },
  databases: {
    createDocument: mocks.createDocument,
    listDocuments: vi.fn().mockResolvedValue({ documents: [] }),
  },
  DATABASE_ID: 'database',
  ID: { unique: vi.fn(() => 'generated-id') },
  Query: { equal: vi.fn(() => 'equal') },
}));

vi.mock('@/utils/activityLogger', () => ({ logTaskCreated: mocks.logTaskCreated }));
vi.mock('@/services/notificationService', () => ({ notifyTaskCreated: mocks.notifyTaskCreated }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const project: Project = {
  id: 'project-1',
  name: 'Worka Website Revamp',
  clientId: 'client-1',
  status: 'Planning',
  deadline: new Date('2026-11-01T00:00:00.000Z'),
  fee: 1000,
  currency: 'USD',
  projectType: 'Project Based',
  payments: [],
  teamMembers: [],
  createdAt: new Date('2026-10-01T00:00:00.000Z'),
};

describe('useProjectToTask activity logging', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createDocument.mockResolvedValue({
      $id: 'task-1',
      title: 'Worka Website Revamp',
      project_id: 'project-1',
      user_id: 'user-1',
      assignees: [],
    });
  });

  it('logs task creation when a project is converted into a task', async () => {
    const { result } = renderHook(() => useProjectToTask());

    await act(async () => {
      await result.current.createTaskFromProject(project, { assignees: [] });
    });

    expect(mocks.logTaskCreated).toHaveBeenCalledWith('task-1');
    expect(mocks.notifyTaskCreated).toHaveBeenCalledOnce();
  });
});
