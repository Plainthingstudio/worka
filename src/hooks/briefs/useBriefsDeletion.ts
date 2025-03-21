
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
      
      // Call the secure database function to delete the brief
      const { data: deleteResult, error } = await supabase
        .rpc('delete_brief', { 
          brief_id: id,
          user_uuid: user.id
        });
      
      if (error) {
        console.error("Error from Supabase delete operation:", error);
        
        // Handle permission errors specifically
        if (error.code === "42501" || error.message.includes("permission denied")) {
          toast.error("You don't have permission to delete this brief.");
        } else {
          toast.error(`Failed to delete brief: ${error.message}`);
        }
        throw error;
      }
      
      if (!deleteResult) {
        toast.error("Failed to delete brief: Brief not found or you don't have permission");
        throw new Error("Brief deletion failed");
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
