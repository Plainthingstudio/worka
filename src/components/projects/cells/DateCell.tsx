
import React, { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

interface DateCellProps {
  date: Date;
  onSave?: (date: Date) => void;
}

const DateCell = ({ date, onSave }: DateCellProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(format(new Date(date), "yyyy-MM-dd"));

  if (!onSave) {
    return (
      <div className="flex items-center gap-1 text-muted-foreground">
        <CalendarIcon className="h-3.5 w-3.5" />
        {format(new Date(date), "MMM dd, yyyy")}
      </div>
    );
  }

  const commit = (raw: string) => {
    const parsed = new Date(raw);
    if (!isNaN(parsed.getTime())) onSave(parsed);
    setIsEditing(false);
  };

  return isEditing ? (
    <input
      type="date"
      autoFocus
      value={value}
      className="rounded border border-[#3762FB] px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-[#3762FB] w-[130px]"
      onClick={e => e.stopPropagation()}
      onChange={e => setValue(e.target.value)}
      onBlur={e => { e.stopPropagation(); commit(value); }}
      onKeyDown={e => {
        if (e.key === "Enter") { e.stopPropagation(); commit(value); }
        if (e.key === "Escape") { e.stopPropagation(); setIsEditing(false); }
      }}
    />
  ) : (
    <button
      className="flex items-center gap-1 text-muted-foreground rounded px-1 py-0.5 hover:bg-[#F1F5F9] transition-colors text-sm"
      onClick={e => { e.stopPropagation(); setIsEditing(true); }}
    >
      <CalendarIcon className="h-3.5 w-3.5" />
      {format(new Date(date), "MMM dd, yyyy")}
    </button>
  );
};

export default DateCell;
