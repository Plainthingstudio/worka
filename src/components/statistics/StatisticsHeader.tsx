
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateRange } from "@/types";

interface StatisticsHeaderProps {
  timeFilter: string;
  dateRange: DateRange;
  setTimeFilter: (value: string) => void;
  setDateRange: (range: DateRange) => void;
}

const StatisticsHeader: React.FC<StatisticsHeaderProps> = ({
  timeFilter,
  dateRange,
  setTimeFilter,
  setDateRange,
}) => {
  const handleTimeFilterChange = (value: string) => {
    setTimeFilter(value);
    
    const now = new Date();
    let from = new Date();
    
    switch (value) {
      case "this-month":
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "last-month":
        from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
      case "this-quarter":
        const currentQuarter = Math.floor(now.getMonth() / 3);
        from = new Date(now.getFullYear(), currentQuarter * 3, 1);
        break;
      case "this-year":
        from = new Date(now.getFullYear(), 0, 1);
        break;
      case "last-year":
        from = new Date(now.getFullYear() - 1, 0, 1);
        break;
      default:
        from = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    setDateRange({ from, to: now });
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight mb-1">Statistics Dashboard</h1>
          <p className="text-muted-foreground">
            Track your business performance and metrics
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row items-center">
          <Select value={timeFilter} onValueChange={handleTimeFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="this-quarter">This Quarter</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
              <SelectItem value="last-year">Last Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          
          {timeFilter === "custom" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={(range: any) => setDateRange(range)}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatisticsHeader;
