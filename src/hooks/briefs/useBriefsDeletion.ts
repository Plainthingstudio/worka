
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
      let tableName = "";
      
      // Delete from the appropriate table based on type
      if (brief.type === "Illustration Design") {
        tableName = 'illustration_design_briefs';
        console.log(`Deleting from ${tableName} table`);
        deleteResult = await supabase
          .from(tableName)
          .delete()
          .eq('id', id);
      } else if (brief.type === "UI Design") {
        tableName = 'ui_design_briefs';
        console.log(`Deleting from ${tableName} table`);
        deleteResult = await supabase
          .from(tableName)
          .delete()
          .eq('id', id);
      } else if (brief.type === "Graphic Design") {
        tableName = 'graphic_design_briefs';
        console.log(`Deleting from ${tableName} table`);
        deleteResult = await supabase
          .from(tableName)
          .delete()
          .eq('id', id);
      }

      // Check for errors in the delete operation
      if (deleteResult?.error) {
        console.error("Error from Supabase delete operation:", deleteResult.error);
        toast.error(`Failed to delete brief: ${deleteResult.error.message}`);
        throw deleteResult.error;
      }

      console.log(`Brief successfully deleted from ${tableName} table`);
      
      // Update local state - DO THIS AFTER SUCCESSFUL DATABASE DELETION
      console.log("Updating local state after deletion");
      setBriefs((prevBriefs) => prevBriefs.filter(b => b.id !== id));
      
      // Clean up localStorage
      try {
        const storedBriefs = localStorage.getItem("briefs");
        if (storedBriefs) {
          const parsedBriefs = JSON.parse(storedBriefs);
          const updatedBriefs = parsedBriefs.filter((b: any) => b.id !== id);
          localStorage.setItem("briefs", JSON.stringify(updatedBriefs));
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
