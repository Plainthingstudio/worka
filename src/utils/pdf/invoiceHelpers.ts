
import { format } from 'date-fns';
import { Invoice } from '@/types';

/**
 * Formats the date parts for the invoice
 */
export const formatDateParts = (invoice: Invoice) => {
  return {
    issued: {
      month: format(new Date(invoice.date), "MMMM"),
      day: format(new Date(invoice.date), "dd,"),
      year: format(new Date(invoice.date), "yyyy")
    },
    due: {
      month: format(new Date(invoice.dueDate), "MMMM"),
      day: format(new Date(invoice.dueDate), "dd,"),
      year: format(new Date(invoice.dueDate), "yyyy")
    }
  };
};

/**
 * Formats currency values 
 */
export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};
