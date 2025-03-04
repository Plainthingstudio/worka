
import React from "react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Client, Invoice } from "@/types";

interface InvoiceHeaderProps {
  invoice: Invoice;
  clients: Client[];
  setInvoice: React.Dispatch<React.SetStateAction<Invoice>>;
}

const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({ invoice, clients, setInvoice }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInvoice(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Label htmlFor="invoiceNumber">Invoice Number</Label>
          <Input
            id="invoiceNumber"
            name="invoiceNumber"
            value={invoice.invoiceNumber}
            onChange={handleInputChange}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="clientId">Bill To</Label>
          <Select
            value={invoice.clientId}
            onValueChange={(value) => setInvoice(prev => ({ ...prev, clientId: value }))}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client: Client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {invoice.clientId && (
            <div className="mt-2 text-sm text-muted-foreground">
              {(() => {
                const client = clients.find(c => c.id === invoice.clientId);
                return client ? (
                  <>
                    <div>{client.email}</div>
                    <div>{client.phone}</div>
                  </>
                ) : null;
              })()}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="mt-1 w-full justify-start text-left font-normal"
              >
                {format(invoice.date, "PP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={invoice.date}
                onSelect={(date) => setInvoice(prev => ({ ...prev, date: date || new Date() }))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div>
          <Label>Due Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="mt-1 w-full justify-start text-left font-normal"
              >
                {format(invoice.dueDate, "PP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={invoice.dueDate}
                onSelect={(date) => setInvoice(prev => ({ ...prev, dueDate: date || new Date() }))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div>
        <Label htmlFor="paymentTerms">Payment Terms</Label>
        <Input
          id="paymentTerms"
          name="paymentTerms"
          value={invoice.paymentTerms}
          onChange={handleInputChange}
          className="mt-1"
        />
      </div>
    </div>
  );
};

export default InvoiceHeader;
