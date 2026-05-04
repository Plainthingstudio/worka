import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { account, databases, DATABASE_ID, Query, client } from "@/integrations/appwrite/client";

export type UserRole = 'owner' | 'administrator' | 'team' | null;

export const userRoleQueryKey = ["userRole"] as const;

const fetchUserRoleFromAppwrite = async (): Promise<UserRole> => {
  try {
    const user = await account.get();

    const response = await databases.listDocuments(DATABASE_ID, "user_roles", [
      Query.equal("user_id", user.$id),
    ]);

    if (response.total === 0) {
      return null;
    }

    return response.documents[0].role as UserRole;
  } catch (error) {
    console.error('Error in fetchUserRole:', error);
    return null;
  }
};

export const useUserRole = () => {
  const queryClient = useQueryClient();

  const { data: userRole = null, isLoading, refetch } = useQuery({
    queryKey: userRoleQueryKey,
    queryFn: fetchUserRoleFromAppwrite,
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    const unsubscribe = client.subscribe("account", (response) => {
      const events = response.events as string[];
      if (events.some((e) => e.includes("sessions.create"))) {
        queryClient.invalidateQueries({ queryKey: userRoleQueryKey });
      } else if (events.some((e) => e.includes("sessions.delete"))) {
        queryClient.setQueryData(userRoleQueryKey, null);
      }
    });

    return () => unsubscribe();
  }, [queryClient]);

  const canViewTeam = userRole === 'owner' || userRole === 'administrator';
  const canViewProjects = userRole === 'owner' || userRole === 'administrator';
  const canManageTeam = () => userRole === 'owner' || userRole === 'administrator';
  const canManageProjects = () => userRole === 'owner' || userRole === 'administrator';

  return {
    userRole,
    isLoading,
    canViewTeam,
    canViewProjects,
    canManageTeam,
    canManageProjects,
    fetchUserRole: refetch,
  };
};
