
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import InvoicesTable from '@/components/invoices/InvoicesTable';
import InvoicesFilter from '@/components/invoices/InvoicesFilter';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { useInvoices } from '@/hooks/useInvoices';
import { useInvoiceStatus } from '@/hooks/useInvoiceStatus';
import { PaymentType } from '@/types';
import { databases, DATABASE_ID } from '@/integrations/appwrite/client';

const Invoices = () => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('all');

  const {
    invoices,
    isLoading,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    deleteInvoice,
    confirmDelete,
    handleDownload,
    handleViewInvoice,
    handleEditInvoice,
    fetchInvoices
  } = useInvoices();

  const { updateInvoiceStatus } = useInvoiceStatus(fetchInvoices);

  // Update payment type function
  const updatePaymentType = async (invoiceId: string, newType: PaymentType) => {
    try {
      await databases.updateDocument(DATABASE_ID, 'invoices', invoiceId, {
        payment_type: newType
      });

      // Refresh the invoices list
      fetchInvoices();
    } catch (error) {
      console.error('Error updating payment type:', error);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Filter invoices based on status
  const filteredInvoices = filterStatus === 'all'
    ? invoices
    : invoices.filter(invoice => invoice.status.toLowerCase() === filterStatus.toLowerCase());

  return (
    <>
      <main className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
              <p className="text-muted-foreground">
                Manage and track client invoices.
              </p>
            </div>
            <div className="flex gap-2 self-end md:self-auto">
              <Button onClick={() => navigate('/invoices/new')}>
                <Plus className="h-4 w-4 mr-2" />
                New Invoice
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <InvoicesFilter
              onFilterChange={setFilterStatus}
              currentFilter={filterStatus}
            />
          </div>

          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-12 bg-muted rounded"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          ) : (
            <InvoicesTable
              invoices={filteredInvoices}
              formatCurrency={formatCurrency}
              onViewClick={handleViewInvoice}
              onDownloadClick={handleDownload}
              onDeleteClick={confirmDelete}
              onEditClick={handleEditInvoice}
              onStatusChange={updateInvoiceStatus}
              onPaymentTypeChange={updatePaymentType}
            />
          )}
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the invoice and remove the data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteInvoice}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Invoices;
