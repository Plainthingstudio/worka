
import { useState, useEffect } from 'react';
import { useInvoicesFetching } from './useInvoicesFetching';
import { useInvoiceActions } from './useInvoiceActions';
import { useInvoiceCrud } from './useInvoiceCrud';
import { Invoice } from '@/types';

export const useInvoices = () => {
  const {
    invoices,
    setInvoices,
    isLoading,
    setIsLoading,
    fetchInvoices
  } = useInvoicesFetching();

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

  const { deleteInvoice: deleteSingleInvoice, saveInvoice } = useInvoiceCrud(
    setInvoices,
    setIsLoading,
    fetchInvoices
  );

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const deleteInvoice = async () => {
    if (invoiceToDelete) {
      await deleteSingleInvoice(invoiceToDelete);
      setDeleteConfirmOpen(false);
      setInvoiceToDelete(null);
    }
  };

  return {
    invoices,
    isLoading,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    invoiceToDelete,
    setInvoiceToDelete,
    deleteInvoice,
    confirmDelete,
    handleDownload,
    handleViewInvoice,
    handleEditInvoice,
    fetchInvoices,
    saveInvoice
  };
};
