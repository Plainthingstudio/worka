
import { useState } from "react";
import { account, databases, DATABASE_ID, Query } from "@/integrations/appwrite/client";
import { Brief } from "@/types/brief";
import { toast } from "sonner";
import { mergeBriefPayload } from "@/utils/briefPayload";

export const useBriefsFetching = (setBriefs: (briefs: Brief[]) => void, setIsLoading: (isLoading: boolean) => void) => {
  const [isFetching, setIsFetching] = useState(false);

  const fetchBriefs = async (): Promise<void> => {
    // Prevent multiple simultaneous fetch operations
    if (isFetching) {
      console.log("Fetch operation already in progress, skipping...");
      return;
    }

    setIsLoading(true);
    setIsFetching(true);

    try {
      // Get the current user
      let userId: string | null = null;
      try {
        const user = await account.get();
        userId = user?.$id || null;
      } catch {
        // unauthenticated
      }

      console.log("Starting to fetch briefs, user ID:", userId);

      const success = await fetchBriefsFromDatabase(userId);

      if (!success) {
        console.error("Failed to fetch briefs from database");

        // Fallback to localStorage
        try {
          const storedBriefs = localStorage.getItem("briefs");
          if (storedBriefs) {
            const parsedBriefs = JSON.parse(storedBriefs);
            setBriefs(parsedBriefs);
          } else {
            setBriefs([]);
          }
        } catch (localStorageError) {
          console.error("Error reading from localStorage:", localStorageError);
          setBriefs([]);
        }
      }
    } catch (error) {
      console.error("Error fetching briefs:", error);
      toast.error("Failed to load briefs");

      // Fallback to localStorage
      try {
        const storedBriefs = localStorage.getItem("briefs");
        if (storedBriefs) {
          const parsedBriefs = JSON.parse(storedBriefs);
          setBriefs(parsedBriefs);
        } else {
          setBriefs([]);
        }
      } catch (localStorageError) {
        console.error("Error reading from localStorage:", localStorageError);
        setBriefs([]);
      }
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  };

  const fetchBriefsFromDatabase = async (userId: string | null): Promise<boolean> => {
    console.log("Fetching briefs from Appwrite for user ID:", userId);

    try {
      if (!userId) {
        console.log("No user ID available, returning empty briefs list");
        setBriefs([]);
        return true;
      }

      let allBriefs: Brief[] = [];

      // Fetch graphic design briefs
      try {
        const gdResponse = await databases.listDocuments(
          DATABASE_ID,
          'graphic_design_briefs',
          [Query.equal('user_id', userId)]
        );
        const gdBriefs: Brief[] = gdResponse.documents.map((brief: any) => ({
          ...mergeBriefPayload(brief),
          id: brief.$id,
          type: 'Graphic Design',
          submissionDate: brief.submission_date,
          companyName: brief.company_name
        }));
        allBriefs = allBriefs.concat(gdBriefs);
      } catch (e) {
        console.error("Error fetching graphic design briefs:", e);
      }

      // Fetch UI design briefs
      try {
        const uiResponse = await databases.listDocuments(
          DATABASE_ID,
          'ui_design_briefs',
          [Query.equal('user_id', userId)]
        );
        const uiBriefs: Brief[] = uiResponse.documents.map((brief: any) => ({
          ...mergeBriefPayload(brief),
          id: brief.$id,
          type: 'UI Design',
          submissionDate: brief.submission_date,
          companyName: brief.company_name
        }));
        allBriefs = allBriefs.concat(uiBriefs);
      } catch (e) {
        console.error("Error fetching UI design briefs:", e);
      }

      // Fetch illustration design briefs
      try {
        const illResponse = await databases.listDocuments(
          DATABASE_ID,
          'illustration_design_briefs',
          [Query.equal('user_id', userId)]
        );
        const illBriefs: Brief[] = illResponse.documents.map((brief: any) => ({
          ...mergeBriefPayload(brief),
          id: brief.$id,
          type: 'Illustration Design',
          submissionDate: brief.submission_date,
          companyName: brief.company_name
        }));
        allBriefs = allBriefs.concat(illBriefs);
      } catch (e) {
        console.error("Error fetching illustration design briefs:", e);
      }

      console.log(`Retrieved ${allBriefs.length} briefs from database`);
      setBriefs(allBriefs);
      return true;
    } catch (error) {
      console.error("Error in fetchBriefsFromDatabase:", error);
      return false;
    }
  };

  return { fetchBriefs };
};
