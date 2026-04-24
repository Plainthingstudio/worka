
import React, { useState } from "react";
import { Currency } from "@/types";

interface FeeCellProps {
  fee: number;
  currency: Currency;
  onSave?: (fee: number, currency: Currency) => void;
}

const CURRENCIES: Currency[] = ["USD", "IDR"];

const FeeCell = ({ fee, currency, onSave }: FeeCellProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [feeValue, setFeeValue] = useState(String(fee));
  const [currencyValue, setCurrencyValue] = useState<Currency>(currency);

  if (!onSave) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-muted-foreground text-xs">$</span>
        {fee.toLocaleString()} {currency}
      </div>
    );
  }

  const commit = () => {
    const parsed = parseFloat(feeValue.replace(/,/g, ""));
    onSave(isNaN(parsed) ? fee : parsed, currencyValue);
    setIsEditing(false);
  };

  return isEditing ? (
    <div
      className="flex items-center gap-1"
      onClick={e => e.stopPropagation()}
    >
      <input
        autoFocus
        type="number"
        value={feeValue}
        className="w-24 rounded border border-[#3762FB] px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-[#3762FB]"
        onChange={e => setFeeValue(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") { setFeeValue(String(fee)); setCurrencyValue(currency); setIsEditing(false); }
        }}
      />
      <select
        value={currencyValue}
        className="rounded border border-[#E2E8F0] px-1 py-1 text-xs outline-none focus:border-[#3762FB]"
        onChange={e => setCurrencyValue(e.target.value as Currency)}
        onClick={e => e.stopPropagation()}
      >
        {CURRENCIES.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  ) : (
    <button
      className="flex items-center gap-1 rounded px-1 py-0.5 hover:bg-[#F1F5F9] transition-colors text-sm"
      onClick={e => { e.stopPropagation(); setFeeValue(String(fee)); setCurrencyValue(currency); setIsEditing(true); }}
    >
      <span className="text-muted-foreground text-xs">$</span>
      {fee.toLocaleString()} {currency}
    </button>
  );
};

export default FeeCell;
