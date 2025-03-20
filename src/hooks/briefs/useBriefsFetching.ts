
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
      const userId = user?.id || "00000000-0000-0000-0000-000000000000"; // Use a placeholder UUID if not logged in
      
      console.log("Fetching all briefs using RPC function");
      
      // Call the RPC function with a cache-busting timestamp parameter
      const timestamp = new Date().getTime();
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        'get_all_briefs', 
        { 
          user_uuid: userId,
          _timestamp: timestamp // Add timestamp to avoid caching
        }
      );

      if (!rpcError && rpcData && Array.isArray(rpcData)) {
        console.log(`Found ${rpcData.length} briefs from RPC`);
        
        if (rpcData.length > 0) {
          // For each brief, fetch the full details based on the type
          const briefsPromises = rpcData.map(async (brief: any) => {
            try {
              if (!brief || !brief.type || !brief.id) {
                console.error("Invalid brief object:", brief);
                return null;
              }
              
              let fullBrief = null;
              const fetchTimestamp = new Date().getTime();
              
              if (brief.type === "Illustration Design") {
                const { data, error } = await supabase
                  .from('illustration_design_briefs')
                  .select('*')
                  .eq('id', brief.id)
                  .maybeSingle();
                  
                if (error) {
                  console.error("Error fetching illustration brief:", error);
                  return brief;
                }
                
                fullBrief = data ? {
                  ...data,
                  type: "Illustration Design",
                  submissionDate: data.submission_date,
                  companyName: data.company_name
                } : null;
                
              } else if (brief.type === "UI Design") {
                const { data, error } = await supabase
                  .from('ui_design_briefs')
                  .select('*')
                  .eq('id', brief.id)
                  .maybeSingle();
                  
                if (error) {
                  console.error("Error fetching UI brief:", error);
                  return brief;
                }
                
                fullBrief = data ? {
                  ...data,
                  type: "UI Design",
                  submissionDate: data.submission_date,
                  companyName: data.company_name
                } : null;
                
              } else if (brief.type === "Graphic Design") {
                const { data, error } = await supabase
                  .from('graphic_design_briefs')
                  .select('*')
                  .eq('id', brief.id)
                  .maybeSingle();
                  
                if (error) {
                  console.error("Error fetching graphic brief:", error);
                  return brief;
                }
                
                fullBrief = data ? {
                  ...data,
                  type: "Graphic Design",
                  submissionDate: data.submission_date,
                  companyName: data.company_name
                } : null;
              }
              
              // If the brief is null at this point, it means it was deleted
              if (!fullBrief) {
                console.log(`Brief ${brief.id} not found in database, likely deleted`);
                return null;
              }
              
              return fullBrief;
            } catch (err) {
              console.error(`Error processing brief ${brief.id}:`, err);
              return null;
            }
          });
          
          const briefs = await Promise.all(briefsPromises);
          const validBriefs = briefs.filter(Boolean) as Brief[];
          
          console.log("Full briefs data processed:", validBriefs.length);
          setBriefs(validBriefs);
        } else {
          console.log("No briefs found in RPC response");
          setBriefs([]);
        }
      } else {
        console.log("RPC fetch failed or returned no data, trying direct table fetches");
        if (rpcError) console.error("RPC Error:", rpcError);
        
        // Fallback to direct table fetching
        const success = await fetchBriefsDirectly();
        if (!success) {
          console.error("No briefs found in database tables");
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
      const timestamp = new Date().getTime();
      
      // Fetch from UI Design briefs with timestamp to avoid cache
      const { data: uiData, error: uiError } = await supabase
        .from('ui_design_briefs')
        .select('*')
        .order('submission_date', { ascending: false });
      
      if (uiError) {
        console.error("UI briefs error:", uiError);
      } else {
        console.log("UI design briefs fetched:", uiData?.length || 0);
      }
      
      // Fetch from Graphic Design briefs with timestamp to avoid cache
      const { data: graphicData, error: graphicError } = await supabase
        .from('graphic_design_briefs')
        .select('*')
        .order('submission_date', { ascending: false });
      
      if (graphicError) {
        console.error("Graphic briefs error:", graphicError);
      } else {
        console.log("Graphic design briefs fetched:", graphicData?.length || 0);
      }
      
      // Fetch from Illustration Design briefs with timestamp to avoid cache
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
