
import React, { useEffect } from 'react';
import { clients } from '@/mockData';
import Sidebar from '@/components/Sidebar';
import InvoiceFormContainer from '@/components/invoice/InvoiceFormContainer';
import { useInvoiceForm } from '@/hooks/useInvoiceForm';
import InvoiceLoading from '@/components/invoice-details/InvoiceLoading';

const InvoiceForm = () => {
  const {
    invoice,
    setInvoice,
    isEditing,
    isLoading,
    addItem,
    removeItem,
    updateItem,
    handleInputChange,
    saveInvoice,
    generatePDF,
    formatCurrency
  } = useInvoiceForm();

  // For debugging
  useEffect(() => {
    console.log("Current invoice state:", invoice);
    console.log("Is editing mode:", isEditing);
    if (Array.isArray(invoice.items)) {
      console.log("Items count:", invoice.items.length);
    }
  }, [invoice, isEditing]);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-muted/10">
        <Sidebar />
        <div className="flex-1 overflow-auto pl-14 md:pl-56">
          <main className="container mx-auto py-8">
            <InvoiceLoading />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-muted/10">
      <Sidebar />
      <div className="flex-1 overflow-auto pl-14 md:pl-56">
        <main className="container mx-auto py-8">
          <InvoiceFormContainer 
            invoice={invoice}
            setInvoice={setInvoice}
            isEditing={isEditing}
            isLoading={isLoading}
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
