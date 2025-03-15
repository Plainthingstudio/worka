
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
      
      // Check if the current user is authorized to delete this brief
      if (brief.user_id && brief.user_id !== user.id) {
        toast.error("You are not authorized to delete this brief");
        throw new Error("User not authorized to delete this brief");
      }
      
      let deleteResult;
      
      // Delete from the appropriate table based on type
      if (brief.type === "UI Design") {
        deleteResult = await supabase
          .from('ui_design_briefs')
          .delete()
          .eq('id', id);
      } else if (brief.type === "Graphic Design") {
        deleteResult = await supabase
          .from('graphic_design_briefs')
          .delete()
          .eq('id', id);
      } else if (brief.type === "Illustration Design") {
        deleteResult = await supabase
          .from('illustration_design_briefs')
          .delete()
          .eq('id', id);
      }

      if (deleteResult?.error) {
        console.error("Error from Supabase delete operation:", deleteResult.error);
        throw deleteResult.error;
      }

      console.log("Brief deleted successfully from database");

      // Clean up localStorage if needed (for demo/local mode)
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

      // Update local state
      setBriefs(prevBriefs => prevBriefs.filter(brief => brief.id !== id));
      console.log("Brief removed from local state");
      
    } catch (error: any) {
      console.error("Error deleting brief:", error);
      throw error;
    }
  };

  return { deleteBrief };
};
