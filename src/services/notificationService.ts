import { account, databases, DATABASE_ID, ID, Query } from "@/integrations/appwrite/client";
import { parseJsonField, stringifyJsonField } from "@/utils/appwriteJson";

export type NotificationType =
  | "task_assigned"
  | "task_unassigned"
  | "task_comment_added"
  | "task_mention"
  | "task_status_changed"
  | "task_priority_changed"
  | "task_due_date_changed"
  | "task_attachment_added"
  | "task_brief_connected"
  | "task_brief_disconnected"
  | "subtask_created"
  | "subtask_assigned"
  | "project_assigned"
  | "project_unassigned"
  | "project_status_changed"
  | "project_deadline_changed"
  | "project_payment_added"
  | "project_task_created"
  | "project_activity_added"
  | "task_due_reminder"
  | "task_overdue"
  | "project_due_reminder"
  | "project_overdue"
  | "invitation_accepted"
  | "role_changed"
  | "profile_updated";

export type NotificationData = Record<string, unknown> & {
  task_id?: string;
  project_id?: string;
  actor_id?: string;
  activity_id?: string;
  parent_task_id?: string;
};

interface NotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: NotificationData;
}

interface DispatchInput {
  recipientIds: string[];
  type: NotificationType;
  title: string;
  message: string;
  data?: NotificationData;
  actorId?: string | null;
  excludeUserIds?: string[];
}

type TaskDoc = Record<string, any> & {
  $id?: string;
  id?: string;
  title?: string;
  user_id?: string;
  assignees?: string[];
  project_id?: string;
  parent_task_id?: string | null;
};

type ProjectDoc = Record<string, any> & {
  $id?: string;
  id?: string;
  name?: string;
  user_id?: string;
  team_members?: string[];
  teamMembers?: string[];
};

const unique = (values: Array<string | null | undefined>) =>
  Array.from(new Set(values.filter((value): value is string => Boolean(value))));

const getDocumentId = (doc: { $id?: string; id?: string }) => doc.$id || doc.id || "";

export const normalizeNotificationData = (data: unknown): NotificationData => {
  const parsed = parseJsonField<Record<string, unknown>>(data, {});

  return {
    ...parsed,
    task_id: (parsed.task_id || parsed.taskId) as string | undefined,
    project_id: (parsed.project_id || parsed.projectId) as string | undefined,
    actor_id: (parsed.actor_id || parsed.actorId) as string | undefined,
    activity_id: (parsed.activity_id || parsed.activityId) as string | undefined,
    parent_task_id: (parsed.parent_task_id || parsed.parentTaskId) as string | undefined,
  };
};

export const getNotificationDestination = (data: NotificationData) => {
  if (data.task_id) {
    const params = new URLSearchParams({ taskId: String(data.task_id) });
    if (data.project_id) params.set("projectId", String(data.project_id));
    if (data.parent_task_id) params.set("parentTaskId", String(data.parent_task_id));
    return `/tasks?${params.toString()}`;
  }

  if (data.project_id) {
    return `/projects/${data.project_id}`;
  }

  return null;
};

export const getCurrentUserId = async () => {
  try {
    const user = await account.get();
    return user?.$id || null;
  } catch {
    return null;
  }
};

export const createNotification = async ({
  userId,
  type,
  title,
  message,
  data = {},
}: NotificationInput) => {
  return databases.createDocument(DATABASE_ID, "notifications", ID.unique(), {
    user_id: userId,
    type,
    title,
    message,
    data: stringifyJsonField(data, "{}"),
  });
};

export const dispatchNotifications = async ({
  recipientIds,
  type,
  title,
  message,
  data = {},
  actorId,
  excludeUserIds = [],
}: DispatchInput) => {
  const blocked = new Set(unique([actorId || undefined, ...excludeUserIds]));
  const targets = unique(recipientIds).filter((userId) => !blocked.has(userId));

  if (targets.length === 0) return;

  await Promise.allSettled(
    targets.map((userId) =>
      createNotification({
        userId,
        type,
        title,
        message,
        data: { ...data, actor_id: actorId || data.actor_id },
      })
    )
  );
};

export const resolveTeamMemberUserIds = async (ids: string[] = []) => {
  const normalizedIds = unique(ids);
  if (normalizedIds.length === 0) return [];

  const byDocumentId = new Map<string, string>();
  const byUserId = new Set<string>();

  await Promise.allSettled([
    databases.listDocuments(DATABASE_ID, "team_members", [Query.equal("$id", normalizedIds)]),
    databases.listDocuments(DATABASE_ID, "team_members", [Query.equal("user_id", normalizedIds)]),
  ]).then((results) => {
    results.forEach((result) => {
      if (result.status !== "fulfilled") return;
      result.value.documents.forEach((member: any) => {
        if (member.$id && member.user_id) byDocumentId.set(member.$id, member.user_id);
        if (member.user_id) byUserId.add(member.user_id);
      });
    });
  });

  return unique(
    normalizedIds.map((id) => {
      if (byDocumentId.has(id)) return byDocumentId.get(id);
      if (byUserId.has(id)) return id;
      return id;
    })
  );
};

export const getTaskDocument = async (taskId: string): Promise<TaskDoc | null> => {
  try {
    return await databases.getDocument(DATABASE_ID, "tasks", taskId);
  } catch {
    return null;
  }
};

export const getProjectDocument = async (projectId: string): Promise<ProjectDoc | null> => {
  try {
    return await databases.getDocument(DATABASE_ID, "projects", projectId);
  } catch {
    return null;
  }
};

export const resolveTaskRecipients = async (task: TaskDoc | null, extraIds: string[] = []) => {
  if (!task) return [];
  const assigneeUserIds = await resolveTeamMemberUserIds(task.assignees || []);
  return unique([task.user_id, ...assigneeUserIds, ...extraIds]);
};

export const resolveProjectRecipients = async (project: ProjectDoc | null, extraIds: string[] = []) => {
  if (!project) return [];
  const teamMemberIds = project.team_members || project.teamMembers || [];
  const teamUserIds = await resolveTeamMemberUserIds(teamMemberIds);
  return unique([project.user_id, ...teamUserIds, ...extraIds]);
};

export const notifyTaskCreated = async (task: TaskDoc, actorId?: string | null) => {
  const taskId = getDocumentId(task);
  if (!taskId) return;

  const projectId = task.project_id;
  const taskTitle = task.title || "Untitled task";
  const assigneeUserIds = await resolveTeamMemberUserIds(task.assignees || []);

  if (task.parent_task_id) {
    await dispatchNotifications({
      recipientIds: assigneeUserIds,
      type: "subtask_assigned",
      title: "Subtask assigned",
      message: `You have been assigned to subtask: ${taskTitle}`,
      data: { task_id: taskId, project_id: projectId, parent_task_id: task.parent_task_id },
      actorId,
    });

    const parentTask = await getTaskDocument(task.parent_task_id);
    const parentRecipients = await resolveTaskRecipients(parentTask, []);
    await dispatchNotifications({
      recipientIds: parentRecipients,
      type: "subtask_created",
      title: "New subtask",
      message: `New subtask created: ${taskTitle}`,
      data: { task_id: taskId, project_id: projectId, parent_task_id: task.parent_task_id },
      actorId,
      excludeUserIds: assigneeUserIds,
    });
  } else {
    await dispatchNotifications({
      recipientIds: assigneeUserIds,
      type: "task_assigned",
      title: "Task assigned",
      message: `You have been assigned to task: ${taskTitle}`,
      data: { task_id: taskId, project_id: projectId },
      actorId,
    });
  }

  if (projectId) {
    const project = await getProjectDocument(projectId);
    const projectRecipients = await resolveProjectRecipients(project);
    await dispatchNotifications({
      recipientIds: projectRecipients,
      type: "project_task_created",
      title: "New project task",
      message: `New task created in ${project?.name || "a project"}: ${taskTitle}`,
      data: { task_id: taskId, project_id: projectId, parent_task_id: task.parent_task_id || undefined },
      actorId,
      excludeUserIds: assigneeUserIds,
    });
  }
};

export const notifyTaskAssigneeChanges = async ({
  task,
  addedAssigneeIds,
  removedAssigneeIds,
  actorId,
}: {
  task: TaskDoc;
  addedAssigneeIds: string[];
  removedAssigneeIds: string[];
  actorId?: string | null;
}) => {
  const taskId = getDocumentId(task);
  if (!taskId) return;

  const projectId = task.project_id;
  const taskTitle = task.title || "Untitled task";
  const addedUserIds = await resolveTeamMemberUserIds(addedAssigneeIds);
  const removedUserIds = await resolveTeamMemberUserIds(removedAssigneeIds);

  await dispatchNotifications({
    recipientIds: addedUserIds,
    type: task.parent_task_id ? "subtask_assigned" : "task_assigned",
    title: task.parent_task_id ? "Subtask assigned" : "Task assigned",
    message: `You have been assigned to ${task.parent_task_id ? "subtask" : "task"}: ${taskTitle}`,
    data: { task_id: taskId, project_id: projectId, parent_task_id: task.parent_task_id || undefined },
    actorId,
  });

  await dispatchNotifications({
    recipientIds: removedUserIds,
    type: "task_unassigned",
    title: "Task unassigned",
    message: `You have been removed from task: ${taskTitle}`,
    data: { task_id: taskId, project_id: projectId, parent_task_id: task.parent_task_id || undefined },
    actorId,
  });
};

export const notifyTaskFollowers = async ({
  task,
  type,
  title,
  message,
  actorId,
  data = {},
  excludeUserIds = [],
}: {
  task: TaskDoc | string;
  type: NotificationType;
  title: string;
  message: string;
  actorId?: string | null;
  data?: NotificationData;
  excludeUserIds?: string[];
}) => {
  const taskDoc = typeof task === "string" ? await getTaskDocument(task) : task;
  if (!taskDoc) return;

  const taskId = getDocumentId(taskDoc);
  const recipients = await resolveTaskRecipients(taskDoc);
  await dispatchNotifications({
    recipientIds: recipients,
    type,
    title,
    message,
    data: {
      task_id: taskId,
      project_id: taskDoc.project_id,
      parent_task_id: taskDoc.parent_task_id || undefined,
      ...data,
    },
    actorId,
    excludeUserIds,
  });
};

export const notifyProjectAssigneeChanges = async ({
  project,
  addedTeamMemberIds,
  removedTeamMemberIds,
  actorId,
}: {
  project: ProjectDoc | string;
  addedTeamMemberIds: string[];
  removedTeamMemberIds: string[];
  actorId?: string | null;
}) => {
  const projectDoc = typeof project === "string" ? await getProjectDocument(project) : project;
  if (!projectDoc) return;

  const projectId = getDocumentId(projectDoc);
  const projectName = projectDoc.name || "Untitled project";
  const addedUserIds = await resolveTeamMemberUserIds(addedTeamMemberIds);
  const removedUserIds = await resolveTeamMemberUserIds(removedTeamMemberIds);

  await dispatchNotifications({
    recipientIds: addedUserIds,
    type: "project_assigned",
    title: "Project assigned",
    message: `You have been assigned to project: ${projectName}`,
    data: { project_id: projectId },
    actorId,
  });

  await dispatchNotifications({
    recipientIds: removedUserIds,
    type: "project_unassigned",
    title: "Project unassigned",
    message: `You have been removed from project: ${projectName}`,
    data: { project_id: projectId },
    actorId,
  });
};

export const notifyProjectFollowers = async ({
  project,
  type,
  title,
  message,
  actorId,
  data = {},
  excludeUserIds = [],
}: {
  project: ProjectDoc | string;
  type: NotificationType;
  title: string;
  message: string;
  actorId?: string | null;
  data?: NotificationData;
  excludeUserIds?: string[];
}) => {
  const projectDoc = typeof project === "string" ? await getProjectDocument(project) : project;
  if (!projectDoc) return;

  const projectId = getDocumentId(projectDoc);
  const recipients = await resolveProjectRecipients(projectDoc);
  await dispatchNotifications({
    recipientIds: recipients,
    type,
    title,
    message,
    data: { project_id: projectId, ...data },
    actorId,
    excludeUserIds,
  });
};
