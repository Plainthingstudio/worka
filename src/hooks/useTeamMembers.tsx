
import { useState } from "react";
import { toast } from "sonner";
import { TeamMember, TeamPosition } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const useTeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true);
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast.error("You must be logged in to view team members");
        return [];
      }

      // Fetch team members with profile data
      const { data: teamData, error: teamError } = await supabase
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: false });

      if (teamError) {
        throw teamError;
      }

      // Get all user roles
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id, role');

      // Create a map of user_id to role
      const rolesMap = new Map<string, string>();
      rolesData?.forEach((role: any) => {
        rolesMap.set(role.user_id, role.role);
      });

      const transformedMembers: TeamMember[] = (teamData || []).map((member: any) => {
        const role = rolesMap.get(member.user_id);
        
        return {
          id: member.id,
          user_id: member.user_id,
          name: member.name,
          position: member.position as TeamPosition,
          startDate: new Date(member.start_date),
          skills: member.skills || [],
          createdAt: new Date(member.created_at),
          role: role,
          email: null
        };
      });

      setTeamMembers(transformedMembers);
      return transformedMembers;
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast.error("Failed to load team members");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return { teamMembers, fetchTeamMembers, isLoading };
};
