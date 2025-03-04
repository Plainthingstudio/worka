
import React from "react";
import { Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InvoiceItem as InvoiceItemType } from "@/types";

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
  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    onUpdate(item.id, "rate", value);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    onUpdate(item.id, "quantity", value > 0 ? value : 1);
  };

  // Calculate the current amount based on quantity and rate
  const amount = Number(item.quantity) * Number(item.rate);

  return (
    <div className="mb-2 grid grid-cols-12 gap-2 rounded-md border p-2">
      <div className="col-span-5">
        <Input
          value={item.description}
          onChange={(e) => onUpdate(item.id, "description", e.target.value)}
          placeholder="Item description"
        />
      </div>
      <div className="col-span-2">
        <Input
          type="number"
          min="1"
          value={item.quantity}
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
            value={item.rate}
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
          onClick={() => onRemove(item.id)}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default InvoiceItem;
