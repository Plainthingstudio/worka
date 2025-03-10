
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Brief } from "@/types/brief";

export const useBriefs = () => {
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBriefs();
  }, []);

  const fetchBriefs = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Debug the RPC function
        console.log("Fetching briefs for user:", user.id);
        
        // Use the database function to get all briefs
        const { data, error } = await supabase.rpc('get_all_briefs', {
          user_uuid: user.id
        });

        if (error) {
          console.error("RPC Error:", error);
          throw error;
        }

        // Log the returned data
        console.log("Briefs data from RPC:", data);

        // Transform data to match Brief interface
        const formattedBriefs: Brief[] = data || [];
        setBriefs(formattedBriefs);
      } else {
        // For demo/testing purposes, load from localStorage if not logged in
        const storedBriefs = localStorage.getItem("briefs");
        if (storedBriefs) {
          setBriefs(JSON.parse(storedBriefs));
        }
      }
    } catch (error) {
      console.error("Error fetching briefs:", error);
      toast.error("Failed to load briefs");
      
      // Fallback to direct queries if RPC fails
      try {
        if (await fetchBriefsDirectly()) {
          console.log("Successfully fetched briefs directly");
        }
      } catch (directError) {
        console.error("Direct fetching also failed:", directError);
        
        // Final fallback to localStorage
        const storedBriefs = localStorage.getItem("briefs");
        if (storedBriefs) {
          setBriefs(JSON.parse(storedBriefs));
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback method to fetch directly from tables instead of using RPC
  const fetchBriefsDirectly = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    console.log("Fetching briefs directly from tables for user:", user.id);
    
    // Fetch from UI Design briefs
    const { data: uiData, error: uiError } = await supabase
      .from('ui_design_briefs')
      .select('*')
      .eq('user_id', user.id);
    
    if (uiError) console.error("UI briefs error:", uiError);
    
    // Fetch from Graphic Design briefs
    const { data: graphicData, error: graphicError } = await supabase
      .from('graphic_design_briefs')
      .select('*')
      .eq('user_id', user.id);
    
    if (graphicError) console.error("Graphic briefs error:", graphicError);
    
    // Fetch from Illustration Design briefs
    const { data: illustrationData, error: illustrationError } = await supabase
      .from('illustration_design_briefs')
      .select('*')
      .eq('user_id', user.id);
    
    if (illustrationError) console.error("Illustration briefs error:", illustrationError);
    
    // Transform and combine all data
    const allBriefs: Brief[] = [
      ...(uiData || []).map((brief: any) => ({
        ...brief,
        type: "UI Design"
      })),
      ...(graphicData || []).map((brief: any) => ({
        ...brief,
        type: "Graphic Design"
      })),
      ...(illustrationData || []).map((brief: any) => ({
        ...brief,
        type: "Illustration Design"
      }))
    ];
    
    console.log("Combined briefs from direct fetching:", allBriefs);
    
    setBriefs(allBriefs);
    return allBriefs.length > 0;
  };

  const deleteBrief = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // We need to determine which table to delete from
        const brief = briefs.find(b => b.id === id);
        if (!brief) throw new Error("Brief not found");
        
        let error;
        
        // Delete from the appropriate table based on type
        if (brief.type === "UI Design") {
          const result = await supabase
            .from('ui_design_briefs')
            .delete()
            .eq('id', id);
          error = result.error;
        } else if (brief.type === "Graphic Design") {
          const result = await supabase
            .from('graphic_design_briefs')
            .delete()
            .eq('id', id);
          error = result.error;
        } else if (brief.type === "Illustration Design") {
          const result = await supabase
            .from('illustration_design_briefs')
            .delete()
            .eq('id', id);
          error = result.error;
        }

        if (error) throw error;
      } else {
        // For demo/local mode
        const storedBriefs = JSON.parse(localStorage.getItem("briefs") || "[]");
        const updatedBriefs = storedBriefs.filter((brief: any) => brief.id !== id);
        localStorage.setItem("briefs", JSON.stringify(updatedBriefs));
      }

      setBriefs(briefs.filter(brief => brief.id !== id));
      toast.success("Brief deleted successfully");
    } catch (error: any) {
      console.error("Error deleting brief:", error);
      toast.error("Failed to delete brief");
    }
  };

  const filteredBriefs = briefs.filter(brief => {
    if (filter === "all") return true;
    return brief.type === filter;
  }).filter(brief => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return brief.name.toLowerCase().includes(searchLower) || 
           brief.email.toLowerCase().includes(searchLower) || 
           (brief.company_name?.toLowerCase().includes(searchLower) || 
            brief.companyName?.toLowerCase().includes(searchLower));
  });

  return {
    briefs,
    setBriefs,
    filter,
    setFilter,
    search,
    setSearch,
    filteredBriefs,
    isLoading,
    fetchBriefs,
    deleteBrief
  };
};
