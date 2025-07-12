
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const registrationSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

interface InvitationData {
  id: string;
  email: string;
  role: "owner" | "administrator" | "team";
  token: string;
  expires_at: string;
  invited_by: string;
}

interface InvitationRegistrationProps {
  invitation: InvitationData;
}

const InvitationRegistration = ({ invitation }: InvitationRegistrationProps) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof registrationSchema>>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: "",
      password: "",
      confirmPassword: "",
      phone: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof registrationSchema>) => {
    setIsLoading(true);
    console.log("Starting registration process for:", invitation.email);

    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invitation.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
            phone: values.phone,
          },
        },
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error("User creation failed");
      }

      console.log("User created successfully:", authData.user.id);

      // Wait a moment for the user to be fully created
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create profile record
      console.log("Creating profile record...");
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          full_name: values.fullName,
          email: invitation.email,
          phone_number: values.phone || null,
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Don't throw here as the user is already created
      } else {
        console.log("Profile created successfully");
      }

      // Create user role
      console.log("Creating user role record...");
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: invitation.role,
          assigned_by: invitation.invited_by,
        });

      if (roleError) {
        console.error('Role creation error:', roleError);
        // Don't throw here as the user is already created
      } else {
        console.log("User role created successfully");
      }

      // Create team member record
      // First, we need to get the position from the invitation dialog context
      // For now, we'll use a default position based on role
      const defaultPosition = invitation.role === 'administrator' 
        ? 'Administrator' 
        : invitation.role === 'owner' 
        ? 'Owner' 
        : 'Team Member';

      console.log("Creating team member record...");
      const { error: teamMemberError } = await supabase
        .from('team_members')
        .insert({
          user_id: authData.user.id,
          name: values.fullName,
          position: defaultPosition,
          start_date: new Date().toISOString(),
          skills: [],
        });

      if (teamMemberError) {
        console.error('Team member creation error:', teamMemberError);
        // Don't throw here as the user is already created
      } else {
        console.log("Team member created successfully");
      }

      // Mark invitation as accepted
      console.log("Marking invitation as accepted...");
      const { error: invitationError } = await supabase
        .from('invitations')
        .update({ accepted_at: new Date().toISOString() })
        .eq('id', invitation.id);

      if (invitationError) {
        console.error('Invitation update error:', invitationError);
        // Don't throw here as the user is already created
      } else {
        console.log("Invitation marked as accepted");
      }

      toast.success("Registration successful! Welcome to the team!");
      
      // Redirect to dashboard
      navigate("/dashboard");
      
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800";
      case "administrator":
        return "bg-blue-100 text-blue-800";
      case "team":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <UserPlus className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>Join the Team</CardTitle>
        <CardDescription>
          You've been invited to join as a team member
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2 text-center">
          <p className="text-sm text-muted-foreground">
            Email: <span className="font-medium">{invitation.email}</span>
          </p>
          <Badge className={`${getRoleColor(invitation.role)} capitalize`}>
            {invitation.role}
          </Badge>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Join Team"}
            </Button>
          </form>
        </Form>

        <p className="text-xs text-center text-muted-foreground">
          By joining, you agree to our terms of service and privacy policy.
        </p>
      </CardContent>
    </Card>
  );
};

export default InvitationRegistration;
