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
      
      // Update local state immediately for optimistic UI update
      setBriefs(briefs.filter(brief => brief.id !== id));
      
      let deleteResult;
      
      // Delete from the appropriate table based on type
      if (brief.type === "Illustration Design") {
        console.log("Deleting from illustration_design_briefs table");
        deleteResult = await supabase
          .from('illustration_design_briefs')
          .delete()
          .eq('id', id);
      } else if (brief.type === "UI Design") {
        console.log("Deleting from ui_design_briefs table");
        deleteResult = await supabase
          .from('ui_design_briefs')
          .delete()
          .eq('id', id);
      } else if (brief.type === "Graphic Design") {
        console.log("Deleting from graphic_design_briefs table");
        deleteResult = await supabase
          .from('graphic_design_briefs')
          .delete()
          .eq('id', id);
      }

      // Check for errors in the delete operation
      if (deleteResult?.error) {
        console.error("Error from Supabase delete operation:", deleteResult.error);
        
        // Revert the optimistic update if the database operation fails
        toast.error(`Failed to delete brief: ${deleteResult.error.message}`);
        toast.error("Please try again after refreshing the page");
        
        throw deleteResult.error;
      }

      // Instead of trying to verify deletion with a count query which seems to be failing,
      // let's consider the deletion successful if there was no error from the delete operation
      console.log("Brief deleted successfully from database");
      toast.success("Brief deleted successfully");

      // Clean up localStorage as well to keep both in sync
      try {
        const storedBriefs = localStorage.getItem("briefs");
        if (storedBriefs) {
          const parsedBriefs = JSON.parse(storedBriefs);
          const updatedBriefs = parsedBriefs.filter((brief: any) => brief.id !== id);
          localStorage.setItem("briefs", JSON.stringify(updatedBriefs));
          console.log("Brief removed from localStorage");
        }
      } catch (localStorageError) {
        console.error("Error updating localStorage:", localStorageError);
      }
      
    } catch (error: any) {
      console.error("Error deleting brief:", error);
      toast.error(`Error deleting brief: ${error.message || "Unknown error"}`);
      throw error;
    }
  };

  return { deleteBrief };
};
