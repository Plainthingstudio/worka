
import React from 'react';
import { Button } from '@/components/ui/button';

export interface InvoicesFilterProps {
  onFilterChange: (status: string) => void;
  currentFilter: string;
}

const InvoicesFilter: React.FC<InvoicesFilterProps> = ({ onFilterChange, currentFilter }) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={currentFilter === 'all' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterChange('all')}
      >
        All
      </Button>
      <Button
        variant={currentFilter === 'draft' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterChange('draft')}
      >
        Draft
      </Button>
      <Button
        variant={currentFilter === 'sent' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterChange('sent')}
      >
        Sent
      </Button>
      <Button
        variant={currentFilter === 'paid' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterChange('paid')}
      >
        Paid
      </Button>
      <Button
        variant={currentFilter === 'overdue' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterChange('overdue')}
      >
        Overdue
      </Button>
    </div>
  );
};

export default InvoicesFilter;
