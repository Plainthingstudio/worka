
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
      const userEmail = user.email;
      console.log("Authenticated user ID:", userId);
      console.log("Authenticated user email:", userEmail);
      
      // Try direct table fetching approach first
      console.log("Fetching briefs directly from tables");
      
      try {
        // Try to fetch briefs using the get_all_briefs function if available
        const { data: functionData, error: functionError } = await supabase
          .rpc('get_all_briefs', { user_uuid: userId });
          
        if (functionError) {
          console.log("Function get_all_briefs not available or error:", functionError);
        } else if (functionData && functionData.length > 0) {
          console.log(`Retrieved ${functionData.length} briefs from function`);
          setBriefs(functionData);
          
          // Update localStorage with the latest data from the database
          localStorage.setItem("briefs", JSON.stringify(functionData));
          
          setIsLoading(false);
          setIsFetching(false);
          return;
        }
        
        // Fetch from UI Design briefs 
        const { data: uiData, error: uiError } = await supabase
          .from('ui_design_briefs')
          .select('*')
          .or(`user_id.eq.${userId}`)
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
          .or(`user_id.eq.${userId}`)
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
          .or(`user_id.eq.${userId}`)
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
        
        // Set briefs in state and update localStorage
        setBriefs(allBriefs);
        
        // Since we've successfully fetched from the database, update localStorage
        // or clear it if there are no briefs
        if (allBriefs.length > 0) {
          localStorage.setItem("briefs", JSON.stringify(allBriefs));
        } else {
          console.log("No briefs found in database, clearing localStorage");
          localStorage.removeItem("briefs");
        }
        
        setIsLoading(false);
        setIsFetching(false);
        return;
      } catch (directFetchError) {
        console.error("Error in direct table fetching:", directFetchError);
      }
      
      // If database fetch failed, fallback to localStorage only if we haven't
      // successfully established a connection to the database
      console.log("Database fetch failed, checking localStorage as last resort");
      try {
        const storedBriefs = localStorage.getItem("briefs");
        if (storedBriefs) {
          console.log("Using briefs from localStorage as fallback");
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
