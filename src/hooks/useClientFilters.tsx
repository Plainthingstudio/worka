
import { useState } from "react";
import { Client } from "@/types";

export const useClientFilters = (clients: Client[]) => {
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(search.toLowerCase()) || 
                          client.email.toLowerCase().includes(search.toLowerCase()) || 
                          (client.phone && client.phone.toLowerCase().includes(search.toLowerCase()));
    const matchesSource = sourceFilter === "all" || client.leadSource === sourceFilter;
    return matchesSearch && matchesSource;
  });

  return {
    search,
    setSearch,
    sourceFilter,
    setSourceFilter,
    filteredClients
  };
};
