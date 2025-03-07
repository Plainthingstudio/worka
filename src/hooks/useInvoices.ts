
import { useEffect } from 'react';
import { useInvoicesFetching } from './useInvoicesFetching';
import { useInvoiceCrud } from './useInvoiceCrud';
import { useInvoiceActions } from './useInvoiceActions';

export const useInvoices = () => {
  const {
    invoices,
    setInvoices,
    isLoading,
    setIsLoading,
    fetchInvoices
  } = useInvoicesFetching();

  const {
    saveInvoice,
    deleteInvoice: deleteInvoiceFromDB
  } = useInvoiceCrud(setInvoices, setIsLoading, fetchInvoices);

  const {
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    invoiceToDelete,
    setInvoiceToDelete,
    confirmDelete,
    handleDownload,
    handleViewInvoice,
    handleEditInvoice
  } = useInvoiceActions();

  // Delete invoice wrapper that uses the dialog state
  const deleteInvoice = async () => {
    await deleteInvoiceFromDB(invoiceToDelete);
    setDeleteConfirmOpen(false);
    setInvoiceToDelete(null);
  };

  // Fetch invoices on component mount
  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return {
    invoices,
    isLoading,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    invoiceToDelete,
    fetchInvoices,
    saveInvoice,
    deleteInvoice,
    confirmDelete,
    handleDownload,
    handleViewInvoice,
    handleEditInvoice
  };
};
