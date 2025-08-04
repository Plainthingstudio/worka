
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
  user_name?: string;  // Add user name field
  user_email?: string; // Add user email field
}

export const useTaskActivities = (taskId: string) => {
  const [activities, setActivities] = useState<TaskActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActivities = async () => {
    if (!taskId) return;
    
    try {
      setIsLoading(true);
      console.log('Fetching activities for task:', taskId);
      
      // First fetch activities
      const { data: activitiesData, error } = await supabase
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

      if (!activitiesData || activitiesData.length === 0) {
        console.log('No activities found for task:', taskId);
        setActivities([]);
        return;
      }

      console.log('Raw activities data:', activitiesData);

      // Get unique user IDs
      const userIds = [...new Set(activitiesData.map(activity => activity.user_id))];
      console.log('Unique user IDs from activities:', userIds);
      
      // Fetch user profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      // Create a map of user profiles
      const profilesMap = new Map();
      if (profilesData) {
        profilesData.forEach(profile => {
          profilesMap.set(profile.id, profile);
        });
      }

      const transformedActivities: TaskActivity[] = activitiesData.map(activity => {
        const profile = profilesMap.get(activity.user_id);
        
        // Try full_name first, then email username, then fallback
        let displayName = 'Unknown User';
        if (profile?.full_name && profile.full_name.trim()) {
          displayName = profile.full_name.trim();
        } else if (profile?.email && profile.email.trim()) {
          displayName = profile.email.split('@')[0];
        }
        
        return {
          ...activity,
          activity_type: activity.activity_type as TaskActivity['activity_type'],
          attachments: Array.isArray(activity.attachments) ? activity.attachments : [],
          created_at: new Date(activity.created_at),
          user_name: displayName,
          user_email: profile?.email || '',
        };
      });
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

  const updateActivity = async (activityId: string, content: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('task_activities')
        .update({ 
          content: content.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', activityId);

      if (error) {
        console.error('Error updating activity:', error);
        toast({
          title: "Error",
          description: "Failed to update comment",
          variant: "destructive",
        });
        return false;
      }

      await fetchActivities(); // Refresh activities
      toast({
        title: "Success",
        description: "Comment updated successfully",
      });
      return true;
    } catch (error) {
      console.error('Error updating activity:', error);
      toast({
        title: "Error", 
        description: "Failed to update comment",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteActivity = async (activityId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('task_activities')
        .delete()
        .eq('id', activityId);

      if (error) {
        console.error('Error deleting activity:', error);
        toast({
          title: "Error",
          description: "Failed to delete comment",
          variant: "destructive",
        });
        return false;
      }

      await fetchActivities(); // Refresh activities
      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });
      return true;
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment", 
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
    updateActivity,
    deleteActivity,
  };
};
