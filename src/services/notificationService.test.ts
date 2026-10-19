import { describe, expect, it, vi } from 'vitest';
import { getNotificationDestination } from './notificationService';

vi.mock('@/integrations/appwrite/client', () => ({
  account: {},
  databases: {},
  DATABASE_ID: 'database',
  ID: {},
  Query: {},
}));

describe('getNotificationDestination', () => {
  it('marks task destinations as notification navigation', () => {
    const destination = getNotificationDestination({
      task_id: 'task-1',
      project_id: 'project-1',
      parent_task_id: 'parent-1',
    });

    expect(destination).not.toBeNull();
    const url = new URL(destination!, 'https://example.test');
    expect(url.pathname).toBe('/tasks');
    expect(url.searchParams.get('taskId')).toBe('task-1');
    expect(url.searchParams.get('projectId')).toBe('project-1');
    expect(url.searchParams.get('parentTaskId')).toBe('parent-1');
    expect(url.searchParams.get('source')).toBe('notification');
  });

  it('does not add a notification marker to project-only destinations', () => {
    expect(getNotificationDestination({ project_id: 'project-1' })).toBe('/projects/project-1');
  });
});
