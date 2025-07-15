
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Brief } from '@/types/brief';

export const useBriefConnection = () => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchAvailableBriefs = async (): Promise<Brief[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Fetch all briefs using the existing function
      const { data, error } = await supabase.rpc('get_user_briefs', {
        user_uuid: user.id
      });

      if (error) {
        console.error('Error fetching briefs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching available briefs:', error);
      return [];
    }
  };

  const connectBriefToTask = async (taskId: string, briefId: string, briefType: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('tasks')
        .update({
          brief_id: briefId,
          brief_type: briefType,
        })
        .eq('id', taskId);

      if (error) {
        console.error('Error connecting brief to task:', error);
        toast({
          title: "Error",
          description: "Failed to connect brief to task",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Success",
        description: "Brief connected to task successfully",
      });

      return true;
    } catch (error) {
      console.error('Error connecting brief to task:', error);
      toast({
        title: "Error",
        description: "Failed to connect brief to task",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectBriefFromTask = async (taskId: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('tasks')
        .update({
          brief_id: null,
          brief_type: null,
        })
        .eq('id', taskId);

      if (error) {
        console.error('Error disconnecting brief from task:', error);
        toast({
          title: "Error",
          description: "Failed to disconnect brief from task",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Success",
        description: "Brief disconnected from task successfully",
      });

      return true;
    } catch (error) {
      console.error('Error disconnecting brief from task:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect brief from task",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBriefDetails = async (briefId: string, briefType: string) => {
    try {
      const { data, error } = await supabase.rpc('get_brief_details', {
        brief_id: briefId,
        brief_type: briefType
      });

      if (error) {
        console.error('Error fetching brief details:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching brief details:', error);
      return null;
    }
  };

  return {
    isLoading,
    fetchAvailableBriefs,
    connectBriefToTask,
    disconnectBriefFromTask,
    fetchBriefDetails,
  };
};
