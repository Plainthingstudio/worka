
import { supabase } from "@/integrations/supabase/client";
import { Brief } from "@/types/brief";
import { toast } from "sonner";

export const useBriefsDeletion = (
  briefs: Brief[],
  setBriefs: (briefs: Brief[]) => void
) => {
  const deleteBrief = async (id: string): Promise<void> => {
    try {
      console.log("Deleting brief with ID:", id);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to delete briefs");
        throw new Error("User not authenticated");
      }
      
      // We need to determine which table to delete from
      const brief = briefs.find(b => b.id === id);
      if (!brief) {
        throw new Error("Brief not found");
      }
      
      let deleteResult;
      
      // Delete from the appropriate table based on type - using hardcoded table names for type safety
      if (brief.type === "Illustration Design") {
        console.log("Deleting from illustration_design_briefs table");
        deleteResult = await supabase
          .from('illustration_design_briefs')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id); // Ensure we're only deleting user's briefs
      } else if (brief.type === "UI Design") {
        console.log("Deleting from ui_design_briefs table");
        deleteResult = await supabase
          .from('ui_design_briefs')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id); // Ensure we're only deleting user's briefs
      } else if (brief.type === "Graphic Design") {
        console.log("Deleting from graphic_design_briefs table");
        deleteResult = await supabase
          .from('graphic_design_briefs')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id); // Ensure we're only deleting user's briefs
      }

      // Check for errors in the delete operation
      if (deleteResult?.error) {
        console.error("Error from Supabase delete operation:", deleteResult.error);
        
        // Handle permission errors specifically
        if (deleteResult.error.code === "42501" || deleteResult.error.message.includes("permission denied")) {
          toast.error("You don't have permission to delete this brief. Only admin users can delete briefs.");
        } else {
          toast.error(`Failed to delete brief: ${deleteResult.error.message}`);
        }
        throw deleteResult.error;
      }

      console.log("Brief successfully deleted from database");
      
      // Update local state after successful database deletion
      const updatedBriefs = briefs.filter(b => b.id !== id);
      setBriefs(updatedBriefs);
      console.log("Local state updated, briefs count:", updatedBriefs.length);
      
      // Clean up localStorage
      try {
        const storedBriefs = localStorage.getItem("briefs");
        if (storedBriefs) {
          const parsedBriefs = JSON.parse(storedBriefs);
          const updatedLocalBriefs = parsedBriefs.filter((b: any) => b.id !== id);
          localStorage.setItem("briefs", JSON.stringify(updatedLocalBriefs));
          console.log("Brief removed from localStorage");
        }
      } catch (localStorageError) {
        console.error("Error updating localStorage:", localStorageError);
      }
      
      toast.success("Brief deleted successfully");
    } catch (error: any) {
      console.error("Error deleting brief:", error);
      toast.error(`Error deleting brief: ${error.message || "Unknown error"}`);
      throw error;
    }
  };

  return { deleteBrief };
};
