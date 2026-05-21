import { account } from "@/integrations/appwrite/client";
import { dispatchNotifications } from "@/services/notificationService";

/**
 * Creates notification records for each mentioned user.
 * Skips the mentioner themselves.
 */
export async function dispatchMentionNotifications({
  mentionedUserIds,
  taskId,
  taskTitle,
  commentContent,
}: {
  mentionedUserIds: string[];
  taskId: string;
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

  const preview = commentContent.length > 140
    ? commentContent.slice(0, 140) + "..."
    : commentContent;

  const actorName = currentUser?.name || currentUser?.email?.split("@")[0] || "Someone";

  await dispatchNotifications({
    recipientIds: mentionedUserIds,
    type: "task_mention",
    title: `${actorName} mentioned you in ${taskTitle}`,
    message: preview,
    data: { task_id: taskId, actor_id: currentUser?.$id },
    actorId: currentUser?.$id,
  });
}
