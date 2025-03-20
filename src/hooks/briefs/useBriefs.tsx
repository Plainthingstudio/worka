
import { useState, useEffect } from "react";
import { Brief } from "@/types/brief";
import { useBriefsFetching } from "./useBriefsFetching";
import { useBriefsDeletion } from "./useBriefsDeletion";
import { useBriefsFiltering } from "./useBriefsFiltering";
import { UseBriefsResult } from "./types";

export const useBriefs = (): UseBriefsResult => {
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const { fetchBriefs, clearLocalBriefs } = useBriefsFetching(setBriefs, setIsLoading);
  const { deleteBrief } = useBriefsDeletion(briefs, setBriefs);
  const { filteredBriefs } = useBriefsFiltering(briefs, filter, search);

  useEffect(() => {
    fetchBriefs();
  }, []);

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
    deleteBrief,
    clearLocalBriefs
  };
};
