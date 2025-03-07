
import React, { useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import InvoiceFormContainer from '@/components/invoice/InvoiceFormContainer';
import { useInvoiceForm } from '@/hooks/useInvoiceForm';
import InvoiceLoading from '@/components/invoice-details/InvoiceLoading';
import { useSidebarState } from '@/hooks/useSidebarState';
import { useClients } from '@/hooks/useClients';

const InvoiceForm = () => {
  const { isSidebarExpanded } = useSidebarState();
  const { clients, isLoading: isClientsLoading } = useClients();
  const {
    invoice,
    setInvoice,
    isEditing,
    isLoading: isInvoiceLoading,
    invoiceItemsLoaded,
    addItem,
    removeItem,
    updateItem,
    handleInputChange,
    saveInvoice,
    generatePDF,
    formatCurrency
  } = useInvoiceForm();

  // Add a debug log to check invoice items when they change
  useEffect(() => {
    if (invoice && invoice.items) {
      console.log("InvoiceForm: Current invoice items:", invoice.items);
    }
  }, [invoice.items]);

  const isLoading = isInvoiceLoading || isClientsLoading;

  if (isLoading) {
    return (
      <div className="flex h-screen bg-muted/10">
        <Sidebar />
        <div 
          className={`flex-1 w-full transition-all duration-300 ease-in-out ${
            isSidebarExpanded ? "ml-56" : "ml-14"
          }`}
        >
          <Navbar title={isEditing ? "Edit Invoice" : "New Invoice"} />
          <main className="p-6">
            <InvoiceLoading />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-muted/10">
      <Sidebar />
      <div 
        className={`flex-1 w-full transition-all duration-300 ease-in-out ${
          isSidebarExpanded ? "ml-56" : "ml-14"
        }`}
      >
        <Navbar title={isEditing ? "Edit Invoice" : "New Invoice"} />
        <main className="p-6">
          <InvoiceFormContainer 
            invoice={invoice}
            setInvoice={setInvoice}
            isEditing={isEditing}
            isLoading={!invoiceItemsLoaded && isEditing}
            clients={clients}
            addItem={addItem}
            removeItem={removeItem}
            updateItem={updateItem}
            handleInputChange={handleInputChange}
            saveInvoice={saveInvoice}
            generatePDF={generatePDF}
            formatCurrency={formatCurrency}
          />
        </main>
      </div>
    </div>
  );
};

export default InvoiceForm;
