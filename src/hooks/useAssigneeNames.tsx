
import { useState, useEffect } from 'react';
import { databases, DATABASE_ID, Query } from '@/integrations/appwrite/client';
import { getAvatarUrl } from '@/lib/avatars';

interface TeamMember {
  id: string;
  user_id: string;
  name: string;
  avatarUrl?: string;
}

const APPWRITE_PAGE_SIZE = 100;

const fetchAllDocuments = async (collectionId: string, queries: string[] = []) => {
  const documents: any[] = [];
  let offset = 0;

  while (true) {
    const response = await databases.listDocuments(DATABASE_ID, collectionId, [
      ...queries,
      Query.limit(APPWRITE_PAGE_SIZE),
      Query.offset(offset),
    ]);

    documents.push(...response.documents);

    if (response.documents.length < APPWRITE_PAGE_SIZE) {
      return documents;
    }

    offset += APPWRITE_PAGE_SIZE;
  }
};

export const useAssigneeNames = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const [documents, profileDocuments] = await Promise.all([
          fetchAllDocuments('team_members'),
          fetchAllDocuments('profiles'),
        ]);
        const profilesMap = new Map<string, any>();
        profileDocuments.forEach((profile: any) => {
          profilesMap.set(profile.$id, profile);
        });

        const data: TeamMember[] = documents.map((doc: any) => ({
          id: doc.$id,
          user_id: doc.user_id,
          name: doc.name,
          avatarUrl: getAvatarUrl(
            profilesMap.get(doc.user_id)?.avatar_file_id,
            profilesMap.get(doc.user_id)?.avatar_updated_at
          ),
        }));
        setTeamMembers(data);
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

  const getAssigneeMembers = (assigneeIds: (string | number)[]): TeamMember[] => {
    if (!assigneeIds || assigneeIds.length === 0) return [];

    return assigneeIds
      .map((id) => {
        const stringId = String(id);
        return teamMembers.find(
          (member) => member.user_id === stringId || member.id === stringId
        );
      })
      .filter((member): member is TeamMember => Boolean(member));
  };

  return { getAssigneeNames, getAssigneeMembers, teamMembers, isLoading };
};
