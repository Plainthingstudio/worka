import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Layout, List, Filter, Search } from 'lucide-react';
import { LeadStage } from '@/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface KanbanHeaderProps {
  onAddLead: (stage: LeadStage) => void;
  viewMode: 'kanban' | 'list';
  onViewModeChange: (mode: 'kanban' | 'list') => void;
  // Filter props
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
const KanbanHeader: React.FC<KanbanHeaderProps> = ({
  onAddLead,
  viewMode,
  onViewModeChange,
  search,
  setSearch,
  monthFilter,
  setMonthFilter,
  quarterFilter,
  setQuarterFilter,
  yearFilter,
  setYearFilter,
  availableYears
}) => {
  const MONTHS = [
    { value: "all", label: "All Months" },
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" }
  ];

  const QUARTERS = [
    { value: "all", label: "All Quarters" },
    { value: "Q1", label: "Q1 (Jan-Mar)" },
    { value: "Q2", label: "Q2 (Apr-Jun)" },
    { value: "Q3", label: "Q3 (Jul-Sep)" },
    { value: "Q4", label: "Q4 (Oct-Dec)" }
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">Leads & Pipeline</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage your leads through the sales pipeline.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Tabs value={viewMode} onValueChange={value => onViewModeChange(value as 'kanban' | 'list')}>
            <TabsList>
              <TabsTrigger value="kanban" className="flex items-center gap-2">
                <Layout className="h-4 w-4" />
                <span className="hidden sm:inline">Kanban</span>
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">List</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Year</label>
                  <Select value={yearFilter} onValueChange={setYearFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {availableYears.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Month</label>
                  <Select value={monthFilter} onValueChange={setMonthFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map(month => (
                        <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Quarter</label>
                  <Select value={quarterFilter} onValueChange={setQuarterFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select quarter" />
                    </SelectTrigger>
                    <SelectContent>
                      {QUARTERS.map(quarter => (
                        <SelectItem key={quarter.value} value={quarter.value}>{quarter.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button onClick={() => onAddLead('Leads')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Lead
          </Button>
        </div>
      </div>
    </div>
  );
};
export default KanbanHeader;