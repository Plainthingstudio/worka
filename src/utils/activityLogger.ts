
import { account, databases, DATABASE_ID, ID, Query } from '@/integrations/appwrite/client';
import { stringifyJsonField } from "@/utils/appwriteJson";

export type ActivityType = 'comment' | 'status_change' | 'assignee_change' | 'priority_change' | 'attachment' | 'task_created' | 'due_date_change' | 'task_updated';

interface LogActivityParams {
  taskId: string;
  activityType: ActivityType;
  content?: string;
  metadata?: any;
  attachments?: any[];
}

export const logActivity = async ({
  taskId,
  activityType,
  content,
  metadata = {},
  attachments = []
}: LogActivityParams): Promise<boolean> => {
  try {
    const user = await account.get();
    if (!user) {
      console.error('No authenticated user found');
      return false;
    }

    await databases.createDocument(DATABASE_ID, 'task_activities', ID.unique(), {
      task_id: taskId,
      user_id: user.$id,
      activity_type: activityType,
      content: content ?? null,
      metadata: stringifyJsonField(metadata, "{}"),
      attachments: stringifyJsonField(attachments, "[]")
    });

    return true;
  } catch (error) {
    console.error('Error logging activity:', error);
    return false;
  }
};

export const logStatusChange = (taskId: string, oldStatus: string, newStatus: string) => {
  return logActivity({
    taskId,
    activityType: 'status_change',
    metadata: { old_value: oldStatus, new_value: newStatus }
  });
};

export const logAssigneeChange = (taskId: string, action: 'added' | 'removed', assigneeName: string) => {
  return logActivity({
    taskId,
    activityType: 'assignee_change',
    metadata: { action, assignee_name: assigneeName }
  });
};

export const logPriorityChange = (taskId: string, oldPriority: string, newPriority: string) => {
  return logActivity({
    taskId,
    activityType: 'priority_change',
    metadata: { old_value: oldPriority, new_value: newPriority }
  });
};

export const logDueDateChange = (taskId: string, oldDate?: Date, newDate?: Date) => {
  return logActivity({
    taskId,
    activityType: 'due_date_change',
    metadata: {
      old_value: oldDate?.toISOString(),
      new_value: newDate?.toISOString()
    }
  });
};

export const logTaskCreated = (taskId: string) => {
  return logActivity({
    taskId,
    activityType: 'task_created'
  });
};

export const logComment = async (taskId: string, content: string, attachments: any[] = []) => {
  const activityLogged = await logActivity({
    taskId,
    activityType: 'comment',
    content,
    attachments
  });

  if (activityLogged) {
    try {
      const response = await databases.listDocuments(DATABASE_ID, 'tasks', [
        Query.equal('$id', taskId),
      ]);
      const task = response.documents[0];

      if (task) {
        const user = await account.get();
        if (!user) return activityLogged;

        const usersToNotify = [
          task.user_id,
          ...(task.assignees || [])
        ].filter((userId, index, arr) =>
          userId !== user.$id && arr.indexOf(userId) === index
        );

        for (const userId of usersToNotify) {
          await databases.createDocument(DATABASE_ID, 'notifications', ID.unique(), {
            user_id: userId,
            type: 'task_comment_added',
            title: 'New Comment',
            message: `New comment on task: ${task.title}`,
            data: stringifyJsonField({ task_id: taskId, task_title: task.title }, "{}")
          });
        }
      }
    } catch (error) {
      console.error('Error creating comment notifications:', error);
    }
  }

  return activityLogged;
};
