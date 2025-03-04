
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeadSource } from "@/types";

interface ClientsFilterProps {
  search: string;
  setSearch: (value: string) => void;
  sourceFilter: string;
  setSourceFilter: (value: string) => void;
  leadSources: LeadSource[];
}

const ClientsFilter = ({
  search,
  setSearch,
  sourceFilter,
  setSourceFilter,
  leadSources,
}: ClientsFilterProps) => {
  return (
    <div className="glass-card mb-6 rounded-xl border shadow-sm animate-fade-in">
      <div className="flex flex-col gap-4 p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={sourceFilter}
            onValueChange={setSourceFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {leadSources.map((source) => (
                <SelectItem key={source} value={source}>
                  {source}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default ClientsFilter;
