
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { TeamMember, TeamPosition } from "@/types";
import { account, databases, DATABASE_ID, Query } from "@/integrations/appwrite/client";

export const useTeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetched = useRef(false);

  const fetchTeamMembers = async () => {
    // Prevent multiple simultaneous fetches
    if (hasFetched.current) {
      return teamMembers;
    }

    try {
      hasFetched.current = true;
      setIsLoading(true);

      let session;
      try {
        session = await account.getSession('current');
      } catch {
        toast.error("You must be logged in to view team members");
        return [];
      }

      if (!session) {
        toast.error("You must be logged in to view team members");
        return [];
      }

      // Fetch team members
      const teamResponse = await databases.listDocuments(
        DATABASE_ID,
        'team_members',
        [Query.orderDesc('$createdAt')]
      );

      // Get all user roles
      let rolesMap = new Map<string, string>();
      try {
        const rolesResponse = await databases.listDocuments(DATABASE_ID, 'user_roles');
        rolesResponse.documents.forEach((role: any) => {
          rolesMap.set(role.user_id, role.role);
        });
      } catch (e) {
        // roles may not exist
      }

      const transformedMembers: TeamMember[] = teamResponse.documents.map((member: any) => {
        const role = rolesMap.get(member.user_id);

        return {
          id: member.$id,
          user_id: member.user_id,
          name: member.name,
          position: member.position as TeamPosition,
          startDate: new Date(member.start_date),
          skills: member.skills || [],
          createdAt: new Date(member.$createdAt),
          role: role,
          email: null
        };
      });

      setTeamMembers(transformedMembers);
      return transformedMembers;
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast.error("Failed to load team members");
      hasFetched.current = false; // Reset on error to allow retry
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch on mount
  useEffect(() => {
    if (!hasFetched.current && teamMembers.length === 0) {
      fetchTeamMembers();
    }
  }, []);

  return { teamMembers, fetchTeamMembers, isLoading };
};
