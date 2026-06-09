import { account } from "@/integrations/appwrite/client";
import { dispatchNotifications } from "@/services/notificationService";

/**
 * Creates notification records for each mentioned user.
 * Skips the mentioner themselves.
 */
export async function dispatchMentionNotifications({
  mentionedUserIds,
  taskId,
  projectId,
  parentTaskId,
  taskTitle,
  commentContent,
}: {
  mentionedUserIds: string[];
  taskId: string;
  projectId?: string | null;
  parentTaskId?: string | null;
  taskTitle: string;
  commentContent: string;
}) {
  if (mentionedUserIds.length === 0) return;

  let currentUser;
  try {
    currentUser = await account.get();
  } catch {
    return;
  }

  const actorName = currentUser?.name || currentUser?.email?.split("@")[0] || "Someone";

  await dispatchNotifications({
    recipientIds: mentionedUserIds,
    type: "task_mention",
    title: `${actorName} mentioned you in ${taskTitle}`,
    message: commentContent,
    data: {
      task_id: taskId,
      project_id: projectId || undefined,
      parent_task_id: parentTaskId || undefined,
      actor_id: currentUser?.$id,
    },
    actorId: currentUser?.$id,
  });
}
