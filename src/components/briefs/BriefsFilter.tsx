
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
    <div className="mb-4 flex flex-row items-stretch gap-2 md:items-center md:justify-between md:gap-4">
      <div className="order-2 flex shrink-0 items-center gap-2 md:order-1">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[132px] md:w-[180px]">
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
      <div className="relative order-1 min-w-0 flex-1 md:order-2 md:w-64 md:flex-none">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search briefs..." className="w-full pl-8" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
    </div>
  );
};

export default BriefsFilter;
