
import { Brief } from "@/types/brief";

export interface UseBriefsResult {
  briefs: Brief[];
  setBriefs: (briefs: Brief[]) => void;
  filter: string;
  setFilter: (filter: string) => void;
  search: string;
  setSearch: (search: string) => void;
  filteredBriefs: Brief[];
  isLoading: boolean;
  fetchBriefs: () => Promise<void>;
  deleteBrief: (id: string) => Promise<void>;
  clearLocalBriefs: () => boolean;
}
