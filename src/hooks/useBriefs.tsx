
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
      
      let query = supabase
        .from('briefs')
        .select('*')
        .order('submission_date', { ascending: false });

      // If user is logged in, only fetch their briefs
      if (user) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Transform data to match Brief interface
      const formattedBriefs: Brief[] = data;
      setBriefs(formattedBriefs);
    } catch (error) {
      console.error("Error fetching briefs:", error);
      toast.error("Failed to load briefs");
      
      // Fallback to localStorage for demo purposes
      const storedBriefs = localStorage.getItem("briefs");
      if (storedBriefs) {
        setBriefs(JSON.parse(storedBriefs));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBrief = async (id: string) => {
    try {
      const { error } = await supabase
        .from('briefs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBriefs(briefs.filter(brief => brief.id !== id));
      toast.success("Brief deleted successfully");
    } catch (error) {
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
