import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import TeamForm from "@/components/TeamForm";
import { TeamMember } from "@/types";
import TeamFilter from "@/components/team/TeamFilter";
import TeamTable from "@/components/team/TeamTable";
import DeleteTeamMemberDialog from "@/components/team/DeleteTeamMemberDialog";

// Create a mock array for team members and export it for use in other components
export const mockTeamMembers: TeamMember[] = [];

const Team = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(mockTeamMembers);
  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState<string>("all");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  // Listen for sidebar state changes
  useEffect(() => {
    const handleSidebarChange = () => {
      const sidebarElement = document.querySelector('[class*="w-56"], [class*="w-14"]');
      setIsSidebarExpanded(sidebarElement?.classList.contains('w-56') || false);
    };

    // Initial check
    handleSidebarChange();

    // Set up mutation observer to watch for class changes on the sidebar
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

  const openAddMemberDialog = () => setIsAddingMember(true);
  const closeAddMemberDialog = () => setIsAddingMember(false);
  const openEditMemberDialog = (member: TeamMember) => setEditingMember(member);
  const closeEditMemberDialog = () => setEditingMember(null);
  const openDeleteDialog = (id: string) => setIsDeleting(id);
  const closeDeleteDialog = () => setIsDeleting(null);

  const handleAddMember = (data: any) => {
    const newMember: TeamMember = {
      id: `team-${Date.now()}`,
      name: data.name,
      position: data.position,
      startDate: data.startDate,
      skills: data.skills || [],
      createdAt: new Date()
    };

    // Update team members list
    const updatedMembers = [newMember, ...teamMembers];
    setTeamMembers(updatedMembers);

    // Update the global mock array
    mockTeamMembers.length = 0;
    mockTeamMembers.push(...updatedMembers);

    setIsAddingMember(false);
    toast.success("Team member added successfully");
  };

  const handleEditMember = (data: any) => {
    if (!editingMember) return;
    const updatedMembers = teamMembers.map(member => member.id === editingMember.id ? {
      ...member,
      ...data
    } : member);

    // Update both state and mock data
    setTeamMembers(updatedMembers);
    mockTeamMembers.length = 0;
    mockTeamMembers.push(...updatedMembers);
    
    setEditingMember(null);
    toast.success("Team member updated successfully");
  };

  const handleDeleteMember = (id: string) => {
    const updatedMembers = teamMembers.filter(member => member.id !== id);

    // Update both state and mock data
    setTeamMembers(updatedMembers);
    mockTeamMembers.length = 0;
    mockTeamMembers.push(...updatedMembers);
    
    setIsDeleting(null);
    toast.success("Team member deleted successfully");
  };

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
                Manage your team members and their skills.
              </p>
            </div>
            <Button onClick={openAddMemberDialog} className="whitespace-nowrap">
              <Plus className="mr-2 h-4 w-4" />
              Add Team Member
            </Button>
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
                onEdit={openEditMemberDialog} 
                onDelete={openDeleteDialog} 
              />
            </div>
          </div>
        </main>
      </div>

      {isAddingMember && (
        <Dialog open={isAddingMember} onOpenChange={closeAddMemberDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <TeamForm onSave={handleAddMember} onCancel={closeAddMemberDialog} />
          </DialogContent>
        </Dialog>
      )}

      {editingMember && (
        <Dialog open={!!editingMember} onOpenChange={closeEditMemberDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <TeamForm teamMember={editingMember} onSave={handleEditMember} onCancel={closeEditMemberDialog} />
          </DialogContent>
        </Dialog>
      )}

      {isDeleting && (
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
