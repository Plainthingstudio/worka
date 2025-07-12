
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const invitationSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address."
  }),
  role: z.enum(["administrator", "team"], {
    required_error: "Please select a role."
  }),
  position: z.string({
    required_error: "Please select a position."
  }),
  message: z.string().optional()
});

interface InvitationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInvitationSent: () => void;
}

const InvitationDialog = ({ isOpen, onClose, onInvitationSent }: InvitationDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [invitationLink, setInvitationLink] = useState<string | null>(null);

  const roles = [
    { value: "administrator", label: "Administrator" },
    { value: "team", label: "Team Member" }
  ];

  const positions = [
    "Project Manager",
    "Account Executive", 
    "UI Designer",
    "Senior UI Designer",
    "Design Director",
    "Lead UI Designer",
    "Lead Graphic Designer",
    "Lead Illustrator",
    "Illustrator",
    "Graphic Designer"
  ];

  const form = useForm<z.infer<typeof invitationSchema>>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      email: "",
      role: undefined,
      position: undefined,
      message: ""
    }
  });

  const generateToken = () => {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const handleSubmit = async (values: z.infer<typeof invitationSchema>) => {
    try {
      setIsLoading(true);
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast.error("You must be logged in to send invitations");
        return;
      }

      console.log("Creating invitation for:", values.email, "with position:", values.position);

      // Check if user already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users.find((user: any) => user.email === values.email);
      
      if (existingUser) {
        // Check if they already have a role
        const { data: existingRole } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', existingUser.id)
          .single();

        if (existingRole) {
          toast.error("This user is already a team member");
          return;
        }
      }

      // Check for existing pending invitation
      const { data: existingInvitation } = await supabase
        .from('invitations')
        .select('*')
        .eq('email', values.email)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (existingInvitation) {
        toast.error("There's already a pending invitation for this email");
        return;
      }

      // Create invitation with position information
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry
      const token = generateToken();

      // We need to store the position information somehow
      // Let's use a metadata field or create a custom field
      const invitationData = {
        email: values.email,
        role: values.role as "administrator" | "team",
        invited_by: session.session.user.id,
        expires_at: expiresAt.toISOString(),
        token: token,
        // We'll store position info in a metadata field
        metadata: {
          position: values.position,
          message: values.message
        }
      };

      const { error } = await supabase
        .from('invitations')
        .insert(invitationData);

      if (error) {
        console.error('Invitation creation error:', error);
        throw error;
      }

      console.log("Invitation created successfully");

      // Generate the invitation link
      const inviteLink = `${window.location.origin}/auth?invitation=${token}`;
      setInvitationLink(inviteLink);

      toast.success(`Invitation created! Share the link with ${values.email}`);
      onInvitationSent();
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error("Failed to send invitation");
    } finally {
      setIsLoading(false);
    }
  };

  const copyInvitationLink = async () => {
    if (invitationLink) {
      try {
        await navigator.clipboard.writeText(invitationLink);
        toast.success("Invitation link copied to clipboard!");
      } catch (error) {
        toast.error("Failed to copy link");
      }
    }
  };

  const handleClose = () => {
    form.reset();
    setInvitationLink(null);
    onClose();
  };

  if (invitationLink) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Invitation Created!
            </DialogTitle>
            <DialogDescription>
              Share this link with the invited team member. The invitation will expire in 7 days.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink className="h-4 w-4" />
                <span className="font-medium">Invitation Link</span>
              </div>
              <div className="flex items-center gap-2">
                <Input 
                  value={invitationLink} 
                  readOnly 
                  className="text-sm"
                />
                <Button onClick={copyInvitationLink} variant="outline" size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              The invited user will need to use this link to register and join your team.
            </p>
          </div>

          <DialogFooter>
            <Button onClick={handleClose}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Invite Team Member
              </DialogTitle>
              <DialogDescription>
                Create an invitation for a new team member. They'll receive a registration link to join your team.
              </DialogDescription>
            </DialogHeader>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a position" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {positions.map(position => (
                        <SelectItem key={position} value={position}>
                          {position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add a personal message..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating Invitation..." : "Create Invitation"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default InvitationDialog;
