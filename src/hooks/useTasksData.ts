import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { client, databases, DATABASE_ID, Query } from "@/integrations/appwrite/client";
import { TaskWithRelations, TaskStatus, TaskPriority, TaskType } from "@/types/task";
import { Project, ProjectStatus, Currency, ProjectType } from "@/types";

export interface TasksData {
  tasks: TaskWithRelations[];
  projects: Project[];
}

const TASKS_REALTIME_COLLECTIONS = [
  "tasks",
  "task_comments",
  "task_attachments",
  "projects",
];

const PAGE_SIZE = 100;

export const tasksQueryKey = ["tasks"] as const;

const listAllDocuments = async (collectionId: string, queries: string[] = []) => {
  const documents: any[] = [];
  let offset = 0;

  while (true) {
    const response = await databases.listDocuments(DATABASE_ID, collectionId, [
      ...queries,
      Query.limit(PAGE_SIZE),
      Query.offset(offset),
    ]);

    documents.push(...response.documents);

    if (response.documents.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return documents;
};

const fetchTasksData = async (): Promise<TasksData> => {
  const [taskDocuments, projectDocuments, commentDocuments, attachmentDocuments] =
    await Promise.all([
      listAllDocuments("tasks", [Query.orderDesc("$createdAt")]),
      listAllDocuments("projects", [Query.orderDesc("$createdAt")]),
      listAllDocuments("task_comments"),
      listAllDocuments("task_attachments"),
    ]);

  const projects: Project[] = projectDocuments.map((project: any) => ({
    id: project.$id,
    name: project.name,
    clientId: project.client_id,
    status: project.status as ProjectStatus,
    deadline: new Date(project.deadline),
    fee: project.fee,
    currency: project.currency as Currency,
    projectType: project.project_type as ProjectType,
    payments: [],
    teamMembers: project.team_members || [],
    createdAt: new Date(project.$createdAt),
  }));

  const commentsByTask = new Map<string, any[]>();
  commentDocuments.forEach((c: any) => {
    if (!commentsByTask.has(c.task_id)) commentsByTask.set(c.task_id, []);
    commentsByTask.get(c.task_id)!.push(c);
  });

  const attachmentsByTask = new Map<string, any[]>();
  attachmentDocuments.forEach((a: any) => {
    if (!attachmentsByTask.has(a.task_id)) attachmentsByTask.set(a.task_id, []);
    attachmentsByTask.get(a.task_id)!.push(a);
  });

  const allTasks: TaskWithRelations[] = taskDocuments.map((task: any) => ({
    ...task,
    id: task.$id,
    status: task.status as TaskStatus,
    priority: task.priority as TaskPriority,
    task_type: task.task_type as TaskType,
    due_date: task.due_date ? new Date(task.due_date) : undefined,
    completed_at: task.completed_at ? new Date(task.completed_at) : undefined,
    created_at: new Date(task.$createdAt),
    updated_at: new Date(task.$updatedAt),
    comments: (commentsByTask.get(task.$id) || []).map((comment: any) => ({
      ...comment,
      id: comment.$id,
      created_at: new Date(comment.$createdAt),
      updated_at: new Date(comment.$updatedAt),
    })),
    attachments: (attachmentsByTask.get(task.$id) || []).map((attachment: any) => ({
      ...attachment,
      id: attachment.$id,
      created_at: new Date(attachment.$createdAt),
    })),
    subtasks: [],
  }));

  const taskMap = new Map<string, TaskWithRelations>();
  allTasks.forEach((task) => taskMap.set(task.id, task));
  allTasks.forEach((task) => {
    if (task.parent_task_id && taskMap.has(task.parent_task_id)) {
      const parentTask = taskMap.get(task.parent_task_id)!;
      if (!parentTask.subtasks) parentTask.subtasks = [];
      parentTask.subtasks.push(task);
    }
  });

  const tasks = allTasks.filter((task) => !task.parent_task_id);

  return { tasks, projects };
};

export const useTasksData = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: tasksQueryKey,
    queryFn: fetchTasksData,
  });

  useEffect(() => {
    const channels = TASKS_REALTIME_COLLECTIONS.map(
      (collection) => `databases.${DATABASE_ID}.collections.${collection}.documents`
    );

    const unsubscribe = client.subscribe(channels, () => {
      queryClient.invalidateQueries({ queryKey: tasksQueryKey });
    });

    return () => unsubscribe();
  }, [queryClient]);

  return {
    tasks: data?.tasks ?? [],
    projects: data?.projects ?? [],
    isLoading,
    invalidate: () => queryClient.invalidateQueries({ queryKey: tasksQueryKey }),
    setQueryData: (updater: (prev: TasksData | undefined) => TasksData | undefined) =>
      queryClient.setQueryData<TasksData>(tasksQueryKey, updater),
  };
};
