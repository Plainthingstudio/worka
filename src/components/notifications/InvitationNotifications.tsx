
import React, { useState, useEffect } from "react";
import { Bell, Check, X, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

interface Invitation {
  id: string;
  email: string;
  role: "owner" | "administrator" | "team";
  invited_by: string;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
  token: string;
}

const InvitationNotifications = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { userRole, isLoading: roleLoading } = useUserRole();

  const fetchInvitations = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user?.email) return;

      console.log("Fetching invitations for email:", session.session.user.email);

      // Only fetch invitations that are not accepted and not expired
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('email', session.session.user.email)
        .is('accepted_at', null) // Only non-accepted invitations
        .gt('expires_at', new Date().toISOString()) // Only non-expired invitations
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching invitations:', error);
        throw error;
      }

      console.log("Found invitations:", data);
      setInvitations(data || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  };

  useEffect(() => {
    // Only fetch invitations if user doesn't have a role yet
    if (!roleLoading && !userRole) {
      fetchInvitations();
    }
  }, [userRole, roleLoading]);

  const handleAcceptInvitation = async (invitation: Invitation) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error("You must be logged in to accept invitations");
        return;
      }

      console.log("Accepting invitation:", invitation.id);

      // Mark invitation as accepted
      const { error: invitationError } = await supabase
        .from('invitations')
        .update({ accepted_at: new Date().toISOString() })
        .eq('id', invitation.id);

      if (invitationError) {
        console.error('Error accepting invitation:', invitationError);
        throw invitationError;
      }

      // Check if user already has a role
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', session.session.user.id)
        .single();

      if (!existingRole) {
        // Create user role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: session.session.user.id,
            role: invitation.role as "owner" | "administrator" | "team",
            assigned_by: invitation.invited_by
          });

        if (roleError) {
          console.error('Error creating user role:', roleError);
          throw roleError;
        }
      }

      // Check if user already has a team member record
      const { data: existingTeamMember } = await supabase
        .from('team_members')
        .select('*')
        .eq('user_id', session.session.user.id)
        .single();

      if (!existingTeamMember) {
        // Get user profile for name
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', session.session.user.id)
          .single();

        // Create team member record
        const defaultPosition = invitation.role === 'administrator' 
          ? 'Administrator' 
          : invitation.role === 'owner' 
          ? 'Owner' 
          : 'Team Member';

        const { error: teamMemberError } = await supabase
          .from('team_members')
          .insert({
            user_id: session.session.user.id,
            name: profile?.full_name || 'Unknown',
            position: defaultPosition,
            start_date: new Date().toISOString(),
            skills: [],
          });

        if (teamMemberError) {
          console.error('Error creating team member:', teamMemberError);
          throw teamMemberError;
        }
      }

      // Refresh invitations and user role
      await fetchInvitations();
      toast.success("Invitation accepted successfully!");
      
      // Refresh the page to update user role throughout the app
      window.location.reload();
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error("Failed to accept invitation");
    }
  };

  const handleDeclineInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;

      await fetchInvitations();
      toast.success("Invitation declined");
    } catch (error) {
      console.error('Error declining invitation:', error);
      toast.error("Failed to decline invitation");
    }
  };

  // Don't show notification bell if:
  // 1. User already has a role (they're already part of the team)
  // 2. No pending invitations exist
  // 3. Still loading user role data
  if (roleLoading || userRole || invitations.length === 0) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {invitations.length > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {invitations.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Team Invitations
            </CardTitle>
            <CardDescription>
              You have pending team invitations
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="p-4 border-t">
                  <div className="flex flex-col gap-2">
                    <div className="text-sm font-medium">
                      Team Invitation
                    </div>
                    <div className="text-sm text-muted-foreground">
                      You've been invited as <span className="font-medium capitalize">{invitation.role}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Expires: {new Date(invitation.expires_at).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        onClick={() => handleAcceptInvitation(invitation)}
                        className="flex-1"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeclineInvitation(invitation.id)}
                        className="flex-1"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Decline
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default InvitationNotifications;
