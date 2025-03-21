
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
      
      // Try using the get_all_briefs function if it exists
      try {
        const { data: allBriefsData, error: funcError } = await supabase
          .rpc('get_all_briefs', { user_uuid: user.id });
          
        if (!funcError && allBriefsData && allBriefsData.length > 0) {
          console.log("Successfully retrieved briefs using get_all_briefs function:", allBriefsData.length);
          
          // Transform the data to match the Brief interface
          const transformedBriefs: Brief[] = allBriefsData.map((brief: any) => ({
            ...brief,
            type: brief.type,
            submissionDate: brief.submission_date,
            companyName: brief.company_name
          }));
          
          setBriefs(transformedBriefs);
          localStorage.setItem("briefs", JSON.stringify(transformedBriefs));
          setIsLoading(false);
          setIsFetching(false);
          return;
        } else if (funcError) {
          console.log("Function get_all_briefs failed or doesn't exist:", funcError);
          // Continue with the individual table queries below
        }
      } catch (funcAttemptError) {
        console.log("Error attempting to use get_all_briefs function:", funcAttemptError);
        // Continue with the individual table queries
      }
      
      // Fetch from individual tables with RLS policies
      // Fetch UI Design briefs
      const { data: uiData, error: uiError } = await supabase
        .from('ui_design_briefs')
        .select('*');
      
      if (uiError) {
        console.error("UI briefs error:", uiError);
      } else {
        console.log("UI design briefs fetched:", uiData?.length || 0);
      }
      
      // Fetch Graphic Design briefs
      const { data: graphicData, error: graphicError } = await supabase
        .from('graphic_design_briefs')
        .select('*');
      
      if (graphicError) {
        console.error("Graphic briefs error:", graphicError);
      } else {
        console.log("Graphic design briefs fetched:", graphicData?.length || 0);
      }
      
      // Fetch Illustration Design briefs
      const { data: illustrationData, error: illustrationError } = await supabase
        .from('illustration_design_briefs')
        .select('*');
      
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
