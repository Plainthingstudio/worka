
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { clients } from '@/mockData';
import Sidebar from '@/components/Sidebar';
import InvoiceHeader from '@/components/invoice/InvoiceHeader';
import InvoiceItems from '@/components/invoice/InvoiceItems';
import InvoiceSummary from '@/components/invoice/InvoiceSummary';
import InvoiceNotes from '@/components/invoice/InvoiceNotes';
import InvoiceActions from '@/components/invoice/InvoiceActions';
import { useInvoiceForm } from '@/hooks/useInvoiceForm';

const InvoiceForm = () => {
  const {
    invoice,
    setInvoice,
    isEditing,
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
  }, [invoice]);

  // Debug when adding item
  const handleAddItem = () => {
    console.log("Add item called from InvoiceForm");
    addItem();
  };

  return (
    <div className="flex h-screen bg-muted/10">
      <Sidebar />
      <div className="flex-1 overflow-auto pl-14 md:pl-56">
        <main className="container mx-auto py-8">
          <div className="mb-6">
            <Link to="/invoices" className="flex items-center text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Invoices
            </Link>
          </div>
          
          <h1 className="mb-8 text-2xl font-semibold tracking-tight">
            {isEditing ? "Edit Invoice" : "Generate New Invoice"}
          </h1>

          <div className="space-y-6 rounded-lg border bg-card p-6 shadow-sm">
            <InvoiceHeader 
              invoice={invoice} 
              clients={clients} 
              setInvoice={setInvoice} 
            />

            <InvoiceItems 
              invoice={invoice}
              onAddItem={handleAddItem}
              onRemoveItem={removeItem}
              onUpdateItem={updateItem}
              formatCurrency={formatCurrency}
            />

            <InvoiceSummary 
              invoice={invoice}
              formatCurrency={formatCurrency}
              handleInputChange={handleInputChange}
            />

            <InvoiceNotes 
              invoice={invoice} 
              handleInputChange={handleInputChange} 
            />

            <InvoiceActions 
              isEditing={isEditing} 
              onSubmit={saveInvoice} 
              onGeneratePDF={generatePDF} 
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default InvoiceForm;
