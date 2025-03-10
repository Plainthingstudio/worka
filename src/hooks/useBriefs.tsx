
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Brief {
  id: string;
  name: string;
  email: string;
  company_name: string;
  type: string;
  status: string;
  submission_date: string;
  services?: string[] | null;
  print_media?: string[] | null;
  digital_media?: string[] | null;
}

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
      const { data, error } = await supabase
        .from('briefs')
        .select('*')
        .order('submission_date', { ascending: false });

      if (error) {
        throw error;
      }

      // Transform data if needed (e.g., parsing JSON fields)
      const formattedBriefs = data.map(brief => ({
        ...brief,
        // Convert any JSON fields that are stored as strings
        services: brief.services || [],
        print_media: brief.print_media || [],
        digital_media: brief.digital_media || [],
        // Make sure id is a string
        id: brief.id.toString(),
        // Make sure company_name is available (property name in DB is company_name, but we used companyName in frontend)
        companyName: brief.company_name
      }));

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

      // Update local state
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
           brief.companyName?.toLowerCase().includes(searchLower);
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
