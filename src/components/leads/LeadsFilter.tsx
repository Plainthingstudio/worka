import React from "react";
import { Search, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LeadsFilterProps {
  search: string;
  setSearch: (value: string) => void;
  monthFilter: string;
  setMonthFilter: (value: string) => void;
  quarterFilter: string;
  setQuarterFilter: (value: string) => void;
  yearFilter: string;
  setYearFilter: (value: string) => void;
  availableYears: string[];
}

const MONTHS = [
  { value: "all", label: "All Months" },
  { value: "0", label: "January" },
  { value: "1", label: "February" },
  { value: "2", label: "March" },
  { value: "3", label: "April" },
  { value: "4", label: "May" },
  { value: "5", label: "June" },
  { value: "6", label: "July" },
  { value: "7", label: "August" },
  { value: "8", label: "September" },
  { value: "9", label: "October" },
  { value: "10", label: "November" },
  { value: "11", label: "December" },
];

const QUARTERS = [
  { value: "all", label: "All Quarters" },
  { value: "Q1", label: "Q1 (Jan-Mar)" },
  { value: "Q2", label: "Q2 (Apr-Jun)" },
  { value: "Q3", label: "Q3 (Jul-Sep)" },
  { value: "Q4", label: "Q4 (Oct-Dec)" },
];

const LeadsFilter: React.FC<LeadsFilterProps> = ({
  search,
  setSearch,
  monthFilter,
  setMonthFilter,
  quarterFilter,
  setQuarterFilter,
  yearFilter,
  setYearFilter,
  availableYears,
}) => {
  return (
    <div className="glass-card mb-6 rounded-xl border shadow-sm animate-fade-in">
      <div className="flex flex-row items-center gap-4 p-4 flex-wrap">
        {/* Search Input */}
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Date Filter Label */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Filter by date:</span>
        </div>
        
        {/* Year Filter */}
        <div className="w-32">
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Month Filter */}
        <div className="w-40">
          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quarter Filter */}
        <div className="w-40">
          <Select value={quarterFilter} onValueChange={setQuarterFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Quarter" />
            </SelectTrigger>
            <SelectContent>
              {QUARTERS.map((quarter) => (
                <SelectItem key={quarter.value} value={quarter.value}>
                  {quarter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default LeadsFilter;