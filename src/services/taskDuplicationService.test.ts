import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TaskWithRelations } from '@/types/task';
import {
  duplicateTaskTree,
  type DuplicateTaskOptions,
} from './taskDuplicationService';

const appwrite = vi.hoisted(() => ({
  createDocument: vi.fn(),
  createFile: vi.fn(),
  getFileView: vi.fn(),
  unique: vi.fn(),
}));

vi.mock('@/integrations/appwrite/client', () => ({
  DATABASE_ID: 'database',
  databases: { createDocument: appwrite.createDocument },
  storage: {
    createFile: appwrite.createFile,
    getFileView: appwrite.getFileView,
  },
  ID: { unique: appwrite.unique },
}));

const now = new Date('2026-10-19T00:00:00.000Z');

const makeTask = (overrides: Partial<TaskWithRelations> = {}): TaskWithRelations => ({
  id: 'task-1',
  project_id: 'project-1',
  user_id: 'owner-1',
  title: 'Homepage exploration',
  description: 'Explore two visual directions',
  status: 'Completed',
  due_date: new Date('2026-10-24T00:00:00.000Z'),
  priority: 'Urgent',
  task_type: 'Secondary',
  assignees: ['member-a', 'member-b'],
  completed_at: new Date('2026-10-18T00:00:00.000Z'),
  created_at: now,
  updated_at: now,
  comments: [{
    id: 'comment-1',
    task_id: 'task-1',
    user_id: 'owner-1',
    content: 'Do not copy me',
    created_at: now,
    updated_at: now,
  }],
  activities: [{
    id: 'activity-1',
    task_id: 'task-1',
    user_id: 'owner-1',
    activity_type: 'task_created',
    metadata: {},
    attachments: [],
    created_at: now,
  }],
  attachments: [],
  subtasks: [],
  ...overrides,
});

const allOptions: DuplicateTaskOptions = {
  description: true,
  assignees: true,
  dueDate: true,
  taskType: true,
  attachments: true,
  subtasks: true,
};

describe('duplicateTaskTree', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    let id = 0;
    appwrite.unique.mockImplementation(() => `generated-${++id}`);
    appwrite.createDocument.mockImplementation(
      async (_databaseId: string, collectionId: string, documentId: string) => ({
        $id: collectionId === 'tasks' ? documentId : `attachment-${documentId}`,
      }),
    );
    appwrite.createFile.mockImplementation(async (_bucket: string, fileId: string) => ({ $id: fileId }));
    appwrite.getFileView.mockImplementation(
      (_bucket: string, fileId: string) => new URL(`https://files.example/${fileId}`),
    );
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      blob: async () => new Blob(['copied file'], { type: 'image/png' }),
    })));
  });

  it('creates a direct subtask copy with structural fields and safe defaults only', async () => {
    const source = makeTask({ parent_task_id: 'parent-1' });

    const result = await duplicateTaskTree(source, {
      description: false,
      assignees: false,
      dueDate: false,
      taskType: false,
      attachments: false,
      subtasks: false,
    }, 'actor-1');

    expect(result).toEqual({
      taskId: 'generated-1',
      failedSubtasks: 0,
      failedAttachments: 0,
    });
    expect(appwrite.createDocument).toHaveBeenCalledTimes(1);
    expect(appwrite.createDocument.mock.calls[0]).toEqual([
      'database',
      'tasks',
      'generated-1',
      {
        title: 'Homepage exploration (Copy)',
        status: 'Planning',
        priority: 'Normal',
        task_type: 'Primary',
        assignees: [],
        parent_task_id: 'parent-1',
        project_id: 'project-1',
        user_id: 'actor-1',
      },
    ]);
  });

  it('copies selected fields, direct children, and independent attachment files', async () => {
    const child = makeTask({
      id: 'subtask-1',
      title: 'Collect references',
      parent_task_id: 'task-1',
      attachments: [{
        id: 'attachment-child',
        task_id: 'subtask-1',
        user_id: 'owner-1',
        file_name: 'child.png',
        file_url: 'https://appwrite.example/storage/buckets/task-attachments/files/file-child/view',
        file_size: 20,
        file_type: 'image/png',
        created_at: now,
      }],
    });
    const source = makeTask({
      attachments: [{
        id: 'attachment-root',
        task_id: 'task-1',
        user_id: 'owner-1',
        file_name: 'root.png',
        file_url: 'https://appwrite.example/storage/buckets/task-attachments/files/file-root/view',
        file_size: 10,
        file_type: 'image/png',
        created_at: now,
      }],
      subtasks: [child],
    });

    const result = await duplicateTaskTree(source, allOptions, 'actor-1');

    expect(result).toEqual({
      taskId: 'generated-1',
      failedSubtasks: 0,
      failedAttachments: 0,
    });

    const taskCalls = appwrite.createDocument.mock.calls.filter((call) => call[1] === 'tasks');
    expect(taskCalls).toHaveLength(2);
    expect(taskCalls[0][3]).toEqual({
      title: 'Homepage exploration (Copy)',
      description: 'Explore two visual directions',
      status: 'Planning',
      priority: 'Normal',
      task_type: 'Secondary',
      assignees: ['member-a', 'member-b'],
      due_date: '2026-10-24T00:00:00.000Z',
      project_id: 'project-1',
      user_id: 'actor-1',
    });
    expect(taskCalls[1][3]).toMatchObject({
      title: 'Collect references',
      status: 'Planning',
      parent_task_id: 'generated-1',
      project_id: 'project-1',
      user_id: 'actor-1',
    });
    expect(taskCalls[1][3]).not.toHaveProperty('comments');
    expect(taskCalls[1][3]).not.toHaveProperty('activities');
    expect(taskCalls[1][3]).not.toHaveProperty('completed_at');

    expect(appwrite.createFile).toHaveBeenCalledTimes(2);
    const attachmentCalls = appwrite.createDocument.mock.calls.filter(
      (call) => call[1] === 'task_attachments',
    );
    expect(attachmentCalls).toHaveLength(2);
    expect(attachmentCalls.map((call) => call[3])).toEqual([
      {
        task_id: 'generated-1',
        user_id: 'actor-1',
        file_name: 'root.png',
        file_url: 'https://files.example/generated-2',
        file_size: 10,
        file_type: 'image/png',
      },
      {
        task_id: 'generated-4',
        user_id: 'actor-1',
        file_name: 'child.png',
        file_url: 'https://files.example/generated-5',
        file_size: 20,
        file_type: 'image/png',
      },
    ]);
  });

  it('keeps the root copy and reports failed child and attachment copies', async () => {
    const source = makeTask({
      attachments: [{
        id: 'attachment-root',
        task_id: 'task-1',
        user_id: 'owner-1',
        file_name: 'root.png',
        file_url: 'https://appwrite.example/root.png',
        file_size: 10,
        file_type: 'image/png',
        created_at: now,
      }],
      subtasks: [makeTask({ id: 'subtask-1', parent_task_id: 'task-1' })],
    });
    appwrite.createDocument.mockImplementation(
      async (_databaseId: string, collectionId: string, documentId: string, payload: Record<string, unknown>) => {
        if (collectionId === 'tasks' && payload.parent_task_id) throw new Error('child failed');
        return { $id: documentId };
      },
    );
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('download failed'); }));

    const result = await duplicateTaskTree(source, allOptions, 'actor-1');

    expect(result).toEqual({
      taskId: 'generated-1',
      failedSubtasks: 1,
      failedAttachments: 1,
    });
  });
});
