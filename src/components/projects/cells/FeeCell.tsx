
import React from "react";
import { DollarSign } from "lucide-react";
import { Currency } from "@/types";

interface FeeCellProps {
  fee: number;
  currency: Currency;
}

const FeeCell = ({ fee, currency }: FeeCellProps) => {
  return (
    <div className="flex items-center gap-1">
      <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
      {fee.toLocaleString()} {currency}
    </div>
  );
};

export default FeeCell;
