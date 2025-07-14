
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type UserRole = 'owner' | 'administrator' | 'team' | null;

export const useUserRole = () => {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserRole = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No authenticated user found');
        setUserRole(null);
        setIsLoading(false);
        return;
      }

      console.log('Fetching role for user:', user.id);

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No role found - user might be new
          console.log('No role found for user');
          setUserRole(null);
        } else {
          console.error('Error fetching user role:', error);
          setUserRole(null);
        }
      } else {
        console.log('User role fetched:', data.role);
        setUserRole(data.role as UserRole);
      }
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      setUserRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchUserRole();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      if (session) {
        fetchUserRole();
      } else {
        setUserRole(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Log current state for debugging
  useEffect(() => {
    console.log('Current user role:', userRole, 'isLoading:', isLoading);
  }, [userRole, isLoading]);

  const canViewTeam = userRole === 'owner' || userRole === 'administrator';
  const canViewProjects = userRole === 'owner' || userRole === 'administrator' || userRole === 'team';

  return {
    userRole,
    isLoading,
    canViewTeam,
    canViewProjects,
    fetchUserRole
  };
};
