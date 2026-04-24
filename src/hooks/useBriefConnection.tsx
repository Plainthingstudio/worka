
import { useState } from 'react';
import { account, databases, DATABASE_ID, Query } from '@/integrations/appwrite/client';
import { toast } from '@/hooks/use-toast';
import { Brief } from '@/types/brief';
import { mergeBriefPayload } from '@/utils/briefPayload';

export const useBriefConnection = () => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchAvailableBriefs = async (): Promise<Brief[]> => {
    try {
      let user;
      try {
        user = await account.get();
      } catch {
        return [];
      }
      if (!user) return [];

      console.log('Fetching briefs for user:', user.$id);

      // Fetch briefs from both brief tables for the current user
      let allBriefs: Brief[] = [];

      try {
        const gdResponse = await databases.listDocuments(
          DATABASE_ID,
          'graphic_design_briefs',
          [Query.equal('user_id', user.$id)]
        );
        allBriefs = allBriefs.concat(
          gdResponse.documents.map((b: any) => ({ ...mergeBriefPayload(b), id: b.$id, type: 'Graphic Design' }))
        );
      } catch (e) {
        console.error('Error fetching graphic design briefs:', e);
      }

      try {
        const uiResponse = await databases.listDocuments(
          DATABASE_ID,
          'ui_design_briefs',
          [Query.equal('user_id', user.$id)]
        );
        allBriefs = allBriefs.concat(
          uiResponse.documents.map((b: any) => ({ ...mergeBriefPayload(b), id: b.$id, type: 'UI Design' }))
        );
      } catch (e) {
        console.error('Error fetching UI design briefs:', e);
      }

      try {
        const illResponse = await databases.listDocuments(
          DATABASE_ID,
          'illustration_design_briefs',
          [Query.equal('user_id', user.$id)]
        );
        allBriefs = allBriefs.concat(
          illResponse.documents.map((b: any) => ({ ...mergeBriefPayload(b), id: b.$id, type: 'Illustration Design' }))
        );
      } catch (e) {
        console.error('Error fetching illustration briefs:', e);
      }

      console.log('Briefs fetched successfully:', allBriefs.length);
      return allBriefs;
    } catch (error) {
      console.error('Error fetching available briefs:', error);
      return [];
    }
  };

  const connectBriefToTask = async (taskId: string, briefId: string, briefType: string) => {
    try {
      setIsLoading(true);

      console.log('Connecting brief to task:', { taskId, briefId, briefType });

      await databases.updateDocument(DATABASE_ID, 'tasks', taskId, {
        brief_id: briefId,
        brief_type: briefType,
      });

      console.log('Brief connected successfully');
      toast({
        title: "Success",
        description: "Brief connected to task successfully",
      });

      return true;
    } catch (error: any) {
      console.error('Error connecting brief to task:', error);
      toast({
        title: "Error",
        description: `Failed to connect brief to task: ${error.message || ''}`,
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

      await databases.updateDocument(DATABASE_ID, 'tasks', taskId, {
        brief_id: null,
        brief_type: null,
      });

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
      if (!briefId || !briefType) {
        console.warn('Cannot fetch brief details without both brief ID and type:', { briefId, briefType });
        return null;
      }

      const tableName = briefType === 'Graphic Design'
        ? 'graphic_design_briefs'
        : briefType === 'UI Design'
          ? 'ui_design_briefs'
          : 'illustration_design_briefs';
      const doc = await databases.getDocument(DATABASE_ID, tableName, briefId);
      return {
        ...mergeBriefPayload(doc),
        id: doc.$id,
        type: briefType,
      };
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
