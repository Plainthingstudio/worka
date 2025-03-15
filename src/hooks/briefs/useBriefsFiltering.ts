
import { Brief } from "@/types/brief";

export const useBriefsFiltering = (
  briefs: Brief[],
  filter: string,
  search: string
) => {
  const getFilteredBriefs = (): Brief[] => {
    return briefs
      .filter(brief => {
        if (filter === "all") return true;
        return brief.type === filter;
      })
      .filter(brief => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return brief.name.toLowerCase().includes(searchLower) || 
               brief.email.toLowerCase().includes(searchLower) || 
               (brief.company_name?.toLowerCase().includes(searchLower) || 
                brief.companyName?.toLowerCase().includes(searchLower));
      });
  };

  return { filteredBriefs: getFilteredBriefs() };
};
