
import { account, databases, DATABASE_ID, ID } from '@/integrations/appwrite/client';
import { stringifyJsonField } from "@/utils/appwriteJson";
import {
  getCurrentUserId,
  notifyTaskFollowers,
} from "@/services/notificationService";

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

export const logComment = async (
  taskId: string,
  content: string,
  attachments: any[] = [],
  options: { excludeUserIds?: string[] } = {}
) => {
  let activityId: string | undefined;
  const activityLogged = await (async () => {
    try {
      const user = await account.get();
      if (!user) {
        console.error('No authenticated user found');
        return false;
      }

      const activity = await databases.createDocument(DATABASE_ID, 'task_activities', ID.unique(), {
        task_id: taskId,
        user_id: user.$id,
        activity_type: 'comment',
        content,
        metadata: stringifyJsonField({}, "{}"),
        attachments: stringifyJsonField(attachments, "[]")
      });
      activityId = activity.$id;
      return true;
    } catch (error) {
      console.error('Error logging activity:', error);
      return false;
    }
  })();

  if (activityLogged) {
    const actorId = await getCurrentUserId();
    const hasAttachments = attachments.length > 0;
    await notifyTaskFollowers({
      task: taskId,
      type: hasAttachments ? 'task_attachment_added' : 'task_comment_added',
      title: hasAttachments ? 'New task attachment' : 'New task comment',
      message: hasAttachments ? 'A file was added to a task you follow.' : 'A comment was added to a task you follow.',
      actorId,
      data: { activity_id: activityId },
      excludeUserIds: options.excludeUserIds || [],
    });
  }

  return activityLogged;
};
