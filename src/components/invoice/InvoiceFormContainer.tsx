
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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
  React.useEffect(() => {
    console.log("InvoiceFormContainer: Current invoice items:", invoice.items);
  }, [invoice.items]);

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
    </>
  );
};

export default InvoiceFormContainer;
