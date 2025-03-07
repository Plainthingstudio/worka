
import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import InvoiceFormContainer from '@/components/invoice/InvoiceFormContainer';
import { useInvoiceForm } from '@/hooks/useInvoiceForm';
import InvoiceLoading from '@/components/invoice-details/InvoiceLoading';
import { useSidebarState } from '@/hooks/useSidebarState';
import { useClients } from '@/hooks/useClients';
import { useToast } from '@/hooks/use-toast';
import { Client } from '@/types';
import { useParams } from 'react-router-dom';

const InvoiceForm = () => {
  const { invoiceId } = useParams();
  const { isSidebarExpanded } = useSidebarState();
  const { clients, isLoading: isClientsLoading } = useClients();
  const { toast } = useToast();
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

  // For debugging
  useEffect(() => {
    console.log("Current invoice state:", invoice);
    console.log("Is editing mode:", isEditing);
    console.log("Invoice ID from params:", invoiceId);
    console.log("Clients from Supabase:", clients);
    if (Array.isArray(invoice.items)) {
      console.log("Items count:", invoice.items.length);
    }
  }, [invoice, isEditing, clients, invoiceId]);

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
      </div>
    </div>
  );
};

export default InvoiceForm;
