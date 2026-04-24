import { account, databases, DATABASE_ID, ID } from "@/integrations/appwrite/client";

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

  const targets = mentionedUserIds.filter((id) => id !== currentUser?.$id);
  const preview = commentContent.length > 140
    ? commentContent.slice(0, 140) + "..."
    : commentContent;

  const actorName = currentUser?.name || currentUser?.email?.split("@")[0] || "Someone";

  await Promise.allSettled(
    targets.map((userId) =>
      databases.createDocument(DATABASE_ID, "notifications", ID.unique(), {
        user_id: userId,
        type: "task_mention",
        title: `${actorName} mentioned you in ${taskTitle}`,
        message: preview,
        data: JSON.stringify({ taskId, actorId: currentUser?.$id }),
      })
    )
  );
}
