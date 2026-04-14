
import React, { useState, useEffect } from "react";
import { Clock, Mail, MoreHorizontal, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { databases, DATABASE_ID, Query } from "@/integrations/appwrite/client";

interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  created_at: string;
  expires_at: string;
  invited_by: string;
}

interface PendingInvitationsProps {
  refreshTrigger: number;
}

const PendingInvitations = ({ refreshTrigger }: PendingInvitationsProps) => {
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInvitations = async () => {
    try {
      setIsLoading(true);

      // Get pending invitations (not accepted and not expired)
      const invitationsResponse = await databases.listDocuments(DATABASE_ID, 'invitations', [
        Query.isNull('accepted_at'),
        Query.greaterThan('expires_at', new Date().toISOString()),
        Query.orderDesc('$createdAt')
      ]);
      const invitationsData = invitationsResponse.documents;

      // Get all profiles with emails to check if invited users have already joined
      const profilesResponse = await databases.listDocuments(DATABASE_ID, 'profiles');
      const profilesData = profilesResponse.documents;

      // Create a set of existing emails (normalized to lowercase for case-insensitive comparison)
      const existingEmails = new Set(
        (profilesData || [])
          .map((p: any) => p.email?.toLowerCase())
          .filter(Boolean)
      );

      // Filter out invitations where the user has already created a profile (joined)
      const actualPendingInvitations = (invitationsData || [])
        .filter((invitation: any) => !existingEmails.has(invitation.email.toLowerCase()))
        .map((invitation: any) => ({
          id: invitation.$id,
          email: invitation.email,
          role: invitation.role,
          created_at: invitation.$createdAt,
          expires_at: invitation.expires_at,
          invited_by: invitation.invited_by,
        }));

      setInvitations(actualPendingInvitations);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      toast.error("Failed to load pending invitations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, [refreshTrigger]);

  const handleResendInvitation = async (invitation: PendingInvitation) => {
    try {
      // For in-app system, we just extend the expiry date
      const newExpiryDate = new Date();
      newExpiryDate.setDate(newExpiryDate.getDate() + 7);

      await databases.updateDocument(DATABASE_ID, 'invitations', invitation.id, {
        expires_at: newExpiryDate.toISOString()
      });

      toast.success("Invitation renewed successfully");
      fetchInvitations();
    } catch (error) {
      console.error('Error resending invitation:', error);
      toast.error("Failed to renew invitation");
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      await databases.deleteDocument(DATABASE_ID, 'invitations', invitationId);

      toast.success("Invitation cancelled");
      fetchInvitations();
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      toast.error("Failed to cancel invitation");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (invitations.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Pending Invitations
        </CardTitle>
        <CardDescription>
          Users who have been invited but haven't accepted yet
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {invitations.map((invitation) => (
            <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Mail className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium">{invitation.email}</div>
                  <div className="text-sm text-muted-foreground">
                    Invited as <Badge variant="secondary" className="capitalize">{invitation.role}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Expires: {new Date(invitation.expires_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleResendInvitation(invitation)}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Renew Invitation
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleCancelInvitation(invitation.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Cancel Invitation
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingInvitations;
