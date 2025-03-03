
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ClientSearchProps {
  search: string;
  setSearch: (value: string) => void;
}

const ClientSearch = ({ search, setSearch }: ClientSearchProps) => {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search clients..."
        className="pl-9"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
};

export default ClientSearch;
