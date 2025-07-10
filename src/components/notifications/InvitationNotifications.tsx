
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
  role: string;
  invited_by: string;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
  token: string;
}

const InvitationNotifications = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { userRole } = useUserRole();

  const fetchInvitations = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user?.email) return;

      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('email', session.session.user.email)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleAcceptInvitation = async (invitation: Invitation) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error("You must be logged in to accept invitations");
        return;
      }

      // Mark invitation as accepted
      const { error: invitationError } = await supabase
        .from('invitations')
        .update({ accepted_at: new Date().toISOString() })
        .eq('id', invitation.id);

      if (invitationError) throw invitationError;

      // Create user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: session.session.user.id,
          role: invitation.role,
          assigned_by: invitation.invited_by
        });

      if (roleError) throw roleError;

      // Refresh invitations
      await fetchInvitations();
      toast.success("Invitation accepted successfully!");
      
      // Refresh the page to update user role
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

  if (invitations.length === 0) return null;

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
