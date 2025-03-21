
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Brief } from "@/types/brief";
import { toast } from "sonner";

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
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || null; // Can be null for unauthenticated users
      
      console.log("Starting to fetch briefs, user ID:", userId);
      
      // First, try to fetch briefs using the secure database function
      const success = await fetchBriefsUsingFunction(userId);
      
      if (!success) {
        console.error("Failed to fetch briefs using database function");
        
        // Final fallback to localStorage
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
      
      // Final fallback to localStorage
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

  // Method to fetch briefs using the secure database function
  const fetchBriefsUsingFunction = async (userId: string | null): Promise<boolean> => {
    console.log("Fetching briefs using secure database function for user ID:", userId);
    
    try {
      if (!userId) {
        console.log("No user ID available, returning empty briefs list");
        setBriefs([]);
        return true;
      }
      
      // Call the get_user_briefs function with the user's ID
      const { data: briefsData, error } = await supabase
        .rpc('get_user_briefs', { user_uuid: userId });
      
      if (error) {
        console.error("Error calling get_user_briefs function:", error);
        return false;
      }
      
      console.log(`Retrieved ${briefsData?.length || 0} briefs using database function`);
      
      // Transform the data if needed to match our Brief type
      const transformedBriefs: Brief[] = (briefsData || []).map((brief: any) => ({
        ...brief,
        type: brief.type,
        submissionDate: brief.submission_date,
        companyName: brief.company_name
      }));
      
      setBriefs(transformedBriefs);
      return transformedBriefs.length > 0 || briefsData?.length === 0;
    } catch (error) {
      console.error("Error in fetchBriefsUsingFunction:", error);
      return false;
    }
  };

  return { fetchBriefs };
};
