
import React, { useEffect } from 'react';
import { Layout } from '@/components/Layout';
import InvoiceFormContainer from '@/components/invoice/InvoiceFormContainer';
import { useInvoiceForm } from '@/hooks/useInvoiceForm';
import InvoiceLoading from '@/components/invoice-details/InvoiceLoading';
import { useClients } from '@/hooks/useClients';

const InvoiceForm = () => {
  const { clients, isLoading: isClientsLoading } = useClients();
  const {
    invoice,
    setInvoice,
    isEditing,
    isLoading: isInvoiceLoading,
    addItem,
    removeItem,
    updateItem,
    handleInputChange,
    saveInvoice,
    generatePDF,
    formatCurrency
  } = useInvoiceForm();

  const isLoading = isInvoiceLoading || isClientsLoading;

  // Debug log to track invoice items
  useEffect(() => {
    if (invoice && Array.isArray(invoice.items)) {
      console.log("InvoiceForm: invoice items updated:", invoice.items);
    }
  }, [invoice?.items]);

  if (isLoading) {
    return (
      <Layout title={isEditing ? "Edit Invoice" : "New Invoice"}>
        <main className="p-6">
          <InvoiceLoading />
        </main>
      </Layout>
    );
  }

  return (
    <Layout title={isEditing ? "Edit Invoice" : "New Invoice"}>
      <main className="p-6">
        <InvoiceFormContainer 
          invoice={invoice}
          setInvoice={setInvoice}
          isEditing={isEditing}
          isLoading={isLoading}
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
    </Layout>
  );
};

export default InvoiceForm;
