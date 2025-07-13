
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { TeamMember, TeamPosition } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const useTeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTeamMembers = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast.error("You must be logged in to view team members");
        return [];
      }

      console.log("Fetching team members...");

      // Fetch team members with profile data using a left join
      const { data: teamData, error: teamError } = await supabase
        .from('team_members')
        .select(`
          *,
          profiles(email, full_name)
        `)
        .order('created_at', { ascending: false });

      if (teamError) {
        console.error("Error fetching team data:", teamError);
        throw teamError;
      }

      console.log("Team data fetched:", teamData);

      // Get all user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        console.error("Error fetching roles:", rolesError);
      }

      // Create a map of user_id to role
      const rolesMap = new Map<string, string>();
      rolesData?.forEach((role: any) => {
        rolesMap.set(role.user_id, role.role);
      });

      const transformedMembers: TeamMember[] = (teamData || []).map((member: any) => {
        const role = rolesMap.get(member.user_id);
        
        console.log("Processing member:", {
          id: member.id,
          name: member.name,
          user_id: member.user_id,
          profiles: member.profiles,
          role: role
        });
        
        return {
          id: member.id,
          name: member.name,
          position: member.position as TeamPosition,
          startDate: new Date(member.start_date),
          skills: member.skills || [],
          createdAt: new Date(member.created_at),
          role: role,
          email: member.profiles?.email || null
        };
      });

      console.log("Transformed members:", transformedMembers);
      setTeamMembers(transformedMembers);
      return transformedMembers;
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast.error("Failed to load team members");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { teamMembers, fetchTeamMembers, isLoading };
};
