import { parseJsonField } from '@/utils/appwriteJson';
import type { Models } from 'appwrite';

export type MemberActivityType =
  | 'comment'
  | 'status_change'
  | 'assignee_change'
  | 'priority_change'
  | 'attachment'
  | 'task_created'
  | 'due_date_change'
  | 'task_updated'
  | 'brief_connected'
  | 'brief_disconnected';

export type MemberActivityCategory = 'all' | 'created' | 'comments' | 'updates';
export type MemberActivityPeriod = '1' | '7' | '30' | 'all';

export interface MemberActivity {
  id: string;
  taskId: string;
  userId: string;
  type: MemberActivityType;
  content: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  taskTitle: string;
  parentTaskTitle?: string;
  projectName: string;
  isSubtask: boolean;
}

export const normalizeMemberActivities = (
  activityDocs: Models.Document[],
  taskDocs: Models.Document[],
  projectDocs: Models.Document[],
): MemberActivity[] => {
  const tasksById = new Map(taskDocs.map((task) => [task.$id, task]));
  const projectsById = new Map(projectDocs.map((project) => [project.$id, project]));

  return activityDocs.map((activity) => {
    const task = tasksById.get(activity.task_id);
    const parentTask = task?.parent_task_id ? tasksById.get(task.parent_task_id) : undefined;
    const project = task?.project_id ? projectsById.get(task.project_id) : undefined;

    return {
      id: activity.$id,
      taskId: activity.task_id,
      userId: activity.user_id,
      type: activity.activity_type as MemberActivityType,
      content: activity.content ?? null,
      metadata: parseJsonField(activity.metadata, {}),
      createdAt: new Date(activity.$createdAt),
      taskTitle: task?.title || 'Deleted task',
      parentTaskTitle: parentTask?.title,
      projectName: project?.name || 'Unknown project',
      isSubtask: Boolean(task?.parent_task_id),
    };
  });
};

const matchesCategory = (activity: MemberActivity, category: MemberActivityCategory) => {
  if (category === 'all') return true;
  if (category === 'created') return activity.type === 'task_created';
  if (category === 'comments') return activity.type === 'comment';
  return activity.type !== 'task_created' && activity.type !== 'comment';
};

export const filterMemberActivities = (
  activities: MemberActivity[],
  category: MemberActivityCategory,
  period: MemberActivityPeriod,
  now = new Date(),
) => {
  const cutoff = new Date(now);
  cutoff.setHours(0, 0, 0, 0);
  if (period !== 'all') cutoff.setDate(cutoff.getDate() - Number(period));

  return activities.filter((activity) => {
    const withinPeriod = period === 'all' || activity.createdAt >= cutoff;
    return withinPeriod && matchesCategory(activity, category);
  });
};
