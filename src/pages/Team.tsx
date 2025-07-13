import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import TeamForm from "@/components/TeamForm";
import { TeamMember, TeamPosition } from "@/types";
import TeamFilter from "@/components/team/TeamFilter";
import TeamTable from "@/components/team/TeamTable";
import DeleteTeamMemberDialog from "@/components/team/DeleteTeamMemberDialog";
import InvitationDialog from "@/components/team/InvitationDialog";
import PendingInvitations from "@/components/team/PendingInvitations";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

const Team = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState<string>("all");
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
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
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast.error("You must be logged in to view team members");
        return;
      }

      // Fetch team members with profile data
      const { data: teamData, error: teamError } = await supabase
        .from('team_members')
        .select(`
          *,
          profiles!inner(email, full_name)
        `)
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
          name: member.name,
          position: member.position as TeamPosition,
          startDate: new Date(member.start_date),
          skills: member.skills || [],
          createdAt: new Date(member.created_at),
          role: role,
          email: member.profiles?.email || null
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

  useEffect(() => {
    const handleSidebarChange = () => {
      const sidebarElement = document.querySelector('[class*="w-56"], [class*="w-14"]');
      setIsSidebarExpanded(sidebarElement?.classList.contains('w-56') || false);
    };

    handleSidebarChange();

    const observer = new MutationObserver(handleSidebarChange);
    const sidebarElement = document.querySelector('[class*="flex flex-col border-r"]');
    if (sidebarElement) {
      observer.observe(sidebarElement, {
        attributes: true,
        attributeFilter: ['class']
      });
    }
    return () => observer.disconnect();
  }, []);

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(search.toLowerCase());
    const matchesPosition = positionFilter === "all" || member.position === positionFilter;
    return matchesSearch && matchesPosition;
  });

  const handleEditMember = async (data: any) => {
    if (!editingMember) return;

    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast.error("You must be logged in to edit team members");
        return;
      }

      // Find the target user by email in profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', data.email)
        .single();

      if (profileError || !profileData) {
        toast.error("User with this email does not exist. Please make sure they have an account first.");
        return;
      }

      const targetUserId = profileData.id;

      // Update the team member record
      const { error: teamError } = await supabase
        .from('team_members')
        .update({
          name: data.name,
          position: data.position as TeamPosition,
          start_date: data.startDate.toISOString(),
          skills: data.skills || [],
          user_id: targetUserId
        })
        .eq('id', editingMember.id);

      if (teamError) {
        throw teamError;
      }

      // Handle role update if specified
      if (data.role && targetUserId) {
        // Check if the target user already has a role
        const { data: existingRole } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', targetUserId)
          .single();

        if (existingRole) {
          // Update existing role
          await supabase
            .from('user_roles')
            .update({ 
              role: data.role,
              assigned_by: session.session.user.id
            })
            .eq('user_id', targetUserId);
        } else {
          // Insert new role
          await supabase
            .from('user_roles')
            .insert({
              user_id: targetUserId,
              role: data.role,
              assigned_by: session.session.user.id
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
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast.error("You must be logged in to delete team members");
        return;
      }

      // Find the member to delete
      const memberToDelete = teamMembers.find(m => m.id === id);
      
      // Delete from team_members table
      const { error: teamError } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);

      if (teamError) {
        throw teamError;
      }

      // Optionally remove their role if they were linked to a user account
      if (memberToDelete?.email) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', memberToDelete.email)
          .single();
        
        if (profileData) {
          await supabase
            .from('user_roles')
            .delete()
            .eq('user_id', profileData.id);
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
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className={`flex-1 w-full transition-all duration-300 ease-in-out ${isSidebarExpanded ? "ml-56" : "ml-14"}`}>
        <Navbar title="Team" />
        <main className="container mx-auto p-6 space-y-6">
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

          <div className="glass-card rounded-xl border shadow-sm animate-fade-in">
            <div className="overflow-x-auto p-4 py-[8px] px-[8px]">
              <TeamTable 
                members={filteredMembers} 
                onEdit={canManageTeam() ? openEditMemberDialog : undefined} 
                onDelete={canManageTeam() ? openDeleteDialog : undefined} 
              />
            </div>
          </div>
        </main>
      </div>

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
    </div>
  );
};

export default Team;
