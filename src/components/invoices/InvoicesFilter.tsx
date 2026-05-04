
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface InvoicesFilterProps {
  onFilterChange: (status: string) => void;
  currentFilter: string;
}

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
] as const;

const InvoicesFilter: React.FC<InvoicesFilterProps> = ({ onFilterChange, currentFilter }) => {
  return (
    <Tabs value={currentFilter} onValueChange={onFilterChange} className="w-auto">
      <TabsList className="inline-flex h-auto min-h-0 w-full max-w-full flex-wrap justify-start sm:w-auto">
        {STATUS_FILTERS.map(({ value, label }) => (
          <TabsTrigger key={value} value={value} className="shrink-0">
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default InvoicesFilter;
