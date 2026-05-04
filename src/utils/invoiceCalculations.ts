
import { Invoice, InvoiceItem, InvoiceType } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const calculateItemAmount = (quantity: number, rate: number): number => {
  return (Number(quantity) || 1) * (Number(rate) || 0);
};

/** Tax and discount amounts when both percentages apply to the same base (matches full invoice math). */
export const taxDiscountAmountsFromBase = (
  base: number,
  taxPercentage: number,
  discountPercentage: number
) => {
  const taxAmount = (base * (Number(taxPercentage) || 0)) / 100;
  const discountAmount = (base * (Number(discountPercentage) || 0)) / 100;
  return { taxAmount, discountAmount };
};

export const totalFromBaseWithTaxDiscount = (
  base: number,
  taxPercentage: number,
  discountPercentage: number
) => {
  const { taxAmount, discountAmount } = taxDiscountAmountsFromBase(base, taxPercentage, discountPercentage);
  return base + taxAmount - discountAmount;
};

export function normalizeInvoiceLineItems(items: InvoiceItem[]): InvoiceItem[] {
  return items.map((item) => ({
    ...item,
    id: item.id || uuidv4(),
    description: item.description || "",
    quantity: Number(item.quantity) || 1,
    rate: Number(item.rate) || 0,
    amount: calculateItemAmount(Number(item.quantity) || 1, Number(item.rate) || 0),
  }));
}

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

  const updatedItems = normalizeInvoiceLineItems(items);

  const subtotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);
  const { taxAmount, discountAmount } = taxDiscountAmountsFromBase(subtotal, taxPercentage, discountPercentage);
  const total = totalFromBaseWithTaxDiscount(subtotal, taxPercentage, discountPercentage);

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
    paymentTerms: "",
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
    status: "Draft" as "Draft" | "Sent" | "Paid" | "Overdue",
    invoiceType: "Full Invoice" as InvoiceType,
    paymentType: "Full Invoice" as InvoiceType,
    paymentMode: "percentage" as const,
    paymentPercentage: 50,
    paymentAmount: 0,
    projectTotalSnapshot: 0,
    alreadyPaidSnapshot: 0,
    remainingAmountSnapshot: 0,
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
