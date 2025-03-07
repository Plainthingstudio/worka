
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

      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const transformedMembers: TeamMember[] = data.map(member => ({
        id: member.id,
        name: member.name,
        position: member.position as TeamPosition,
        startDate: new Date(member.start_date),
        skills: member.skills || [],
        createdAt: new Date(member.created_at)
      }));

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
