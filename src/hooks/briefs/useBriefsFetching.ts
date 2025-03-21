
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
      
      // Fetch briefs directly without referencing the users table
      console.log("Fetching briefs directly from tables with user_id filter only");
      
      // Fetch UI Design briefs
      const { data: uiData, error: uiError } = await supabase
        .from('ui_design_briefs')
        .select('*')
        .eq('user_id', user.id);
      
      if (uiError) {
        console.error("UI briefs error:", uiError);
      } else {
        console.log("UI design briefs fetched:", uiData?.length || 0);
      }
      
      // Fetch Graphic Design briefs
      const { data: graphicData, error: graphicError } = await supabase
        .from('graphic_design_briefs')
        .select('*')
        .eq('user_id', user.id);
      
      if (graphicError) {
        console.error("Graphic briefs error:", graphicError);
      } else {
        console.log("Graphic design briefs fetched:", graphicData?.length || 0);
      }
      
      // Fetch Illustration Design briefs
      const { data: illustrationData, error: illustrationError } = await supabase
        .from('illustration_design_briefs')
        .select('*')
        .eq('user_id', user.id);
      
      if (illustrationError) {
        console.error("Illustration briefs error:", illustrationError);
      } else {
        console.log("Illustration design briefs fetched:", illustrationData?.length || 0);
      }
      
      // Transform and combine all data
      const combinedBriefs: Brief[] = [
        ...(uiData || []).map((brief: any) => ({
          ...brief,
          type: "UI Design",
          submissionDate: brief.submission_date,
          companyName: brief.company_name
        })),
        ...(graphicData || []).map((brief: any) => ({
          ...brief,
          type: "Graphic Design",
          submissionDate: brief.submission_date,
          companyName: brief.company_name
        })),
        ...(illustrationData || []).map((brief: any) => ({
          ...brief,
          type: "Illustration Design",
          submissionDate: brief.submission_date,
          companyName: brief.company_name
        }))
      ];
      
      console.log(`Combined briefs: ${combinedBriefs.length}`);
      
      // Set briefs in state and update localStorage
      setBriefs(combinedBriefs);
      
      // Update localStorage
      if (combinedBriefs.length > 0) {
        localStorage.setItem("briefs", JSON.stringify(combinedBriefs));
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
