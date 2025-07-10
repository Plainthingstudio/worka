
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
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
  role: z.string({
    required_error: "Please select a role."
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

  const roles = [
    { value: "administrator", label: "Administrator" },
    { value: "team", label: "Team Member" }
  ];

  const form = useForm<z.infer<typeof invitationSchema>>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      email: "",
      role: "",
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

      // Create invitation
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      const { error } = await supabase
        .from('invitations')
        .insert({
          email: values.email,
          role: values.role,
          invited_by: session.session.user.id,
          expires_at: expiresAt.toISOString(),
          token: generateToken()
        });

      if (error) throw error;

      toast.success(`Invitation sent to ${values.email}. They will see a notification when they log in.`);
      form.reset();
      onClose();
      onInvitationSent();
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error("Failed to send invitation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Invite Team Member
              </DialogTitle>
              <DialogDescription>
                Send an invitation to add a new team member. They'll receive a notification when they log in.
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
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Invitation"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default InvitationDialog;
