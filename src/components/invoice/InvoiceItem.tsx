
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
          onChange={(e) => onUpdate(item.id, "quantity", e.target.value)}
          className="text-center"
        />
      </div>
      <div className="col-span-2">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
          <Input
            type="text"
            inputMode="decimal"
            value={formatCurrency(item.rate)}
            onChange={(e) => {
              const value = e.target.value.replace(/[^\d.]/g, '');
              onUpdate(item.id, "rate", parseFloat(value) || 0);
            }}
            className="pl-8 text-center"
          />
        </div>
      </div>
      <div className="col-span-2 flex items-center justify-end">
        ${formatCurrency(item.amount)}
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
