
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Task, TaskComment, TaskAttachment, TaskWithRelations, TaskStatus, TaskPriority, TaskType } from '@/types/task';
import { toast } from '@/hooks/use-toast';
import { logStatusChange, logAssigneeChange, logPriorityChange, logDueDateChange, logTaskCreated } from '@/utils/activityLogger';

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

      // First fetch main tasks (no parent)
      const { data: tasksData, error } = await supabase
        .from('tasks')
        .select(`
          *,
          task_comments(*),
          task_attachments(*)
        `)
        .eq('project_id', projectId)
        .is('parent_task_id', null)
        .order('created_at', { ascending: false });

      // Also fetch subtasks for each task
      const { data: subtasksData } = await supabase
        .from('tasks')
        .select(`
          *,
          task_comments(*),
          task_attachments(*)
        `)
        .eq('project_id', projectId)
        .not('parent_task_id', 'is', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error);
        toast({
          title: "Error",
          description: "Failed to fetch tasks: " + error.message,
          variant: "destructive",
        });
        return;
      }

      console.log('Fetched tasks data:', tasksData);
      console.log('Fetched subtasks data:', subtasksData);

      if (!tasksData) {
        setTasks([]);
        return;
      }

      // Now fetch subtasks separately for each main task
      const tasksWithSubtasks = await Promise.all(
        tasksData.map(async (task) => {
          const { data: subtasks } = await supabase
            .from('tasks')
            .select(`
              *,
              task_comments(*),
              task_attachments(*)
            `)
            .eq('parent_task_id', task.id)
            .order('created_at', { ascending: false });

          return {
            ...task,
            subtasks: subtasks || []
          };
        })
      );

      const transformedTasks: TaskWithRelations[] = tasksWithSubtasks.map(task => ({
        ...task,
        status: task.status as TaskStatus,
        priority: task.priority as TaskPriority,
        task_type: task.task_type as TaskType,
        due_date: task.due_date ? new Date(task.due_date) : undefined,
        completed_at: task.completed_at ? new Date(task.completed_at) : undefined,
        created_at: new Date(task.created_at),
        updated_at: new Date(task.updated_at),
        brief_id: task.brief_id,
        brief_type: task.brief_type,
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create tasks",
          variant: "destructive",
        });
        return null;
      }

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
        user_id: user.id,
        brief_id: taskData.brief_id,
        brief_type: taskData.brief_type,
        parent_task_id: taskData.parent_task_id,
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

      // Log task creation activity
      await logTaskCreated(data.id);

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
      if (updates.due_date !== undefined) processedUpdates.due_date = updates.due_date?.toISOString();
      if (updates.completed_at !== undefined) processedUpdates.completed_at = updates.completed_at?.toISOString();
      if (updates.brief_id !== undefined) processedUpdates.brief_id = updates.brief_id;
      if (updates.brief_type !== undefined) processedUpdates.brief_type = updates.brief_type;

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

      // Log activity based on what changed
      if (currentTask) {
        if (updates.status !== undefined && updates.status !== currentTask.status) {
          await logStatusChange(taskId, currentTask.status, updates.status);
        }
        
        if (updates.priority !== undefined && updates.priority !== currentTask.priority) {
          await logPriorityChange(taskId, currentTask.priority, updates.priority);
        }
        
        if (updates.due_date !== undefined) {
          const oldDate = currentTask.due_date;
          const newDate = updates.due_date;
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
            await logAssigneeChange(taskId, 'added', 'User'); // Would need team member lookup for name
          }
          
          for (const assigneeId of removedAssignees) {
            await logAssigneeChange(taskId, 'removed', 'User'); // Would need team member lookup for name
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to add comments",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from('task_comments')
        .insert([{
          task_id: taskId,
          content,
          user_id: user.id,
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
      console.log('Starting file upload for task:', taskId, 'file:', file.name);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to upload files",
          variant: "destructive",
        });
        return false;
      }

      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${taskId}/${Date.now()}.${fileExt}`;
      
      console.log('Uploading file to path:', fileName);

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('task-attachments')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        toast({
          title: "Error",
          description: `Failed to upload file: ${uploadError.message}`,
          variant: "destructive",
        });
        return false;
      }

      console.log('File uploaded successfully, getting public URL');

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('task-attachments')
        .getPublicUrl(fileName);

      console.log('Public URL:', publicUrl);

      // Save attachment record to database  
      const { error: dbError } = await supabase
        .from('task_attachments')
        .insert([{
          task_id: taskId,
          user_id: user.id,
          file_name: file.name,
          file_url: publicUrl,
          file_size: file.size,
          file_type: file.type,
        }]);

      if (dbError) {
        console.error('Error saving attachment record:', dbError);
        toast({
          title: "Error",
          description: `Failed to save attachment record: ${dbError.message}`,
          variant: "destructive",
        });
        return false;
      }

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
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast({
            title: "Error",
            description: "You must be logged in to create subtasks",
            variant: "destructive",
          });
          return;
        }

        const insertData = {
          title: subtaskData.title || '',
          description: subtaskData.description,
          status: subtaskData.status || 'Planning',
          priority: subtaskData.priority,
          task_type: subtaskData.task_type,
          assignees: subtaskData.assignees || [],
          due_date: subtaskData.due_date,
          parent_task_id: subtaskData.parent_task_id,
          project_id: projectId,
          user_id: user.id,
        };

        const { data, error } = await supabase
          .from('tasks')
          .insert([insertData])
          .select()
          .single();

        if (error) {
          console.error('Error creating subtask:', error);
          toast({
            title: "Error",
            description: "Failed to create subtask: " + error.message,
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Success",
          description: "Subtask created successfully",
        });

        await fetchTasks();
      } catch (error) {
        console.error('Error creating subtask:', error);
        toast({
          title: "Error",
          description: "Failed to create subtask",
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
