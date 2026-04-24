import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import TeamForm from "@/components/TeamForm";
import { TeamMember, TeamPosition } from "@/types";
import TeamFilter from "@/components/team/TeamFilter";
import TeamTable from "@/components/team/TeamTable";
import DeleteTeamMemberDialog from "@/components/team/DeleteTeamMemberDialog";
import InvitationDialog from "@/components/team/InvitationDialog";
import PendingInvitations from "@/components/team/PendingInvitations";
import { account, databases, DATABASE_ID, Query } from "@/integrations/appwrite/client";
import { useUserRole } from "@/hooks/useUserRole";

const Team = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState<string>("all");
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInvitationDialogOpen, setIsInvitationDialogOpen] = useState(false);
  const [invitationRefreshTrigger, setInvitationRefreshTrigger] = useState(0);
  const { canManageTeam, userRole } = useUserRole();

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true);

      let session;
      try {
        session = await account.getSession('current');
      } catch {
        toast.error("You must be logged in to view team members");
        return;
      }

      if (!session) {
        toast.error("You must be logged in to view team members");
        return;
      }

      // Fetch team members
      const teamResponse = await databases.listDocuments(DATABASE_ID, 'team_members', [
        Query.orderDesc('$createdAt')
      ]);
      const teamData = teamResponse.documents;

      // Get all user roles
      const rolesResponse = await databases.listDocuments(DATABASE_ID, 'user_roles');
      const rolesData = rolesResponse.documents;

      // Create a map of user_id to role
      const rolesMap = new Map<string, string>();
      rolesData.forEach((role: any) => {
        rolesMap.set(role.user_id, role.role);
      });

      // Fetch profiles to get emails
      const profilesResponse = await databases.listDocuments(DATABASE_ID, 'profiles');
      const profilesMap = new Map<string, any>();
      profilesResponse.documents.forEach((profile: any) => {
        profilesMap.set(profile.$id, profile);
      });

      const transformedMembers: TeamMember[] = (teamData || []).map((member: any) => {
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
          email: profile?.email || null
        };
      });

      setTeamMembers(transformedMembers);
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast.error("Failed to load team members");
    } finally {
      setIsLoading(false);
    }
  };


  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(search.toLowerCase());
    const matchesPosition = positionFilter === "all" || member.position === positionFilter;
    return matchesSearch && matchesPosition;
  });

  const handleEditMember = async (data: any) => {
    if (!editingMember) return;

    try {
      let session;
      try {
        session = await account.getSession('current');
      } catch {
        toast.error("You must be logged in to edit team members");
        return;
      }

      if (!session) {
        toast.error("You must be logged in to edit team members");
        return;
      }

      // Update the team member record (name and email are handled separately since they come from profiles)
      await databases.updateDocument(DATABASE_ID, 'team_members', editingMember.id, {
        position: data.position as TeamPosition,
        start_date: data.startDate.toISOString(),
        skills: data.skills || []
      });

      // Handle role update if specified and user has a profile
      if (data.role && editingMember.user_id) {
        // Check if the target user already has a role
        const existingRoleResponse = await databases.listDocuments(DATABASE_ID, 'user_roles', [
          Query.equal('user_id', editingMember.user_id)
        ]);
        const existingRole = existingRoleResponse.documents[0] ?? null;

        if (existingRole) {
          // Update existing role
          await databases.updateDocument(DATABASE_ID, 'user_roles', existingRole.$id, {
            role: data.role,
            assigned_by: session.userId
          });
        } else {
          // Insert new role
          const { ID } = await import('@/integrations/appwrite/client');
          await databases.createDocument(DATABASE_ID, 'user_roles', ID.unique(), {
            user_id: editingMember.user_id,
            role: data.role,
            assigned_by: session.userId
          });
        }
      }

      // Refresh the team members list
      await fetchTeamMembers();
      setEditingMember(null);
      toast.success("Team member updated successfully");
    } catch (error) {
      console.error("Error updating team member:", error);
      toast.error("Failed to update team member");
    }
  };

  const handleDeleteMember = async (id: string) => {
    try {
      let session;
      try {
        session = await account.getSession('current');
      } catch {
        toast.error("You must be logged in to delete team members");
        return;
      }

      if (!session) {
        toast.error("You must be logged in to delete team members");
        return;
      }

      // Find the member to delete
      const memberToDelete = teamMembers.find(m => m.id === id);

      // Delete from team_members collection
      await databases.deleteDocument(DATABASE_ID, 'team_members', id);

      // Optionally remove their role if they were linked to a user account
      if (memberToDelete?.email) {
        const profileResponse = await databases.listDocuments(DATABASE_ID, 'profiles', [
          Query.equal('email', memberToDelete.email)
        ]);
        const profileData = profileResponse.documents[0] ?? null;

        if (profileData) {
          const roleResponse = await databases.listDocuments(DATABASE_ID, 'user_roles', [
            Query.equal('user_id', profileData.$id)
          ]);
          const roleDoc = roleResponse.documents[0] ?? null;
          if (roleDoc) {
            await databases.deleteDocument(DATABASE_ID, 'user_roles', roleDoc.$id);
          }
        }
      }

      // Refresh the team members list
      await fetchTeamMembers();
      setIsDeleting(null);
      toast.success("Team member deleted successfully");
    } catch (error) {
      console.error("Error deleting team member:", error);
      toast.error("Failed to delete team member");
    }
  };

  const openEditMemberDialog = (member: TeamMember) => setEditingMember(member);
  const closeEditMemberDialog = () => setEditingMember(null);
  const openDeleteDialog = (id: string) => setIsDeleting(id);
  const closeDeleteDialog = () => setIsDeleting(null);
  const openInvitationDialog = () => setIsInvitationDialogOpen(true);
  const closeInvitationDialog = () => setIsInvitationDialogOpen(false);

  const handleInvitationSent = () => {
    setInvitationRefreshTrigger(prev => prev + 1);
  };

  return (
    <>
      <main className="w-full p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Team
              </h1>
              <p className="text-muted-foreground">
                Manage your team members, their roles, and their skills.
              </p>
              {userRole && (
                <p className="text-xs text-muted-foreground mt-1">
                  Your role: <span className="capitalize font-medium">{userRole}</span>
                </p>
              )}
            </div>
            {/* Only owners can invite team members, administrators can see all but cannot invite */}
            {userRole === 'owner' && (
              <div className="flex gap-2">
                <Button onClick={openInvitationDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Invite Team Member
                </Button>
              </div>
            )}
          </div>

          {/* Pending Invitations - only show to owners */}
          {userRole === 'owner' && (
            <PendingInvitations refreshTrigger={invitationRefreshTrigger} />
          )}

          <TeamFilter
            search={search}
            setSearch={setSearch}
            positionFilter={positionFilter}
            setPositionFilter={setPositionFilter}
          />

          <div className="rounded-xl animate-fade-in">
            <div className="overflow-x-auto">
              <TeamTable
                members={filteredMembers}
                onEdit={canManageTeam() ? openEditMemberDialog : undefined}
                onDelete={canManageTeam() ? openDeleteDialog : undefined}
              />
            </div>
          </div>
      </main>

      {/* Invitation Dialog - only for owners */}
      {userRole === 'owner' && (
        <InvitationDialog
          isOpen={isInvitationDialogOpen}
          onClose={closeInvitationDialog}
          onInvitationSent={handleInvitationSent}
        />
      )}

      {/* Edit Member Dialog */}
      {canManageTeam() && editingMember && (
        <Dialog open={!!editingMember} onOpenChange={closeEditMemberDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <TeamForm teamMember={editingMember} onSave={handleEditMember} onCancel={closeEditMemberDialog} />
          </DialogContent>
        </Dialog>
      )}

      {canManageTeam() && isDeleting && (
        <DeleteTeamMemberDialog
          isOpen={!!isDeleting}
          onClose={closeDeleteDialog}
          onConfirm={() => isDeleting && handleDeleteMember(isDeleting)}
        />
      )}
    </>
  );
};

export default Team;
