
import React, { memo } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DemoLoginProps {
  isLoading: boolean;
  onDemoLogin: () => void;
}

// Use memo to prevent unnecessary re-renders
const DemoLogin = memo(({ isLoading, onDemoLogin }: DemoLoginProps) => {
  const handleDemoLogin = async () => {
    try {
      onDemoLogin(); // Set loading state
      
      // Sign in with demo credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "demo@example.com",
        password: "password123",
      });

      if (error) throw error;

      if (data.user) {
        // Check if user already has a role
        const { data: existingRole } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .maybeSingle(); // Use maybeSingle to handle no rows gracefully

        // If no role exists, assign owner role
        if (!existingRole) {
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: data.user.id,
              role: 'owner'
            });

          if (roleError) {
            console.error("Error assigning role:", roleError);
            toast.error("Failed to assign user role, but login successful");
          } else {
            console.log("Successfully assigned owner role to demo user");
          }
        }

        toast.success("Successfully logged in with demo account");
        // Force page reload to ensure clean state
        window.location.href = '/dashboard';
      }
    } catch (error: any) {
      console.error("Demo login error:", error);
      toast.error(error.message || "Failed to login with demo account");
    }
  };

  return (
    <div className="mt-6 flex flex-col space-y-3">
      <Button
        onClick={handleDemoLogin}
        className="w-full"
        disabled={isLoading}
        variant="default"
      >
        {isLoading ? "Logging in..." : "Continue with Demo Account"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        No registration required
      </p>
    </div>
  );
});

DemoLogin.displayName = "DemoLogin";

export default DemoLogin;
