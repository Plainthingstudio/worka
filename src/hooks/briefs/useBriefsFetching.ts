
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
      
      // Ensure we're getting fresh data by not using cache
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_all_briefs', {
        user_uuid: userId
      }, { 
        headers: { 
          'cache-control': 'no-cache', 
          'pragma': 'no-cache' 
        } 
      });

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
      // Fetch from UI Design briefs with cache-busting headers
      const { data: uiData, error: uiError } = await supabase
        .from('ui_design_briefs')
        .select('*')
        .order('submission_date', { ascending: false })
        .then(res => {
          console.log("UI design briefs fetched:", res.data?.length || 0);
          return res;
        });
      
      if (uiError) {
        console.error("UI briefs error:", uiError);
      }
      
      // Fetch from Graphic Design briefs with cache-busting headers
      const { data: graphicData, error: graphicError } = await supabase
        .from('graphic_design_briefs')
        .select('*')
        .order('submission_date', { ascending: false })
        .then(res => {
          console.log("Graphic design briefs fetched:", res.data?.length || 0);
          return res;
        });
      
      if (graphicError) {
        console.error("Graphic briefs error:", graphicError);
      }
      
      // Fetch from Illustration Design briefs with cache-busting headers
      const { data: illustrationData, error: illustrationError } = await supabase
        .from('illustration_design_briefs')
        .select('*')
        .order('submission_date', { ascending: false })
        .then(res => {
          console.log("Illustration design briefs fetched:", res.data?.length || 0);
          return res;
        });
      
      if (illustrationError) {
        console.error("Illustration briefs error:", illustrationError);
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
