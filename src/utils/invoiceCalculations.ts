
import { Invoice, InvoiceItem } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const calculateItemAmount = (quantity: number, rate: number): number => {
  return (Number(quantity) || 1) * (Number(rate) || 0);
};

export const calculateInvoiceTotals = (
  items: InvoiceItem[],
  taxPercentage: number,
  discountPercentage: number
) => {
  if (!Array.isArray(items) || items.length === 0) {
    console.log("No items array or empty items array provided to calculateInvoiceTotals");
    return {
      subtotal: 0,
      taxAmount: 0,
      discountAmount: 0,
      total: 0,
      updatedItems: []
    };
  }
  
  console.log("Calculating totals for items:", items);
  
  const updatedItems = items.map(item => ({
    ...item,
    id: item.id || uuidv4(),
    description: item.description || "",
    quantity: Number(item.quantity) || 1,
    rate: Number(item.rate) || 0,
    amount: calculateItemAmount(Number(item.quantity) || 1, Number(item.rate) || 0)
  }));

  const subtotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = (subtotal * (Number(taxPercentage) || 0)) / 100;
  const discountAmount = (subtotal * (Number(discountPercentage) || 0)) / 100;
  const total = subtotal + taxAmount - discountAmount;

  console.log("Calculation results:", { subtotal, taxAmount, discountAmount, total });

  return {
    subtotal,
    taxAmount,
    discountAmount,
    total,
    updatedItems
  };
};

export const createEmptyItem = (): InvoiceItem => {
  const newItem = {
    id: uuidv4(),
    description: "",
    quantity: 1,
    rate: 0,
    amount: 0,
  };
  console.log("Created empty item:", newItem);
  return newItem;
};

export const createNewInvoice = (): Invoice => {
  const emptyItem = createEmptyItem();
  const newInvoice = {
    id: uuidv4(),
    invoiceNumber: `INV-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`,
    clientId: "",
    date: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    paymentTerms: "Net 30",
    items: [emptyItem],
    subtotal: 0,
    taxPercentage: 0,
    taxAmount: 0,
    discountPercentage: 0,
    discountAmount: 0,
    total: 0,
    notes: "",
    termsAndConditions: "Payment is due within the specified term. Please make the payment to the specified account.",
    createdAt: new Date(),
    status: "Draft",
  };
  console.log("Created new invoice:", newInvoice);
  return newInvoice;
};

export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
