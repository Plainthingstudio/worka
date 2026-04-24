
import { useState, useEffect } from 'react';
import { account, databases, storage, DATABASE_ID, ID, Query } from '@/integrations/appwrite/client';
import { Task, TaskComment, TaskAttachment, TaskWithRelations, TaskStatus, TaskPriority, TaskType } from '@/types/task';
import { toast } from '@/hooks/use-toast';
import { logStatusChange, logAssigneeChange, logPriorityChange, logDueDateChange, logTaskCreated, logComment } from '@/utils/activityLogger';

const TASK_ATTACHMENTS_BUCKET = 'task-attachments';

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

export const useTasks = (projectId: string) => {
  const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching tasks for project:', projectId);

      if (!projectId) {
        setTasks([]);
        setIsLoading(false);
        return;
      }

      // Fetch main tasks (no parent)
      const tasksResponse = await databases.listDocuments(
        DATABASE_ID,
        'tasks',
        [Query.equal('project_id', projectId), Query.isNull('parent_task_id'), Query.orderDesc('$createdAt')]
      );
      const tasksData = tasksResponse.documents;

      // Fetch subtasks
      let subtasksData: any[] = [];
      try {
        const subtasksResponse = await databases.listDocuments(
          DATABASE_ID,
          'tasks',
          [Query.equal('project_id', projectId), Query.orderDesc('$createdAt')]
        );
        subtasksData = subtasksResponse.documents.filter((t: any) => t.parent_task_id != null);
      } catch (e) {
        console.error('Error fetching subtasks:', e);
      }

      console.log('Fetched tasks data:', tasksData);
      console.log('Fetched subtasks data:', subtasksData);

      if (!tasksData) {
        setTasks([]);
        return;
      }

      // Fetch subtasks, comments, and attachments for each main task
      const tasksWithSubtasks = await Promise.all(
        tasksData.map(async (task: any) => {
          // Subtasks
          let subtasks: any[] = [];
          try {
            const subRes = await databases.listDocuments(
              DATABASE_ID,
              'tasks',
              [Query.equal('parent_task_id', task.$id), Query.orderDesc('$createdAt')]
            );
            subtasks = subRes.documents;
          } catch (e) {
            // no subtasks
          }

          // Comments
          let task_comments: any[] = [];
          try {
            const commentsRes = await databases.listDocuments(
              DATABASE_ID,
              'task_comments',
              [Query.equal('task_id', task.$id)]
            );
            task_comments = commentsRes.documents;
          } catch (e) {
            // no comments
          }

          // Attachments
          let task_attachments: any[] = [];
          try {
            const attachRes = await databases.listDocuments(
              DATABASE_ID,
              'task_attachments',
              [Query.equal('task_id', task.$id)]
            );
            task_attachments = attachRes.documents;
          } catch (e) {
            // no attachments
          }

          return {
            ...task,
            id: task.$id,
            task_comments,
            task_attachments,
            subtasks
          };
        })
      );

      const transformedTasks: TaskWithRelations[] = tasksWithSubtasks.map(task => ({
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
        comments: task.task_comments?.map((comment: any) => ({
          ...comment,
          id: comment.$id,
          created_at: new Date(comment.$createdAt),
          updated_at: new Date(comment.$updatedAt),
        })) || [],
        attachments: task.task_attachments?.map((attachment: any) => ({
          ...attachment,
          id: attachment.$id,
          created_at: new Date(attachment.$createdAt),
        })) || [],
        subtasks: task.subtasks?.map((subtask: any) => ({
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
        })) || [],
      }));

      console.log('Transformed tasks:', transformedTasks);
      setTasks(transformedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createTask = async (taskData: Partial<Task> & { parent_task_id?: string }) => {
    try {
      let user;
      try {
        user = await account.get();
      } catch {
        toast({
          title: "Error",
          description: "You must be logged in to create tasks",
          variant: "destructive",
        });
        return null;
      }

      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create tasks",
          variant: "destructive",
        });
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

      // Log task creation activity
      await logTaskCreated(data.$id);

      toast({
        title: "Success",
        description: "Task created successfully",
      });

      await fetchTasks();
      return data;
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      // Get current task data for comparison
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

      await databases.updateDocument(DATABASE_ID, 'tasks', taskId, processedUpdates);

      // Log activity based on what changed
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

        // Log assignee changes
        if (updates.assignees !== undefined) {
          const oldAssignees = currentTask.assignees || [];
          const newAssignees = updates.assignees || [];

          // Find added assignees
          const addedAssignees = newAssignees.filter(id => !oldAssignees.includes(id));
          const removedAssignees = oldAssignees.filter(id => !newAssignees.includes(id));

          for (const assigneeId of addedAssignees) {
            await logAssigneeChange(taskId, 'added', 'User');
          }

          for (const assigneeId of removedAssignees) {
            await logAssigneeChange(taskId, 'removed', 'User');
          }
        }
      }

      toast({
        title: "Success",
        description: "Task updated successfully",
      });

      await fetchTasks();
      return true;
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await databases.deleteDocument(DATABASE_ID, 'tasks', taskId);

      toast({
        title: "Success",
        description: "Task deleted successfully",
      });

      await fetchTasks();
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
      return false;
    }
  };

  const addComment = async (taskId: string, content: string) => {
    try {
      let user;
      try {
        user = await account.get();
      } catch {
        toast({
          title: "Error",
          description: "You must be logged in to add comments",
          variant: "destructive",
        });
        return false;
      }

      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to add comments",
          variant: "destructive",
        });
        return false;
      }

      await databases.createDocument(DATABASE_ID, 'task_comments', ID.unique(), {
        task_id: taskId,
        content,
        user_id: user.$id,
      });

      // Log the comment activity and create notifications
      await logComment(taskId, content);

      await fetchTasks();
      return true;
    } catch (error) {
      console.error('Error adding comment:', error);
      return false;
    }
  };

  const uploadAttachment = async (taskId: string, file: File) => {
    try {
      console.log('Starting file upload for task:', taskId, 'file:', file.name);

      let user;
      try {
        user = await account.get();
      } catch {
        toast({
          title: "Error",
          description: "You must be logged in to upload files",
          variant: "destructive",
        });
        return false;
      }

      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to upload files",
          variant: "destructive",
        });
        return false;
      }

      // Upload file to Appwrite storage
      const uploadedFile = await storage.createFile(
        TASK_ATTACHMENTS_BUCKET,
        ID.unique(),
        file
      );

      console.log('File uploaded successfully, getting URL');

      // Get file view URL
      const fileUrl = storage.getFileView(TASK_ATTACHMENTS_BUCKET, uploadedFile.$id);

      console.log('File URL:', fileUrl);

      // Save attachment record to database
      await databases.createDocument(DATABASE_ID, 'task_attachments', ID.unique(), {
        task_id: taskId,
        user_id: user.$id,
        file_name: file.name,
        file_url: fileUrl,
        file_size: file.size,
        file_type: file.type,
      });

      console.log('Attachment record saved successfully');

      toast({
        title: "Success",
        description: "File uploaded successfully",
      });

      await fetchTasks();
      return true;
    } catch (error) {
      console.error('Error uploading attachment:', error);
      toast({
        title: "Error",
        description: "Failed to upload attachment",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchTasks();
    } else {
      setTasks([]);
      setIsLoading(false);
    }
  }, [projectId]);

  return {
    tasks,
    isLoading,
    fetchTasks,
    createTask,
    createSubtask: async (subtaskData: any) => {
      try {
        let user;
        try {
          user = await account.get();
        } catch {
          toast({
            title: "Error",
            description: "You must be logged in to create subtasks",
            variant: "destructive",
          });
          return;
        }

        if (!user) {
          toast({
            title: "Error",
            description: "You must be logged in to create subtasks",
            variant: "destructive",
          });
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

        toast({
          title: "Success",
          description: "Subtask created successfully",
        });

        await fetchTasks();
      } catch (error: any) {
        console.error('Error creating subtask:', error);
        toast({
          title: "Error",
          description: "Failed to create subtask: " + (error.message || ""),
          variant: "destructive",
        });
      }
    },
    updateTask,
    deleteTask,
    addComment,
    uploadAttachment,
  };
};
