import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Layout, List, Filter, Search } from 'lucide-react';
import { LeadStage } from '@/types';
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
  const MONTHS = [{
    value: "all",
    label: "All Months"
  }, {
    value: "01",
    label: "January"
  }, {
    value: "02",
    label: "February"
  }, {
    value: "03",
    label: "March"
  }, {
    value: "04",
    label: "April"
  }, {
    value: "05",
    label: "May"
  }, {
    value: "06",
    label: "June"
  }, {
    value: "07",
    label: "July"
  }, {
    value: "08",
    label: "August"
  }, {
    value: "09",
    label: "September"
  }, {
    value: "10",
    label: "October"
  }, {
    value: "11",
    label: "November"
  }, {
    value: "12",
    label: "December"
  }];
  const QUARTERS = [{
    value: "all",
    label: "All Quarters"
  }, {
    value: "Q1",
    label: "Q1 (Jan-Mar)"
  }, {
    value: "Q2",
    label: "Q2 (Apr-Jun)"
  }, {
    value: "Q3",
    label: "Q3 (Jul-Sep)"
  }, {
    value: "Q4",
    label: "Q4 (Oct-Dec)"
  }];
  return <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold">Leads & Pipeline</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Manage your leads through the sales pipeline.</p>
          </div>
          
          <Button onClick={() => onAddLead('Leads')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Lead
          </Button>
        </div>
        
        <div className="flex justify-between items-center mb-6 ">
          <div
            className="inline-flex items-center bg-surface-2 dark:bg-[hsl(222_33%_7%)]"
            style={{ padding: 4, gap: 0, borderRadius: 8 }}
          >
            {([
              { key: 'kanban', label: 'Kanban', icon: Layout },
              { key: 'list', label: 'List', icon: List },
            ] as const).map(({ key, label, icon: Icon }) => {
              const active = viewMode === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onViewModeChange(key)}
                  className={`inline-flex items-center text-[14px] font-medium leading-5 transition-all ${
                    active
                      ? 'bg-card text-foreground shadow-[0px_1px_2px_rgba(15,23,42,0.08)] dark:bg-[hsl(225_31%_11%)] dark:shadow-[0px_1px_3px_rgba(0,0,0,0.5)]'
                      : 'bg-transparent text-muted-foreground'
                  }`}
                  style={{
                    gap: 4,
                    padding: '4px 12px',
                    height: 32,
                    borderRadius: active ? 8 : 10,
                    fontFamily: 'Inter, sans-serif',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 w-64 h-9" />
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 h-9">
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
                        {availableYears.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
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
                        {MONTHS.map(month => <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>)}
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
                        {QUARTERS.map(quarter => <SelectItem key={quarter.value} value={quarter.value}>{quarter.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>;
};
export default KanbanHeader;