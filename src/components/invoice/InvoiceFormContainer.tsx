
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { clients } from '@/mockData';
import InvoiceHeader from '@/components/invoice/InvoiceHeader';
import InvoiceItems from '@/components/invoice/InvoiceItems';
import InvoiceSummary from '@/components/invoice/InvoiceSummary';
import InvoiceNotes from '@/components/invoice/InvoiceNotes';
import InvoiceActions from '@/components/invoice/InvoiceActions';
import { Invoice, InvoiceItem } from '@/types';

interface InvoiceFormContainerProps {
  invoice: Invoice;
  setInvoice: React.Dispatch<React.SetStateAction<Invoice>>;
  isEditing: boolean;
  isLoading?: boolean;
  addItem: () => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, field: keyof InvoiceItem, value: any) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  saveInvoice: () => void;
  generatePDF: () => void;
  formatCurrency: (amount: number) => string;
}

const InvoiceFormContainer: React.FC<InvoiceFormContainerProps> = ({
  invoice,
  setInvoice,
  isEditing,
  isLoading = false,
  addItem,
  removeItem,
  updateItem,
  handleInputChange,
  saveInvoice,
  generatePDF,
  formatCurrency
}) => {
  // Debug when adding item
  const handleAddItem = () => {
    console.log("Add item called from InvoiceFormContainer");
    addItem();
  };

  // Ensure invoice.items is always an array
  useEffect(() => {
    console.log("InvoiceFormContainer: Current invoice items:", invoice.items);
  }, [invoice.items]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading invoice data...</p>
      </div>
    );
  }

  // Ensure items is always an array
  const items = Array.isArray(invoice.items) ? invoice.items : [];

  return (
    <>
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
          invoice={{...invoice, items}}
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
    </>
  );
};

export default InvoiceFormContainer;
