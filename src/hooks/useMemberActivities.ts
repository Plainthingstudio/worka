import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Models } from 'appwrite';
import { client, databases, DATABASE_ID, Query } from '@/integrations/appwrite/client';
import { normalizeMemberActivities } from '@/components/team/memberActivity';

const MEMBER_ACTIVITY_LIMIT = 100;

export const memberActivitiesQueryKey = (userId: string) => ['memberActivities', userId] as const;

const listRelatedDocuments = async (collectionId: string, ids: string[]): Promise<Models.Document[]> => {
  if (ids.length === 0) return [];

  const response = await databases.listDocuments(DATABASE_ID, collectionId, [
    Query.equal('$id', ids),
    Query.limit(Math.min(ids.length, MEMBER_ACTIVITY_LIMIT)),
  ]);
  return response.documents;
};

export const fetchMemberActivities = async (userId: string) => {
  const activitiesResponse = await databases.listDocuments(DATABASE_ID, 'task_activities', [
    Query.equal('user_id', userId),
    Query.orderDesc('$createdAt'),
    Query.limit(MEMBER_ACTIVITY_LIMIT),
  ]);

  if (activitiesResponse.documents.length === 0) return [];

  const taskIds = Array.from(
    new Set(activitiesResponse.documents.map((activity) => activity.task_id).filter(Boolean)),
  ) as string[];
  const taskDocs = await listRelatedDocuments('tasks', taskIds);
  const parentTaskIds = Array.from(
    new Set(taskDocs.map((task) => task.parent_task_id).filter(Boolean)),
  ) as string[];
  const missingParentIds = parentTaskIds.filter(
    (parentId) => !taskDocs.some((task) => task.$id === parentId),
  );
  const parentTaskDocs = await listRelatedDocuments('tasks', missingParentIds);
  const allTaskDocs = [...taskDocs, ...parentTaskDocs];
  const projectIds = Array.from(
    new Set(allTaskDocs.map((task) => task.project_id).filter(Boolean)),
  ) as string[];
  const projectDocs = await listRelatedDocuments('projects', projectIds);

  return normalizeMemberActivities(activitiesResponse.documents, allTaskDocs, projectDocs);
};

export const useMemberActivities = (userId: string) => {
  const queryClient = useQueryClient();
  const queryKey = memberActivitiesQueryKey(userId);
  const query = useQuery({
    queryKey,
    queryFn: () => fetchMemberActivities(userId),
    enabled: Boolean(userId),
  });

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = client.subscribe(
      [`databases.${DATABASE_ID}.collections.task_activities.documents`],
      () => queryClient.invalidateQueries({ queryKey: memberActivitiesQueryKey(userId) }),
    );
    return () => unsubscribe();
  }, [queryClient, userId]);

  return {
    activities: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
  };
};
