import { useState, useMemo } from "react";
import { Lead } from "@/types";

export const useLeadsFilter = (leads: Lead[]) => {
  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [quarterFilter, setQuarterFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");

  // Calculate available years from leads data
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    leads.forEach(lead => {
      const year = new Date(lead.createdAt).getFullYear().toString();
      years.add(year);
    });
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a)); // Most recent first
  }, [leads]);

  // Set default year to current year if available, otherwise first available year
  useMemo(() => {
    if (yearFilter === "all" && availableYears.length > 0) {
      const currentYear = new Date().getFullYear().toString();
      if (availableYears.includes(currentYear)) {
        setYearFilter(currentYear);
      } else {
        setYearFilter(availableYears[0]);
      }
    }
  }, [availableYears, yearFilter]);

  const getQuarterFromMonth = (month: number): string => {
    if (month >= 0 && month <= 2) return "Q1";
    if (month >= 3 && month <= 5) return "Q2";
    if (month >= 6 && month <= 8) return "Q3";
    if (month >= 9 && month <= 11) return "Q4";
    return "Q1";
  };

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const leadDate = new Date(lead.createdAt);
      const leadYear = leadDate.getFullYear().toString();
      const leadMonth = leadDate.getMonth();
      const leadQuarter = getQuarterFromMonth(leadMonth);

      // Search filter
      const matchesSearch = search === "" || 
        lead.name.toLowerCase().includes(search.toLowerCase()) ||
        lead.email.toLowerCase().includes(search.toLowerCase()) ||
        (lead.phone && lead.phone.toLowerCase().includes(search.toLowerCase())) ||
        (lead.source && lead.source.toLowerCase().includes(search.toLowerCase()));

      // Year filter
      const matchesYear = yearFilter === "all" || leadYear === yearFilter;

      // Month filter
      const matchesMonth = monthFilter === "all" || leadMonth.toString() === monthFilter;

      // Quarter filter
      const matchesQuarter = quarterFilter === "all" || leadQuarter === quarterFilter;

      return matchesSearch && matchesYear && matchesMonth && matchesQuarter;
    });
  }, [leads, search, monthFilter, quarterFilter, yearFilter]);

  return {
    search,
    setSearch,
    monthFilter,
    setMonthFilter,
    quarterFilter,
    setQuarterFilter,
    yearFilter,
    setYearFilter,
    availableYears,
    filteredLeads
  };
};