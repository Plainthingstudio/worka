
import { useState, useEffect } from 'react';
import { account, databases, storage, DATABASE_ID, ID, Query } from '@/integrations/appwrite/client';
import { toast } from '@/hooks/use-toast';
import { logComment } from '@/utils/activityLogger';
import { parseJsonField } from "@/utils/appwriteJson";

const TASK_ATTACHMENTS_BUCKET = 'task-attachments';

interface TaskActivity {
  id: string;
  task_id: string;
  user_id: string;
  activity_type: 'comment' | 'status_change' | 'assignee_change' | 'priority_change' | 'attachment' | 'task_created' | 'due_date_change' | 'task_updated';
  content?: string | null;
  metadata: any;
  attachments: any[];
  created_at: Date;
  user_name?: string;
  user_email?: string;
}

export const useTaskActivities = (taskId: string) => {
  const [activities, setActivities] = useState<TaskActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActivities = async () => {
    if (!taskId) return;

    try {
      setIsLoading(true);
      console.log('Fetching activities for task:', taskId);

      // Fetch activities
      const activitiesResponse = await databases.listDocuments(
        DATABASE_ID,
        'task_activities',
        [Query.equal('task_id', taskId), Query.orderDesc('$createdAt')]
      );
      const activitiesData = activitiesResponse.documents;

      if (!activitiesData || activitiesData.length === 0) {
        console.log('No activities found for task:', taskId);
        setActivities([]);
        return;
      }

      console.log('Raw activities data:', activitiesData);

      // Get unique user IDs
      const userIds = [...new Set(activitiesData.map((activity: any) => activity.user_id))];
      console.log('Unique user IDs from activities:', userIds);

      // Fetch user profiles
      const profilesMap = new Map();
      try {
        const profilesResponse = await databases.listDocuments(
          DATABASE_ID,
          'profiles',
          [Query.equal('$id', userIds as string[])]
        );
        profilesResponse.documents.forEach((profile: any) => {
          profilesMap.set(profile.$id, profile);
        });
      } catch (e) {
        console.error('Error fetching profiles:', e);
      }

      const transformedActivities: TaskActivity[] = activitiesData.map((activity: any) => {
        const profile = profilesMap.get(activity.user_id);

        let displayName = 'Unknown User';
        if (profile?.full_name && profile.full_name.trim()) {
          displayName = profile.full_name.trim();
        } else if (profile?.email && profile.email.trim()) {
          displayName = profile.email.split('@')[0];
        }

        return {
          ...activity,
          id: activity.$id,
          activity_type: activity.activity_type as TaskActivity['activity_type'],
          metadata: parseJsonField(activity.metadata, {}),
          attachments: parseJsonField(activity.attachments, []),
          created_at: new Date(activity.$createdAt),
          user_name: displayName,
          user_email: profile?.email || '',
        };
      });
      setActivities(transformedActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast({
        title: "Error",
        description: "Failed to fetch activities",
        variant: "destructive",
      });
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
        let user;
        try {
          user = await account.get();
        } catch {
          continue;
        }
        if (!user) continue;

        try {
          const uploadedFile = await storage.createFile(
            TASK_ATTACHMENTS_BUCKET,
            ID.unique(),
            file
          );

          const fileUrl = storage.getFileView(TASK_ATTACHMENTS_BUCKET, uploadedFile.$id);

          uploadedAttachments.push({
            file_name: file.name,
            file_url: fileUrl,
            file_size: file.size,
            file_type: file.type
          });
        } catch (uploadError) {
          console.error('Error uploading file:', uploadError);
          continue;
        }
      }

      // Log the activity with comment and/or attachments
      const success = await logComment(taskId, content, uploadedAttachments);

      if (success) {
        await fetchActivities();
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
      console.log('Attempting to update activity:', activityId, 'with content:', content);

      await databases.updateDocument(DATABASE_ID, 'task_activities', activityId, {
        content: content.trim()
      });

      console.log('Update successful');

      await fetchActivities();
      toast({
        title: "Success",
        description: "Comment updated successfully",
      });
      return true;
    } catch (error: any) {
      console.error('Exception updating activity:', error);
      toast({
        title: "Error",
        description: `Failed to update comment: ${error.message || ''}`,
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteActivity = async (activityId: string): Promise<boolean> => {
    try {
      await databases.deleteDocument(DATABASE_ID, 'task_activities', activityId);

      await fetchActivities();
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
