
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TeamMember {
  id: string;
  user_id: string;
  name: string;
}

export const useAssigneeNames = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('id, user_id, name');

        if (error) {
          console.error('Error fetching team members:', error);
          return;
        }

        setTeamMembers(data || []);
      } catch (error) {
        console.error('Error fetching team members:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  const getAssigneeNames = (assigneeIds: (string | number)[]): string[] => {
    if (!assigneeIds || assigneeIds.length === 0) return [];
    
    return assigneeIds.map(id => {
      // Convert to string for comparison
      const stringId = String(id);
      
      // First try to find by user_id
      const memberByUserId = teamMembers.find(member => member.user_id === stringId);
      if (memberByUserId) {
        return memberByUserId.name;
      }
      
      // Then try to find by id
      const memberById = teamMembers.find(member => member.id === stringId);
      if (memberById) {
        return memberById.name;
      }
      
      // If no match found, return the ID as fallback
      console.log(`No team member found for ID: ${stringId}`);
      return `User ${id}`;
    });
  };

  return { getAssigneeNames, isLoading };
};
