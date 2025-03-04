
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import InvoiceItem from "./InvoiceItem";
import { Invoice, InvoiceItem as InvoiceItemType } from "@/types";

interface InvoiceItemsProps {
  invoice: Invoice;
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, field: keyof InvoiceItemType, value: any) => void;
  formatCurrency: (amount: number) => string;
}

const InvoiceItems: React.FC<InvoiceItemsProps> = ({ 
  invoice, 
  onAddItem, 
  onRemoveItem, 
  onUpdateItem,
  formatCurrency 
}) => {
  const handleAddItem = () => {
    console.log("Add item button clicked from InvoiceItems component");
    onAddItem();
  };

  // Ensure we always have an array of items to work with
  const items = Array.isArray(invoice.items) ? invoice.items : [];

  return (
    <div>
      <h3 className="mb-4 text-lg font-medium">Invoice Items</h3>
      
      <div className="mb-3 grid grid-cols-12 gap-2 rounded-t-md bg-muted/50 p-3 font-medium">
        <div className="col-span-5">Item</div>
        <div className="col-span-2 text-center">Quantity</div>
        <div className="col-span-2 text-center">Rate</div>
        <div className="col-span-2 text-right">Amount</div>
        <div className="col-span-1"></div>
      </div>
      
      {items.map((item) => (
        <InvoiceItem
          key={item.id}
          item={item}
          onUpdate={onUpdateItem}
          onRemove={onRemoveItem}
          formatCurrency={formatCurrency}
        />
      ))}
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-2"
        onClick={handleAddItem}
      >
        <Plus className="mr-1 h-4 w-4" />
        Add Line Item
      </Button>
    </div>
  );
};

export default InvoiceItems;
