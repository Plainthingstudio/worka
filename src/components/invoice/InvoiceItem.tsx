
import React, { useEffect } from "react";
import { Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InvoiceItem as InvoiceItemType } from "@/types";
import { calculateItemAmount } from "@/utils/invoiceCalculations";

interface InvoiceItemProps {
  item: InvoiceItemType;
  onUpdate: (id: string, field: keyof InvoiceItemType, value: any) => void;
  onRemove: (id: string) => void;
  formatCurrency: (amount: number) => string;
}

const InvoiceItem: React.FC<InvoiceItemProps> = ({ 
  item, 
  onUpdate, 
  onRemove, 
  formatCurrency 
}) => {
  // Validate input data
  if (!item || typeof item !== 'object') {
    console.error("Invalid item provided to InvoiceItem component:", item);
    return null;
  }
  
  // Ensure we have valid values for rendering
  const itemId = item.id || '';
  const description = item.description || '';
  const quantity = Number(item.quantity) || 1;
  const rate = Number(item.rate) || 0;
  const amount = Number(item.amount) || 0;

  console.log("Rendering InvoiceItem:", { id: itemId, description, quantity, rate, amount });

  // Handle rate change
  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    console.log(`Updating rate for item ${itemId} to:`, value);
    onUpdate(itemId, "rate", value);
  };

  // Handle quantity change
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    const validValue = value > 0 ? value : 1;
    console.log(`Updating quantity for item ${itemId} to:`, validValue);
    onUpdate(itemId, "quantity", validValue);
  };

  // Handle description change
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(`Updating description for item ${itemId} to:`, e.target.value);
    onUpdate(itemId, "description", e.target.value);
  };

  // Handle remove button click
  const handleRemove = () => {
    console.log(`Removing item with ID:`, itemId);
    onRemove(itemId);
  };

  return (
    <div className="mb-2 grid grid-cols-12 gap-2 rounded-md border p-2">
      <div className="col-span-5">
        <Input
          value={description}
          onChange={handleDescriptionChange}
          placeholder="Item description"
        />
      </div>
      <div className="col-span-2">
        <Input
          type="number"
          min="1"
          value={quantity}
          onChange={handleQuantityChange}
          className="text-center"
        />
      </div>
      <div className="col-span-2">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={rate}
            onChange={handleRateChange}
            className="pl-8 text-center"
          />
        </div>
      </div>
      <div className="col-span-2 flex items-center justify-end">
        ${formatCurrency(amount)}
      </div>
      <div className="col-span-1 flex items-center justify-center">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={handleRemove}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default InvoiceItem;
