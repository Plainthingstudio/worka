
import React from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AssignRoleButton = () => {
  const handleAssignRole = async () => {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("No user logged in");
        return;
      }

      console.log("Current user:", user.id);

      // Check if role already exists
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingRole) {
        toast.info(`User already has role: ${existingRole.role}`);
        return;
      }

      // Assign owner role
      const { data, error } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'owner'
        })
        .select()
        .single();

      if (error) {
        console.error("Error assigning role:", error);
        toast.error(`Failed to assign role: ${error.message}`);
      } else {
        console.log("Successfully assigned role:", data);
        toast.success("Successfully assigned owner role!");
        
        // Refresh the page to update the UI
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("An error occurred");
    }
  };

  return (
    <Button onClick={handleAssignRole} variant="outline" size="sm">
      Assign Owner Role to Current User
    </Button>
  );
};

export default AssignRoleButton;
