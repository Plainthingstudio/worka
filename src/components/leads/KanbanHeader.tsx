import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Layout, List } from 'lucide-react';
import { LeadStage } from '@/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LeadsFilter from './LeadsFilter';

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
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">Leads & Pipeline</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage your leads through the sales pipeline.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Tabs value={viewMode} onValueChange={value => onViewModeChange(value as 'kanban' | 'list')} className="mr-2">
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
          
          <Button onClick={() => onAddLead('Leads')} className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Lead
          </Button>
        </div>
      </div>

      <LeadsFilter
        search={search}
        setSearch={setSearch}
        monthFilter={monthFilter}
        setMonthFilter={setMonthFilter}
        quarterFilter={quarterFilter}
        setQuarterFilter={setQuarterFilter}
        yearFilter={yearFilter}
        setYearFilter={setYearFilter}
        availableYears={availableYears}
      />
    </div>
  );
};
export default KanbanHeader;