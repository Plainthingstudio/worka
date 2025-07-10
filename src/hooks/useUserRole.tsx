
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type UserRole = 'owner' | 'administrator' | 'team' | null;

export const useUserRole = () => {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setUserRole(null);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle(); // Use maybeSingle instead of single to handle no rows

      if (error) {
        console.error("Error fetching user role:", error);
        setUserRole(null);
      } else {
        setUserRole(data?.role || null);
      }
    } catch (error) {
      console.error("Error in fetchUserRole:", error);
      setUserRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRole();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUserRole();
    });

    return () => subscription.unsubscribe();
  }, []);

  const hasPermission = (requiredRole: UserRole | UserRole[]) => {
    if (!userRole) return false;
    
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return roles.includes(userRole);
  };

  const canManageTeam = () => userRole === 'owner';
  const canManageProjects = () => userRole === 'owner' || userRole === 'administrator';
  const canViewTeam = () => userRole === 'owner' || userRole === 'administrator' || userRole === 'team';
  const canViewProjects = () => userRole === 'owner' || userRole === 'administrator' || userRole === 'team';

  return {
    userRole,
    isLoading,
    hasPermission,
    canManageTeam,
    canManageProjects,
    canViewTeam,
    canViewProjects,
    refetchRole: fetchUserRole
  };
};
