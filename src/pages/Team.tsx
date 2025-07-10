
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
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

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

const Team = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState<string>("all");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
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

  const handleAddMember = async (data: any) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast.error("You must be logged in to add team members");
        return;
      }

      // Insert the team member
      const { data: newMember, error } = await supabase
        .from('team_members')
        .insert({
          name: data.name,
          position: data.position as TeamPosition,
          start_date: data.startDate.toISOString(),
          skills: data.skills || [],
          user_id: session.session.user.id
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // If a role is specified and it's not the default 'team' role, add/update the user role
      if (data.role && data.role !== 'team') {
        // First, check if this user already has a role
        const { data: existingRole } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', session.session.user.id);

        if (existingRole && existingRole.length > 0) {
          // Update existing role
          await supabase
            .from('user_roles')
            .update({ role: data.role })
            .eq('user_id', session.session.user.id);
        } else {
          // Insert new role
          await supabase
            .from('user_roles')
            .insert({
              user_id: session.session.user.id,
              role: data.role,
              assigned_by: session.session.user.id
            });
        }
      }

      const transformedMember: TeamMember = {
        id: newMember.id,
        name: newMember.name,
        position: newMember.position as TeamPosition,
        startDate: new Date(newMember.start_date),
        skills: newMember.skills || [],
        createdAt: new Date(newMember.created_at)
      };

      setTeamMembers([transformedMember, ...teamMembers]);
      setIsAddingMember(false);
      toast.success("Team member added successfully");
    } catch (error) {
      console.error("Error adding team member:", error);
      toast.error("Failed to add team member");
    }
  };

  const handleEditMember = async (data: any) => {
    if (!editingMember) return;

    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast.error("You must be logged in to edit team members");
        return;
      }

      // Update the team member
      const { error } = await supabase
        .from('team_members')
        .update({
          name: data.name,
          position: data.position as TeamPosition,
          start_date: data.startDate.toISOString(),
          skills: data.skills || []
        })
        .eq('id', editingMember.id)
        .eq('user_id', session.session.user.id);

      if (error) {
        throw error;
      }

      // Handle role update if specified
      if (data.role) {
        // Check if this user already has a role
        const { data: existingRole } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', session.session.user.id);

        if (existingRole && existingRole.length > 0) {
          // Update existing role
          await supabase
            .from('user_roles')
            .update({ role: data.role })
            .eq('user_id', session.session.user.id);
        } else {
          // Insert new role
          await supabase
            .from('user_roles')
            .insert({
              user_id: session.session.user.id,
              role: data.role,
              assigned_by: session.session.user.id
            });
        }
      }

      const updatedMembers = teamMembers.map(member =>
        member.id === editingMember.id
          ? {
              ...member,
              name: data.name,
              position: data.position as TeamPosition,
              startDate: data.startDate,
              skills: data.skills || []
            }
          : member
      );

      setTeamMembers(updatedMembers);
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

      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id)
        .eq('user_id', session.session.user.id);

      if (error) {
        throw error;
      }

      const updatedMembers = teamMembers.filter(member => member.id !== id);
      setTeamMembers(updatedMembers);
      setIsDeleting(null);
      toast.success("Team member deleted successfully");
    } catch (error) {
      console.error("Error deleting team member:", error);
      toast.error("Failed to delete team member");
    }
  };

  const openAddMemberDialog = () => setIsAddingMember(true);
  const closeAddMemberDialog = () => setIsAddingMember(false);
  const openEditMemberDialog = (member: TeamMember) => setEditingMember(member);
  const closeEditMemberDialog = () => setEditingMember(null);
  const openDeleteDialog = (id: string) => setIsDeleting(id);
  const closeDeleteDialog = () => setIsDeleting(null);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className={`flex-1 w-full transition-all duration-300 ease-in-out ${isSidebarExpanded ? "ml-56" : "ml-14"}`}>
        <Navbar title="Team" />
        <main className="container mx-auto p-6">
          <div className="mb-8 flex items-center justify-between">
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
            {canManageTeam() && (
              <Button onClick={openAddMemberDialog} className="whitespace-nowrap">
                <Plus className="mr-2 h-4 w-4" />
                Add Team Member
              </Button>
            )}
          </div>

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

      {canManageTeam() && isAddingMember && (
        <Dialog open={isAddingMember} onOpenChange={closeAddMemberDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <TeamForm onSave={handleAddMember} onCancel={closeAddMemberDialog} />
          </DialogContent>
        </Dialog>
      )}

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
