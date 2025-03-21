
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
      
      // First, try to fetch briefs directly from tables without filtering by user_id
      const success = await fetchBriefsDirectly();
      
      if (!success) {
        console.error("Failed to fetch briefs directly from tables");
        
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

  // Method to fetch directly from individual brief tables
  const fetchBriefsDirectly = async (): Promise<boolean> => {
    console.log("Fetching briefs directly from tables");
    
    try {
      // Fetch all briefs from UI Design briefs (without user_id filter)
      const { data: uiData, error: uiError } = await supabase
        .from('ui_design_briefs')
        .select('*')
        .order('submission_date', { ascending: false });
      
      if (uiError) {
        console.error("UI briefs error:", uiError);
      } else {
        console.log("UI design briefs fetched:", uiData?.length || 0);
      }
      
      // Fetch all briefs from Graphic Design briefs (without user_id filter)
      const { data: graphicData, error: graphicError } = await supabase
        .from('graphic_design_briefs')
        .select('*')
        .order('submission_date', { ascending: false });
      
      if (graphicError) {
        console.error("Graphic briefs error:", graphicError);
      } else {
        console.log("Graphic design briefs fetched:", graphicData?.length || 0);
      }
      
      // Fetch all briefs from Illustration Design briefs (without user_id filter)
      const { data: illustrationData, error: illustrationError } = await supabase
        .from('illustration_design_briefs')
        .select('*')
        .order('submission_date', { ascending: false });
      
      if (illustrationError) {
        console.error("Illustration briefs error:", illustrationError);
      } else {
        console.log("Illustration design briefs fetched:", illustrationData?.length || 0);
      }
      
      // Transform and combine all data
      const allBriefs: Brief[] = [
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
      
      console.log(`Combined briefs from direct fetching: ${allBriefs.length}`);
      
      if (allBriefs.length > 0) {
        setBriefs(allBriefs);
        return true;
      }
      
      setBriefs([]);
      return false;
    } catch (error) {
      console.error("Error in fetchBriefsDirectly:", error);
      return false;
    }
  };

  return { fetchBriefs };
};
