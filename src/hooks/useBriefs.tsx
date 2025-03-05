
import { useState, useEffect } from "react";

interface Brief {
  id: number;
  name: string;
  email: string;
  companyName: string;
  type: string;
  status: string;
  submissionDate: string;
  services?: string[] | null;
  printMedia?: string[] | null;
  digitalMedia?: string[] | null;
}

export const useBriefs = () => {
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const storedBriefs = localStorage.getItem("briefs");
    if (storedBriefs) {
      setBriefs(JSON.parse(storedBriefs));
    }
  }, []);

  const filteredBriefs = briefs.filter(brief => {
    if (filter === "all") return true;
    return brief.type === filter;
  }).filter(brief => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return brief.name.toLowerCase().includes(searchLower) || 
           brief.email.toLowerCase().includes(searchLower) || 
           brief.companyName?.toLowerCase().includes(searchLower);
  }).sort((a, b) => {
    return new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime();
  });

  return {
    briefs,
    setBriefs,
    filter,
    setFilter,
    search,
    setSearch,
    filteredBriefs
  };
};
