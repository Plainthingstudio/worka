
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
      
      const userId = user.id;
      console.log("Authenticated user ID:", userId);
      
      // Try direct table fetching approach first
      console.log("Fetching briefs directly from tables");
      
      try {
        // Fetch from UI Design briefs 
        const { data: uiData, error: uiError } = await supabase
          .from('ui_design_briefs')
          .select('*')
          .or(`user_id.eq.${userId},email.eq.${user.email}`)
          .order('submission_date', { ascending: false });
        
        if (uiError) {
          console.error("UI briefs error:", uiError);
        } else {
          console.log("UI design briefs fetched:", uiData?.length || 0);
        }
        
        // Fetch from Graphic Design briefs
        const { data: graphicData, error: graphicError } = await supabase
          .from('graphic_design_briefs')
          .select('*')
          .or(`user_id.eq.${userId},email.eq.${user.email}`)
          .order('submission_date', { ascending: false });
        
        if (graphicError) {
          console.error("Graphic briefs error:", graphicError);
        } else {
          console.log("Graphic design briefs fetched:", graphicData?.length || 0);
        }
        
        // Fetch from Illustration Design briefs
        const { data: illustrationData, error: illustrationError } = await supabase
          .from('illustration_design_briefs')
          .select('*')
          .or(`user_id.eq.${userId},email.eq.${user.email}`)
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
          
          // Also update localStorage for backup
          try {
            localStorage.setItem("briefs", JSON.stringify(allBriefs));
          } catch (localStorageError) {
            console.error("Error writing to localStorage:", localStorageError);
          }
          
          setIsLoading(false);
          setIsFetching(false);
          return;
        }
      } catch (directFetchError) {
        console.error("Error in direct table fetching:", directFetchError);
      }
      
      // If we get here, we couldn't fetch briefs directly
      // Fall back to localStorage
      try {
        console.log("Falling back to localStorage for briefs");
        const storedBriefs = localStorage.getItem("briefs");
        if (storedBriefs) {
          const parsedBriefs = JSON.parse(storedBriefs);
          setBriefs(parsedBriefs);
        } else {
          console.log("No briefs found in localStorage");
          setBriefs([]);
        }
      } catch (localStorageError) {
        console.error("Error reading from localStorage:", localStorageError);
        setBriefs([]);
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
    // This method is kept for backward compatibility but now
    // moved directly into fetchBriefs
    return false;
  };

  return { fetchBriefs };
};
