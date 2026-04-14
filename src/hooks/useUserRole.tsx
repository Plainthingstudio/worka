
import { useState, useEffect } from "react";
import { account, databases, DATABASE_ID, Query, client } from "@/integrations/appwrite/client";

export type UserRole = 'owner' | 'administrator' | 'team' | null;

export const useUserRole = () => {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserRole = async () => {
    try {
      setIsLoading(true);
      const user = await account.get();

      console.log('Fetching role for user:', user.$id);

      const response = await databases.listDocuments(DATABASE_ID, "user_roles", [
        Query.equal("user_id", user.$id),
      ]);

      if (response.total === 0) {
        console.log('No role found for user');
        setUserRole(null);
      } else {
        const role = response.documents[0].role as UserRole;
        console.log('User role fetched:', role);
        setUserRole(role);
      }
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      setUserRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRole();

    const unsubscribe = client.subscribe("account", (response) => {
      const events = response.events as string[];
      if (events.some((e) => e.includes("sessions.create"))) {
        fetchUserRole();
      } else if (events.some((e) => e.includes("sessions.delete"))) {
        setUserRole(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Log current state for debugging
  useEffect(() => {
    console.log('Current user role:', userRole, 'isLoading:', isLoading);
  }, [userRole, isLoading]);

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
    fetchUserRole
  };
};
