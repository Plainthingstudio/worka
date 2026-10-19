import { databases, DATABASE_ID, ID, storage } from '@/integrations/appwrite/client';
import type { TaskAttachment, TaskWithRelations } from '@/types/task';

const TASK_ATTACHMENTS_BUCKET = 'task-attachments';

export interface DuplicateTaskOptions {
  description: boolean;
  assignees: boolean;
  dueDate: boolean;
  taskType: boolean;
  attachments: boolean;
  subtasks: boolean;
}

export interface DuplicateTaskResult {
  taskId: string;
  failedSubtasks: number;
  failedAttachments: number;
}

type DuplicatePayloadOptions = {
  title: string;
  parentTaskId?: string;
};

const buildDuplicatePayload = (
  source: TaskWithRelations,
  options: DuplicateTaskOptions,
  userId: string,
  payloadOptions: DuplicatePayloadOptions,
) => {
  const payload: Record<string, unknown> = {
    title: payloadOptions.title,
    status: 'Planning',
    priority: 'Normal',
    task_type: options.taskType ? source.task_type : 'Primary',
    assignees: options.assignees ? [...(source.assignees || [])] : [],
    project_id: source.project_id,
    user_id: userId,
  };

  if (payloadOptions.parentTaskId) payload.parent_task_id = payloadOptions.parentTaskId;
  if (options.description && source.description !== undefined) {
    payload.description = source.description;
  }
  if (options.dueDate && source.due_date) {
    payload.due_date = new Date(source.due_date).toISOString();
  }

  return payload;
};

const copyAttachment = async (
  attachment: TaskAttachment,
  targetTaskId: string,
  userId: string,
) => {
  const response = await fetch(attachment.file_url);
  if (!response.ok) throw new Error(`Could not download ${attachment.file_name}`);

  const blob = await response.blob();
  const file = new File([blob], attachment.file_name, {
    type: attachment.file_type || blob.type,
  });
  const fileId = ID.unique();
  const uploaded = await storage.createFile(TASK_ATTACHMENTS_BUCKET, fileId, file);
  const fileUrl = storage.getFileView(TASK_ATTACHMENTS_BUCKET, uploaded.$id).toString();

  await databases.createDocument(DATABASE_ID, 'task_attachments', ID.unique(), {
    task_id: targetTaskId,
    user_id: userId,
    file_name: attachment.file_name,
    file_url: fileUrl,
    file_size: attachment.file_size,
    file_type: attachment.file_type,
  });
};

const copyAttachments = async (
  source: TaskWithRelations,
  targetTaskId: string,
  userId: string,
) => {
  let failures = 0;

  for (const attachment of source.attachments || []) {
    try {
      await copyAttachment(attachment, targetTaskId, userId);
    } catch {
      failures += 1;
    }
  }

  return failures;
};

export const duplicateTaskTree = async (
  source: TaskWithRelations,
  options: DuplicateTaskOptions,
  userId: string,
): Promise<DuplicateTaskResult> => {
  const rootId = ID.unique();
  const rootPayload = buildDuplicatePayload(source, options, userId, {
    title: `${source.title} (Copy)`,
    parentTaskId: source.parent_task_id,
  });

  const rootCopy = await databases.createDocument(DATABASE_ID, 'tasks', rootId, rootPayload);
  const result: DuplicateTaskResult = {
    taskId: rootCopy.$id,
    failedSubtasks: 0,
    failedAttachments: 0,
  };

  if (options.attachments) {
    result.failedAttachments += await copyAttachments(source, rootCopy.$id, userId);
  }

  if (options.subtasks && !source.parent_task_id) {
    for (const child of source.subtasks || []) {
      const childId = ID.unique();
      try {
        const childCopy = await databases.createDocument(
          DATABASE_ID,
          'tasks',
          childId,
          buildDuplicatePayload(child as TaskWithRelations, options, userId, {
            title: child.title,
            parentTaskId: rootCopy.$id,
          }),
        );

        if (options.attachments) {
          result.failedAttachments += await copyAttachments(
            child as TaskWithRelations,
            childCopy.$id,
            userId,
          );
        }
      } catch {
        result.failedSubtasks += 1;
      }
    }
  }

  return result;
};
