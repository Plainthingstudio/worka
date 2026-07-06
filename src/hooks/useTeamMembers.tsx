
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { TeamMember, TeamPosition } from "@/types";
import { account, databases, DATABASE_ID, Query } from "@/integrations/appwrite/client";
import { getAvatarUrl } from "@/lib/avatars";

const APPWRITE_PAGE_SIZE = 100;

type AppwriteDocument = {
  $id: string;
  $createdAt: string;
};

type TeamMemberDocument = AppwriteDocument & {
  user_id: string;
  name: string;
  position: TeamPosition;
  start_date: string;
  skills?: string[];
};

type ProfileDocument = AppwriteDocument & {
  email?: string | null;
  avatar_file_id?: string | null;
  avatar_updated_at?: string | null;
};

type UserRoleDocument = AppwriteDocument & {
  user_id: string;
  role: string;
};

const fetchAllDocuments = async <TDocument extends AppwriteDocument>(
  collectionId: string,
  queries: string[] = []
) => {
  const documents: TDocument[] = [];
  let offset = 0;

  while (true) {
    const response = await databases.listDocuments(DATABASE_ID, collectionId, [
      ...queries,
      Query.limit(APPWRITE_PAGE_SIZE),
      Query.offset(offset),
    ]);

    documents.push(...(response.documents as unknown as TDocument[]));

    if (response.documents.length < APPWRITE_PAGE_SIZE) {
      return documents;
    }

    offset += APPWRITE_PAGE_SIZE;
  }
};

export const useTeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetched = useRef(false);
  const teamMembersRef = useRef<TeamMember[]>([]);
  const fetchPromiseRef = useRef<Promise<TeamMember[]> | null>(null);

  const fetchTeamMembers = useCallback(async () => {
    if (hasFetched.current) {
      return teamMembersRef.current;
    }

    if (fetchPromiseRef.current) {
      return fetchPromiseRef.current;
    }

    const fetchPromise = (async () => {
      try {
        hasFetched.current = true;
        setIsLoading(true);

        let session;
        try {
          session = await account.getSession('current');
        } catch {
          hasFetched.current = false;
          toast.error("You must be logged in to view team members");
          return [];
        }

        if (!session) {
          hasFetched.current = false;
          toast.error("You must be logged in to view team members");
          return [];
        }

        // Fetch team members
        const teamData = await fetchAllDocuments<TeamMemberDocument>('team_members', [Query.orderDesc('$createdAt')]);

        const profilesData = await fetchAllDocuments<ProfileDocument>('profiles');
        const profilesMap = new Map<string, ProfileDocument>();
        profilesData.forEach((profile) => {
          profilesMap.set(profile.$id, profile);
        });

        // Get all user roles
        const rolesMap = new Map<string, string>();
        try {
          const rolesData = await fetchAllDocuments<UserRoleDocument>('user_roles');
          rolesData.forEach((role) => {
            rolesMap.set(role.user_id, role.role);
          });
        } catch (e) {
          // roles may not exist
        }

        const transformedMembers: TeamMember[] = teamData.map((member) => {
          const role = rolesMap.get(member.user_id);
          const profile = profilesMap.get(member.user_id);

          return {
            id: member.$id,
            user_id: member.user_id,
            name: member.name,
            position: member.position as TeamPosition,
            startDate: new Date(member.start_date),
            skills: member.skills || [],
            createdAt: new Date(member.$createdAt),
            role: role,
            email: profile?.email || null,
            avatarFileId: profile?.avatar_file_id || undefined,
            avatarUpdatedAt: profile?.avatar_updated_at || undefined,
            avatarUrl: getAvatarUrl(profile?.avatar_file_id, profile?.avatar_updated_at),
          };
        });

        setTeamMembers(transformedMembers);
        teamMembersRef.current = transformedMembers;
        return transformedMembers;
      } catch (error) {
        console.error("Error fetching team members:", error);
        toast.error("Failed to load team members");
        hasFetched.current = false; // Reset on error to allow retry
        return [];
      } finally {
        fetchPromiseRef.current = null;
        setIsLoading(false);
      }
    })();

    fetchPromiseRef.current = fetchPromise;
    return fetchPromise;
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    if (!hasFetched.current && teamMembers.length === 0) {
      fetchTeamMembers();
    }
  }, [fetchTeamMembers, teamMembers.length]);

  return { teamMembers, fetchTeamMembers, isLoading };
};
