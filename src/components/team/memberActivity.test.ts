import { describe, expect, it } from 'vitest';
import { filterMemberActivities, normalizeMemberActivities } from './memberActivity';

const activityDocs = [
  {
    $id: 'activity-comment',
    $createdAt: '2026-10-20T03:30:00.000Z',
    task_id: 'task-main',
    user_id: 'user-1',
    activity_type: 'comment',
    content: 'Client sudah approve versi ini.',
    metadata: '{}',
    attachments: '[]',
  },
  {
    $id: 'activity-subtask',
    $createdAt: '2026-10-19T03:30:00.000Z',
    task_id: 'task-child',
    user_id: 'user-1',
    activity_type: 'task_created',
    content: null,
    metadata: '{}',
    attachments: '[]',
  },
];

const taskDocs = [
  { $id: 'task-main', title: 'Homepage exploration', project_id: 'project-1' },
  {
    $id: 'task-child',
    title: 'Mobile responsive',
    project_id: 'project-1',
    parent_task_id: 'task-main',
  },
];

const projectDocs = [{ $id: 'project-1', name: 'Worka Website Revamp' }];

describe('member activity mapping', () => {
  it('keeps task and project context and identifies created subtasks', () => {
    const activities = normalizeMemberActivities(activityDocs, taskDocs, projectDocs);

    expect(activities).toEqual([
      expect.objectContaining({
        id: 'activity-comment',
        taskTitle: 'Homepage exploration',
        projectName: 'Worka Website Revamp',
        isSubtask: false,
        content: 'Client sudah approve versi ini.',
      }),
      expect.objectContaining({
        id: 'activity-subtask',
        taskTitle: 'Mobile responsive',
        parentTaskTitle: 'Homepage exploration',
        projectName: 'Worka Website Revamp',
        isSubtask: true,
      }),
    ]);
  });

  it('filters by category and date without dropping the newest matching entry', () => {
    const activities = normalizeMemberActivities(activityDocs, taskDocs, projectDocs);
    const now = new Date('2026-10-20T12:00:00.000Z');

    expect(filterMemberActivities(activities, 'comments', '7', now).map((item) => item.id)).toEqual([
      'activity-comment',
    ]);
    expect(filterMemberActivities(activities, 'created', '1', now).map((item) => item.id)).toEqual([
      'activity-subtask',
    ]);
  });
});
