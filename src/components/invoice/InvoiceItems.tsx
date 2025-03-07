
import React, { useEffect } from "react";
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
  // Ensure we always have a valid items array to work with
  const items = Array.isArray(invoice.items) ? invoice.items : [];
  
  useEffect(() => {
    console.log("InvoiceItems component received invoice items:", items);
  }, [items]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Invoice Items</h3>
      
      <div className="mb-3 grid grid-cols-12 gap-2 rounded-t-md bg-muted/50 p-3 font-medium">
        <div className="col-span-5">Item</div>
        <div className="col-span-2 text-center">Quantity</div>
        <div className="col-span-2 text-center">Rate</div>
        <div className="col-span-2 text-right">Amount</div>
        <div className="col-span-1"></div>
      </div>
      
      {items.length > 0 ? (
        <div className="space-y-2">
          {items.map((item) => (
            <InvoiceItem
              key={item.id}
              item={item}
              onUpdate={onUpdateItem}
              onRemove={onRemoveItem}
              formatCurrency={formatCurrency}
            />
          ))}
        </div>
      ) : (
        <div className="p-6 text-center border rounded-md bg-muted/10">
          <p className="text-muted-foreground mb-2">No items added yet</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddItem}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add First Item
          </Button>
        </div>
      )}
      
      {items.length > 0 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={onAddItem}
        >
          <Plus className="mr-1 h-4 w-4" />
          Add Another Item
        </Button>
      )}
    </div>
  );
};

export default InvoiceItems;
