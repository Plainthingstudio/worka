
import React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

interface DateCellProps {
  date: Date;
}

const DateCell = ({ date }: DateCellProps) => {
  return (
    <div className="flex items-center gap-1 text-muted-foreground">
      <CalendarIcon className="h-3.5 w-3.5" />
      {format(new Date(date), "MMM dd, yyyy")}
    </div>
  );
};

export default DateCell;
