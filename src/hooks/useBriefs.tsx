
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
  services?: string[];
  print_media?: string[];
  digital_media?: string[];
  about_company?: string;
  target_audience?: string;
  competitor1?: string;
  competitor2?: string;
  competitor3?: string;
  competitor4?: string;
  reference1?: string;
  reference2?: string;
  reference3?: string;
  reference4?: string;
  general_style?: string;
  color_preferences?: string;
  user_id?: string;
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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No authenticated user");
      }

      const { data, error } = await supabase
        .from('briefs')
        .select('*')
        .eq('user_id', user.id)
        .order('submission_date', { ascending: false });

      if (error) {
        throw error;
      }

      // Transform data to match Brief interface
      const formattedBriefs: Brief[] = data.map(brief => ({
        id: brief.id.toString(),
        name: brief.name,
        email: brief.email,
        company_name: brief.company_name,
        type: brief.type,
        status: brief.status,
        submission_date: brief.submission_date,
        services: Array.isArray(brief.services) ? brief.services : [],
        print_media: Array.isArray(brief.print_media) ? brief.print_media : [],
        digital_media: Array.isArray(brief.digital_media) ? brief.digital_media : [],
        about_company: brief.about_company,
        target_audience: brief.target_audience,
        competitor1: brief.competitor1,
        competitor2: brief.competitor2,
        competitor3: brief.competitor3,
        competitor4: brief.competitor4,
        reference1: brief.reference1,
        reference2: brief.reference2,
        reference3: brief.reference3,
        reference4: brief.reference4,
        general_style: brief.general_style,
        color_preferences: brief.color_preferences,
        user_id: brief.user_id
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
           brief.company_name.toLowerCase().includes(searchLower);
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
