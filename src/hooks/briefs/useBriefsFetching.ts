
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
      
      if (!user) {
        console.log("No authenticated user found, fetching briefs from localStorage only");
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
        setIsLoading(false);
        setIsFetching(false);
        return;
      }
      
      console.log("Current user ID:", user.id);
      
      // Use the database function to fetch all briefs instead of querying tables directly
      console.log("Using get_all_briefs function to fetch briefs");
      
      const { data: allBriefs, error: functionError } = await supabase
        .rpc('get_all_briefs', { user_uuid: user.id });
      
      if (functionError) {
        console.error("Error fetching briefs:", functionError);
        toast.error(`Failed to load briefs: ${functionError.message}`);
        throw functionError;
      }
      
      console.log(`Briefs fetched from function: ${allBriefs?.length || 0}`);
      
      // Transform the data to match the Brief interface
      const transformedBriefs: Brief[] = allBriefs?.map((brief: any) => ({
        ...brief,
        submissionDate: brief.submission_date,
        companyName: brief.company_name
      })) || [];
      
      console.log(`Transformed briefs: ${transformedBriefs.length}`);
      
      // Set briefs in state and update localStorage
      setBriefs(transformedBriefs);
      
      // Update localStorage
      if (transformedBriefs.length > 0) {
        localStorage.setItem("briefs", JSON.stringify(transformedBriefs));
      } else {
        console.log("No briefs found, clearing localStorage");
        localStorage.removeItem("briefs");
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

  // Method to clear all local brief data
  const clearLocalBriefs = () => {
    try {
      localStorage.removeItem("briefs");
      console.log("Cleared briefs from localStorage");
      setBriefs([]);
      return true;
    } catch (error) {
      console.error("Failed to clear localStorage briefs:", error);
      return false;
    }
  };

  return { fetchBriefs, clearLocalBriefs };
};
