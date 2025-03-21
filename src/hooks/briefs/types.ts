
import { Brief } from "@/types/brief";

export interface UseBriefsState {
  briefs: Brief[];
  filter: string;
  search: string;
  isLoading: boolean;
}

export interface UseBriefsActions {
  setBriefs: (briefs: Brief[]) => void;
  setFilter: (filter: string) => void;
  setSearch: (search: string) => void;
  fetchBriefs: () => Promise<void>;
  deleteBrief: (id: string) => Promise<void>;
}

export interface UseBriefsResult extends UseBriefsState, UseBriefsActions {
  filteredBriefs: Brief[];
}
