
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Brief } from "@/types/brief";
import { toast } from "sonner";

export const useBriefsFetching = (setBriefs: (briefs: Brief[]) => void, setIsLoading: (isLoading: boolean) => void) => {
  
  const fetchBriefs = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Try first to use the RPC function that combines all brief types
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || "00000000-0000-0000-0000-000000000000"; // Use a placeholder UUID if not logged in
      
      console.log("Fetching all briefs using RPC function");
      
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_all_briefs', {
        user_uuid: userId
      });

      if (!rpcError && rpcData && rpcData.length > 0) {
        console.log("Briefs data successfully fetched from RPC:", rpcData);
        
        // For each brief, fetch the full details based on the type
        const briefs = await Promise.all(rpcData.map(async (brief: any) => {
          if (brief.type === "Illustration Design") {
            const { data: fullBrief, error } = await supabase
              .from('illustration_design_briefs')
              .select('*')
              .eq('id', brief.id)
              .single();
              
            if (error) {
              console.error("Error fetching full illustration brief:", error);
              return brief;
            }
            
            return {
              ...fullBrief,
              type: "Illustration Design",
              submissionDate: fullBrief.submission_date,
              companyName: fullBrief.company_name
            };
          } else if (brief.type === "UI Design") {
            const { data: fullBrief, error } = await supabase
              .from('ui_design_briefs')
              .select('*')
              .eq('id', brief.id)
              .single();
              
            if (error) {
              console.error("Error fetching full UI brief:", error);
              return brief;
            }
            
            return {
              ...fullBrief,
              type: "UI Design",
              submissionDate: fullBrief.submission_date,
              companyName: fullBrief.company_name
            };
          } else if (brief.type === "Graphic Design") {
            const { data: fullBrief, error } = await supabase
              .from('graphic_design_briefs')
              .select('*')
              .eq('id', brief.id)
              .single();
              
            if (error) {
              console.error("Error fetching full graphic brief:", error);
              return brief;
            }
            
            return {
              ...fullBrief,
              type: "Graphic Design",
              submissionDate: fullBrief.submission_date,
              companyName: fullBrief.company_name
            };
          }
          
          return brief;
        }));
        
        console.log("Full briefs data:", briefs);
        setBriefs(briefs);
      } else {
        console.log("RPC fetch failed or returned no data, trying direct table fetches");
        if (rpcError) console.error("RPC Error:", rpcError);
        
        // Fallback to direct table fetching
        const success = await fetchBriefsDirectly();
        if (!success) {
          console.error("No briefs found in database tables");
          toast.error("Failed to load briefs from database");
        }
      }
    } catch (error) {
      console.error("Error fetching briefs:", error);
      toast.error("Failed to load briefs");
      
      // Final fallback to localStorage
      const storedBriefs = localStorage.getItem("briefs");
      if (storedBriefs) {
        setBriefs(JSON.parse(storedBriefs));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Method to fetch directly from individual brief tables
  const fetchBriefsDirectly = async (): Promise<boolean> => {
    console.log("Fetching briefs directly from tables");
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Fetch from UI Design briefs
    const { data: uiData, error: uiError } = await supabase
      .from('ui_design_briefs')
      .select('*')
      .order('submission_date', { ascending: false });
    
    if (uiError) {
      console.error("UI briefs error:", uiError);
    } else {
      console.log("UI briefs data:", uiData);
    }
    
    // Fetch from Graphic Design briefs
    const { data: graphicData, error: graphicError } = await supabase
      .from('graphic_design_briefs')
      .select('*')
      .order('submission_date', { ascending: false });
    
    if (graphicError) {
      console.error("Graphic briefs error:", graphicError);
    } else {
      console.log("Graphic briefs data:", graphicData);
    }
    
    // Fetch from Illustration Design briefs
    const { data: illustrationData, error: illustrationError } = await supabase
      .from('illustration_design_briefs')
      .select('*')
      .order('submission_date', { ascending: false });
    
    if (illustrationError) {
      console.error("Illustration briefs error:", illustrationError);
    } else {
      console.log("Illustration briefs data:", illustrationData);
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
    
    console.log("Combined briefs from direct fetching:", allBriefs);
    
    if (allBriefs.length > 0) {
      setBriefs(allBriefs);
      return true;
    }
    
    return false;
  };

  return { fetchBriefs };
};
