
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
        console.log("No authenticated user found");
        setUserRole(null);
        setIsLoading(false);
        return;
      }

      console.log("Fetching role for user:", user.id);

      // First try to get the role directly from user_roles table
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user role:", error);
        // Try using the RPC function as fallback
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('get_user_role', { _user_id: user.id });
        
        if (rpcError) {
          console.error("Error calling get_user_role RPC:", rpcError);
          setUserRole(null);
        } else {
          console.log("RPC returned role:", rpcData);
          setUserRole(rpcData || null);
        }
      } else {
        console.log("Direct query returned role:", data?.role);
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fetchUserRole();
      } else if (event === 'SIGNED_OUT') {
        setUserRole(null);
        setIsLoading(false);
      }
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

  // Add debugging info
  console.log("Current user role:", userRole, "isLoading:", isLoading);

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
