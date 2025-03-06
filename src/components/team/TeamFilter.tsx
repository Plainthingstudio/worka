
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TeamPosition } from "@/types";

interface TeamFilterProps {
  search: string;
  setSearch: (value: string) => void;
  positionFilter: string;
  setPositionFilter: (value: string) => void;
}

const TeamFilter = ({
  search,
  setSearch,
  positionFilter,
  setPositionFilter,
}: TeamFilterProps) => {
  const positions: TeamPosition[] = [
    "Project Manager",
    "Account Executive",
    "UI Designer",
    "Senior UI Designer",
    "Design Director",
    "Lead UI Designer",
    "Lead Graphic Designer",
    "Lead Illustrator",
    "Illustrator",
    "Graphic Designer",
    "Co-Founder"
  ];

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search team members..."
          className="pl-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <Select
        value={positionFilter}
        onValueChange={setPositionFilter}
      >
        <SelectTrigger className="w-full md:w-[200px]">
          <SelectValue placeholder="Filter by position" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Positions</SelectItem>
          {positions.map((position) => (
            <SelectItem key={position} value={position}>
              {position}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TeamFilter;
