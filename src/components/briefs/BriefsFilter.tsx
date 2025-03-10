
import React from "react";
import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface BriefsFilterProps {
  filter: string;
  setFilter: (value: string) => void;
  search: string;
  setSearch: (value: string) => void;
}

const BriefsFilter: React.FC<BriefsFilterProps> = ({
  filter,
  setFilter,
  search,
  setSearch
}) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
      <div className="flex items-center gap-2">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="UI Design">UI Design</SelectItem>
            <SelectItem value="Graphic Design">Graphic Design</SelectItem>
            <SelectItem value="Illustration Design">Illustration Design</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="relative w-full md:w-64">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search briefs..." className="w-full pl-8" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
    </div>
  );
};

export default BriefsFilter;
