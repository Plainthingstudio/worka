
import { supabase } from '@/integrations/supabase/client';

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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user found');
      return false;
    }

    const { error } = await supabase
      .from('task_activities')
      .insert([{
        task_id: taskId,
        user_id: user.id,
        activity_type: activityType,
        content,
        metadata,
        attachments
      }]);

    if (error) {
      console.error('Error logging activity:', error);
      return false;
    }

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

export const logComment = (taskId: string, content: string, attachments: any[] = []) => {
  return logActivity({
    taskId,
    activityType: 'comment',
    content,
    attachments
  });
};
