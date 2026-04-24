
import { account, databases, DATABASE_ID } from "@/integrations/appwrite/client";
import { Brief } from "@/types/brief";
import { toast } from "sonner";

export const useBriefsDeletion = (
  briefs: Brief[],
  setBriefs: (briefs: Brief[]) => void
) => {
  const deleteBrief = async (id: string): Promise<void> => {
    try {
      console.log("Deleting brief with ID:", id);

      let user;
      try {
        user = await account.get();
      } catch {
        toast.error("You must be logged in to delete briefs");
        throw new Error("User not authenticated");
      }

      if (!user) {
        toast.error("You must be logged in to delete briefs");
        throw new Error("User not authenticated");
      }

      // Try to delete from graphic_design_briefs first, then illustration_design_briefs
      let deleted = false;
      try {
        await databases.deleteDocument(DATABASE_ID, 'graphic_design_briefs', id);
        deleted = true;
      } catch (e) {
        // Not in graphic_design_briefs, try illustration_design_briefs
      }

      if (!deleted) {
        try {
          await databases.deleteDocument(DATABASE_ID, 'ui_design_briefs', id);
          deleted = true;
        } catch (e) {
          // Not in ui_design_briefs, continue
        }
      }

      if (!deleted) {
        try {
          await databases.deleteDocument(DATABASE_ID, 'illustration_design_briefs', id);
          deleted = true;
        } catch (e) {
          // Not found in either table
        }
      }

      if (!deleted) {
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
