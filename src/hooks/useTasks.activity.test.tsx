import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTasks } from './useTasks';

const mocks = vi.hoisted(() => ({
  createDocument: vi.fn(),
  listDocuments: vi.fn(),
  logTaskCreated: vi.fn(),
  notifyTaskCreated: vi.fn(),
}));

vi.mock('@/integrations/appwrite/client', () => ({
  account: { get: vi.fn().mockResolvedValue({ $id: 'user-1' }) },
  client: { subscribe: vi.fn(() => vi.fn()) },
  databases: {
    createDocument: mocks.createDocument,
    listDocuments: mocks.listDocuments,
    updateDocument: vi.fn(),
    deleteDocument: vi.fn(),
  },
  storage: {},
  DATABASE_ID: 'database',
  ID: { unique: vi.fn(() => 'generated-id') },
  Query: {
    equal: vi.fn(() => 'equal'),
    orderDesc: vi.fn(() => 'order-desc'),
  },
}));

vi.mock('@/utils/activityLogger', () => ({
  logStatusChange: vi.fn(),
  logAssigneeChange: vi.fn(),
  logPriorityChange: vi.fn(),
  logDueDateChange: vi.fn(),
  logTaskCreated: mocks.logTaskCreated,
  logComment: vi.fn(),
}));

vi.mock('@/services/notificationService', () => ({
  getCurrentUserId: vi.fn(),
  notifyTaskAssigneeChanges: vi.fn(),
  notifyTaskCreated: mocks.notifyTaskCreated,
  notifyTaskFollowers: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({ toast: vi.fn() }));

describe('useTasks activity logging', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listDocuments.mockResolvedValue({ documents: [] });
    mocks.createDocument.mockResolvedValue({
      $id: 'subtask-1',
      title: 'Mobile responsive',
      parent_task_id: 'task-1',
      project_id: 'project-1',
      user_id: 'user-1',
      assignees: [],
    });
  });

  it('logs a task-created activity after a subtask is saved', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useTasks('project-1'), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(async () => {
      await result.current.createSubtask({
        title: 'Mobile responsive',
        parent_task_id: 'task-1',
        priority: 'Normal',
        task_type: 'Secondary',
      });
    });

    expect(mocks.logTaskCreated).toHaveBeenCalledWith('subtask-1');
    expect(mocks.notifyTaskCreated).toHaveBeenCalledOnce();
  });
});
