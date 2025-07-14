import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Task, TaskComment, TaskAttachment, TaskWithRelations, TaskStatus, TaskPriority, TaskType } from '@/types/task';
import { toast } from '@/hooks/use-toast';

export const useTasks = (projectId: string) => {
  const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const { data: tasksData, error } = await supabase
        .from('tasks')
        .select(`
          *,
          task_comments(*),
          task_attachments(*),
          subtasks:tasks!tasks_parent_task_id_fkey(*)
        `)
        .eq('project_id', projectId)
        .is('parent_task_id', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error);
        toast({
          title: "Error",
          description: "Failed to fetch tasks",
          variant: "destructive",
        });
        return;
      }

      const transformedTasks: TaskWithRelations[] = tasksData.map(task => ({
        ...task,
        status: task.status as TaskStatus,
        priority: task.priority as TaskPriority,
        task_type: task.task_type as TaskType,
        due_date: task.due_date ? new Date(task.due_date) : undefined,
        completed_at: task.completed_at ? new Date(task.completed_at) : undefined,
        created_at: new Date(task.created_at),
        updated_at: new Date(task.updated_at),
        comments: task.task_comments?.map((comment: any) => ({
          ...comment,
          created_at: new Date(comment.created_at),
          updated_at: new Date(comment.updated_at),
        })) || [],
        attachments: task.task_attachments?.map((attachment: any) => ({
          ...attachment,
          created_at: new Date(attachment.created_at),
        })) || [],
        subtasks: task.subtasks?.map((subtask: any) => ({
          ...subtask,
          status: subtask.status as TaskStatus,
          priority: subtask.priority as TaskPriority,
          task_type: subtask.task_type as TaskType,
          due_date: subtask.due_date ? new Date(subtask.due_date) : undefined,
          completed_at: subtask.completed_at ? new Date(subtask.completed_at) : undefined,
          created_at: new Date(subtask.created_at),
          updated_at: new Date(subtask.updated_at),
        })) || [],
      }));

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

  const createTask = async (taskData: Partial<Task>) => {
    try {
      const insertData = {
        title: taskData.title || '',
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        task_type: taskData.task_type,
        due_date: taskData.due_date?.toISOString(),
        completed_at: taskData.completed_at?.toISOString(),
        assignees: taskData.assignees,
        project_id: projectId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Error creating task:', error);
        toast({
          title: "Error",
          description: "Failed to create task",
          variant: "destructive",
        });
        return null;
      }

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
      const processedUpdates: any = {};
      
      if (updates.title !== undefined) processedUpdates.title = updates.title;
      if (updates.description !== undefined) processedUpdates.description = updates.description;
      if (updates.status !== undefined) processedUpdates.status = updates.status;
      if (updates.priority !== undefined) processedUpdates.priority = updates.priority;
      if (updates.task_type !== undefined) processedUpdates.task_type = updates.task_type;
      if (updates.assignees !== undefined) processedUpdates.assignees = updates.assignees;
      if (updates.due_date !== undefined) processedUpdates.due_date = updates.due_date?.toISOString();
      if (updates.completed_at !== undefined) processedUpdates.completed_at = updates.completed_at?.toISOString();

      const { error } = await supabase
        .from('tasks')
        .update(processedUpdates)
        .eq('id', taskId);

      if (error) {
        console.error('Error updating task:', error);
        toast({
          title: "Error",
          description: "Failed to update task",
          variant: "destructive",
        });
        return false;
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
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error('Error deleting task:', error);
        toast({
          title: "Error",
          description: "Failed to delete task",
          variant: "destructive",
        });
        return false;
      }

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
      const { error } = await supabase
        .from('task_comments')
        .insert([{
          task_id: taskId,
          content,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        }]);

      if (error) {
        console.error('Error adding comment:', error);
        toast({
          title: "Error",
          description: "Failed to add comment",
          variant: "destructive",
        });
        return false;
      }

      await fetchTasks();
      return true;
    } catch (error) {
      console.error('Error adding comment:', error);
      return false;
    }
  };

  const uploadAttachment = async (taskId: string, file: File) => {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${taskId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('task-attachments')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        toast({
          title: "Error",
          description: "Failed to upload file",
          variant: "destructive",
        });
        return false;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('task-attachments')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('task_attachments')
        .insert([{
          task_id: taskId,
          user_id: userId,
          file_name: file.name,
          file_url: publicUrl,
          file_size: file.size,
          file_type: file.type,
        }]);

      if (dbError) {
        console.error('Error saving attachment record:', dbError);
        toast({
          title: "Error",
          description: "Failed to save attachment",
          variant: "destructive",
        });
        return false;
      }

      await fetchTasks();
      return true;
    } catch (error) {
      console.error('Error uploading attachment:', error);
      return false;
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchTasks();
    }
  }, [projectId]);

  return {
    tasks,
    isLoading,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    addComment,
    uploadAttachment,
  };
};