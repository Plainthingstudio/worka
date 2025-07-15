
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { logComment } from '@/utils/activityLogger';

interface TaskActivity {
  id: string;
  task_id: string;
  user_id: string;
  activity_type: 'comment' | 'status_change' | 'assignee_change' | 'priority_change' | 'attachment' | 'task_created' | 'due_date_change' | 'task_updated';
  content?: string | null;
  metadata: any;
  attachments: any[];
  created_at: Date;
}

export const useTaskActivities = (taskId: string) => {
  const [activities, setActivities] = useState<TaskActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActivities = async () => {
    if (!taskId) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('task_activities')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching activities:', error);
        toast({
          title: "Error",
          description: "Failed to fetch activities",
          variant: "destructive",
        });
        return;
      }

      const transformedActivities: TaskActivity[] = data.map(activity => ({
        ...activity,
        activity_type: activity.activity_type as TaskActivity['activity_type'],
        attachments: Array.isArray(activity.attachments) ? activity.attachments : [],
        created_at: new Date(activity.created_at),
      }));

      setActivities(transformedActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addActivity = async (content: string, files: File[] = []): Promise<boolean> => {
    if (!content.trim() && files.length === 0) return false;

    try {
      // Handle file uploads first
      const uploadedAttachments = [];
      
      for (const file of files) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) continue;

        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${taskId}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('task-attachments')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('task-attachments')
          .getPublicUrl(fileName);

        uploadedAttachments.push({
          file_name: file.name,
          file_url: publicUrl,
          file_size: file.size,
          file_type: file.type
        });
      }

      // Log the activity with comment and/or attachments
      const success = await logComment(taskId, content, uploadedAttachments);
      
      if (success) {
        await fetchActivities(); // Refresh activities
        toast({
          title: "Success",
          description: files.length > 0 ? "Comment and files added successfully" : "Comment added successfully",
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error adding activity:', error);
      toast({
        title: "Error",
        description: "Failed to add activity",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [taskId]);

  return {
    activities,
    isLoading,
    fetchActivities,
    addActivity,
  };
};
