import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { account, client as appwriteClient, databases, storage, DATABASE_ID, ID, Query } from '@/integrations/appwrite/client';
import { Task, TaskWithRelations, TaskStatus, TaskPriority, TaskType } from '@/types/task';
import { toast } from '@/hooks/use-toast';
import { logStatusChange, logAssigneeChange, logPriorityChange, logDueDateChange, logTaskCreated, logComment } from '@/utils/activityLogger';

const TASK_ATTACHMENTS_BUCKET = 'task-attachments';
const PROJECT_TASKS_REALTIME_COLLECTIONS = ['tasks', 'task_comments', 'task_attachments'];

type DateFieldInput = Date | string | null | undefined;

const serializeDateField = (value: DateFieldInput) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return value instanceof Date ? value.toISOString() : value;
};

const parseDateField = (value: DateFieldInput) => {
  if (!value) return undefined;
  return value instanceof Date ? value : new Date(value);
};

export const projectTasksQueryKey = (projectId: string) => ['projectTasks', projectId] as const;

const fetchProjectTasks = async (projectId: string): Promise<TaskWithRelations[]> => {
  const tasksResponse = await databases.listDocuments(DATABASE_ID, 'tasks', [
    Query.equal('project_id', projectId),
    Query.orderDesc('$createdAt'),
  ]);

  const allTaskDocs = tasksResponse.documents;
  if (allTaskDocs.length === 0) return [];

  const taskIds = allTaskDocs.map((t: any) => t.$id);

  const [commentsResponse, attachmentsResponse] = await Promise.all([
    databases.listDocuments(DATABASE_ID, 'task_comments', [Query.equal('task_id', taskIds)]),
    databases.listDocuments(DATABASE_ID, 'task_attachments', [Query.equal('task_id', taskIds)]),
  ]);

  const commentsByTask = new Map<string, any[]>();
  commentsResponse.documents.forEach((c: any) => {
    if (!commentsByTask.has(c.task_id)) commentsByTask.set(c.task_id, []);
    commentsByTask.get(c.task_id)!.push(c);
  });

  const attachmentsByTask = new Map<string, any[]>();
  attachmentsResponse.documents.forEach((a: any) => {
    if (!attachmentsByTask.has(a.task_id)) attachmentsByTask.set(a.task_id, []);
    attachmentsByTask.get(a.task_id)!.push(a);
  });

  const subtasksByParent = new Map<string, any[]>();
  allTaskDocs.forEach((t: any) => {
    if (t.parent_task_id) {
      if (!subtasksByParent.has(t.parent_task_id)) subtasksByParent.set(t.parent_task_id, []);
      subtasksByParent.get(t.parent_task_id)!.push(t);
    }
  });

  const mainTasks = allTaskDocs.filter((t: any) => !t.parent_task_id);

  return mainTasks.map((task: any) => ({
    ...task,
    id: task.$id,
    status: task.status as TaskStatus,
    priority: task.priority as TaskPriority,
    task_type: task.task_type as TaskType,
    due_date: task.due_date ? new Date(task.due_date) : undefined,
    completed_at: task.completed_at ? new Date(task.completed_at) : undefined,
    created_at: new Date(task.$createdAt),
    updated_at: new Date(task.$updatedAt),
    brief_id: task.brief_id,
    brief_type: task.brief_type,
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
    subtasks: (subtasksByParent.get(task.$id) || []).map((subtask: any) => ({
      ...subtask,
      id: subtask.$id,
      status: subtask.status as TaskStatus,
      priority: subtask.priority as TaskPriority,
      task_type: subtask.task_type as TaskType,
      due_date: subtask.due_date ? new Date(subtask.due_date) : undefined,
      completed_at: subtask.completed_at ? new Date(subtask.completed_at) : undefined,
      created_at: new Date(subtask.$createdAt),
      updated_at: new Date(subtask.$updatedAt),
      brief_id: subtask.brief_id,
      brief_type: subtask.brief_type,
    })),
  }));
};

export const useTasks = (projectId: string) => {
  const queryClient = useQueryClient();
  const queryKey = projectTasksQueryKey(projectId);

  const { data: tasks = [], isLoading, refetch } = useQuery({
    queryKey,
    queryFn: () => fetchProjectTasks(projectId),
    enabled: !!projectId,
  });

  useEffect(() => {
    if (!projectId) return;

    const channels = PROJECT_TASKS_REALTIME_COLLECTIONS.map(
      (collection) => `databases.${DATABASE_ID}.collections.${collection}.documents`
    );

    const unsubscribe = appwriteClient.subscribe(channels, () => {
      queryClient.invalidateQueries({ queryKey });
    });

    return () => unsubscribe();
  }, [projectId, queryClient]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const createTask = async (taskData: Partial<Task> & { parent_task_id?: string }) => {
    try {
      const user = await account.get();
      if (!user) {
        toast({ title: "Error", description: "You must be logged in to create tasks", variant: "destructive" });
        return null;
      }

      const insertData: any = {
        title: taskData.title || '',
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        task_type: taskData.task_type,
        due_date: serializeDateField(taskData.due_date as DateFieldInput),
        completed_at: serializeDateField(taskData.completed_at as DateFieldInput),
        assignees: taskData.assignees,
        project_id: projectId,
        user_id: user.$id,
        brief_id: taskData.brief_id,
        brief_type: taskData.brief_type,
        parent_task_id: taskData.parent_task_id,
      };

      const data = await databases.createDocument(DATABASE_ID, 'tasks', ID.unique(), insertData);

      await logTaskCreated(data.$id);

      toast({ title: "Success", description: "Task created successfully" });
      invalidate();
      return data;
    } catch (error) {
      console.error('Error creating task:', error);
      toast({ title: "Error", description: "Failed to create task", variant: "destructive" });
      return null;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const currentTask = tasks.find(t => t.id === taskId);

      const processedUpdates: any = {};
      if (updates.title !== undefined) processedUpdates.title = updates.title;
      if (updates.description !== undefined) processedUpdates.description = updates.description;
      if (updates.status !== undefined) processedUpdates.status = updates.status;
      if (updates.priority !== undefined) processedUpdates.priority = updates.priority;
      if (updates.task_type !== undefined) processedUpdates.task_type = updates.task_type;
      if (updates.assignees !== undefined) processedUpdates.assignees = updates.assignees;
      if (updates.due_date !== undefined) processedUpdates.due_date = serializeDateField(updates.due_date as DateFieldInput);
      if (updates.completed_at !== undefined) processedUpdates.completed_at = serializeDateField(updates.completed_at as DateFieldInput);
      if (updates.brief_id !== undefined) processedUpdates.brief_id = updates.brief_id;
      if (updates.brief_type !== undefined) processedUpdates.brief_type = updates.brief_type;

      queryClient.setQueryData<TaskWithRelations[]>(queryKey, (prev) =>
        prev
          ? prev.map((t) => (t.id === taskId ? { ...t, ...updates } as TaskWithRelations : t))
          : prev
      );

      await databases.updateDocument(DATABASE_ID, 'tasks', taskId, processedUpdates);

      if (currentTask) {
        if (updates.status !== undefined && updates.status !== currentTask.status) {
          await logStatusChange(taskId, currentTask.status, updates.status);
        }
        if (updates.priority !== undefined && updates.priority !== currentTask.priority) {
          await logPriorityChange(taskId, currentTask.priority, updates.priority);
        }
        if (updates.due_date !== undefined) {
          const oldDate = parseDateField(currentTask.due_date as DateFieldInput);
          const newDate = parseDateField(updates.due_date as DateFieldInput);
          if (oldDate?.getTime() !== newDate?.getTime()) {
            await logDueDateChange(taskId, oldDate, newDate);
          }
        }
        if (updates.assignees !== undefined) {
          const oldAssignees = currentTask.assignees || [];
          const newAssignees = updates.assignees || [];
          const addedAssignees = newAssignees.filter(id => !oldAssignees.includes(id));
          const removedAssignees = oldAssignees.filter(id => !newAssignees.includes(id));
          for (const _ of addedAssignees) await logAssigneeChange(taskId, 'added', 'User');
          for (const _ of removedAssignees) await logAssigneeChange(taskId, 'removed', 'User');
        }
      }

      toast({ title: "Success", description: "Task updated successfully" });
      invalidate();
      return true;
    } catch (error) {
      console.error('Error updating task:', error);
      toast({ title: "Error", description: "Failed to update task", variant: "destructive" });
      invalidate();
      return false;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await databases.deleteDocument(DATABASE_ID, 'tasks', taskId);
      toast({ title: "Success", description: "Task deleted successfully" });
      invalidate();
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({ title: "Error", description: "Failed to delete task", variant: "destructive" });
      return false;
    }
  };

  const addComment = async (taskId: string, content: string) => {
    try {
      const user = await account.get();
      if (!user) {
        toast({ title: "Error", description: "You must be logged in to add comments", variant: "destructive" });
        return false;
      }

      await databases.createDocument(DATABASE_ID, 'task_comments', ID.unique(), {
        task_id: taskId,
        content,
        user_id: user.$id,
      });

      await logComment(taskId, content);
      invalidate();
      return true;
    } catch (error) {
      console.error('Error adding comment:', error);
      return false;
    }
  };

  const uploadAttachment = async (taskId: string, file: File) => {
    try {
      const user = await account.get();
      if (!user) {
        toast({ title: "Error", description: "You must be logged in to upload files", variant: "destructive" });
        return false;
      }

      const uploadedFile = await storage.createFile(TASK_ATTACHMENTS_BUCKET, ID.unique(), file);
      const fileUrl = storage.getFileView(TASK_ATTACHMENTS_BUCKET, uploadedFile.$id);

      await databases.createDocument(DATABASE_ID, 'task_attachments', ID.unique(), {
        task_id: taskId,
        user_id: user.$id,
        file_name: file.name,
        file_url: fileUrl,
        file_size: file.size,
        file_type: file.type,
      });

      toast({ title: "Success", description: "File uploaded successfully" });
      invalidate();
      return true;
    } catch (error) {
      console.error('Error uploading attachment:', error);
      toast({ title: "Error", description: "Failed to upload attachment", variant: "destructive" });
      return false;
    }
  };

  const createSubtask = async (subtaskData: any) => {
    try {
      const user = await account.get();
      if (!user) {
        toast({ title: "Error", description: "You must be logged in to create subtasks", variant: "destructive" });
        return;
      }

      const insertData: any = {
        title: subtaskData.title || '',
        description: subtaskData.description,
        status: subtaskData.status || 'Planning',
        priority: subtaskData.priority,
        task_type: subtaskData.task_type,
        assignees: subtaskData.assignees || [],
        due_date: subtaskData.due_date,
        parent_task_id: subtaskData.parent_task_id,
        project_id: projectId,
        user_id: user.$id,
      };

      await databases.createDocument(DATABASE_ID, 'tasks', ID.unique(), insertData);

      toast({ title: "Success", description: "Subtask created successfully" });
      invalidate();
    } catch (error: any) {
      console.error('Error creating subtask:', error);
      toast({
        title: "Error",
        description: "Failed to create subtask: " + (error.message || ""),
        variant: "destructive",
      });
    }
  };

  return {
    tasks,
    isLoading,
    fetchTasks: async () => {
      await refetch();
    },
    createTask,
    createSubtask,
    updateTask,
    deleteTask,
    addComment,
    uploadAttachment,
  };
};
