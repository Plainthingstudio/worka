import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { Invoice, Project } from '@/types';
import { useInvoiceItems } from '@/hooks/useInvoiceItems';
import { useInvoiceValidation } from '@/hooks/useInvoiceValidation';
import { useInvoiceData } from '@/hooks/useInvoiceData';
import { useInvoicePdf } from '@/hooks/useInvoicePdf';
import { useInvoices } from '@/hooks/useInvoices';
import { useProjects } from '@/hooks/useProjects';
import { useServices } from '@/hooks/useServices';
import { calculateItemAmount, formatCurrency, normalizeInvoiceLineItems, taxDiscountAmountsFromBase, totalFromBaseWithTaxDiscount } from '@/utils/invoiceCalculations';
import {
  buildPartialInvoiceItemsFromProject,
  invoicePartialSeedCompositionKey,
} from '@/utils/invoiceProjectItems';
import {
  calculateInvoicePaymentAmount,
  getInvoiceType,
  getPaidAmountForProject,
  isPartialInvoiceType,
} from '@/utils/invoiceTypes';

function mergeInvoiceFromItems(
  prev: Invoice,
  lineItems: Invoice['items'],
  selectedProject: Project | undefined,
  paidInvoices: Invoice[],
): Invoice {
  const invoiceType = getInvoiceType(prev);
  const taxPct = prev.taxPercentage || 0;
  const discPct = prev.discountPercentage || 0;

  const updatedItems = normalizeInvoiceLineItems(lineItems);
  const fullSubtotal = updatedItems.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  );
  const { taxAmount, discountAmount } = taxDiscountAmountsFromBase(fullSubtotal, taxPct, discPct);

  const next: Invoice = {
    ...prev,
    items: updatedItems,
    subtotal: fullSubtotal,
    taxAmount,
    discountAmount,
    total: 0,
  };

  if (isPartialInvoiceType(invoiceType) && selectedProject) {
    const projectTotal = Number(selectedProject.fee) || 0;
    const alreadyPaid = getPaidAmountForProject(paidInvoices, selectedProject.id, prev.id);
    const paymentBase = calculateInvoicePaymentAmount({
      invoiceType,
      paymentMode: prev.paymentMode || "percentage",
      paymentPercentage:
        prev.paymentPercentage ?? (invoiceType === "Milestone Payment" ? 25 : 50),
      paymentAmount: prev.paymentAmount || 0,
      projectTotal,
      alreadyPaid,
    });
    next.clientId = selectedProject.clientId;
    next.currency = selectedProject.currency;
    next.projectTotalSnapshot = projectTotal;
    next.alreadyPaidSnapshot = alreadyPaid;
    next.paymentAmount = paymentBase;
    next.total = totalFromBaseWithTaxDiscount(paymentBase, taxPct, discPct);
    next.remainingAmountSnapshot = Math.max(projectTotal - alreadyPaid - next.total, 0);
  } else {
    next.total = totalFromBaseWithTaxDiscount(fullSubtotal, taxPct, discPct);
    next.paymentAmount = 0;
  }

  return next;
}

function invoiceItemsMergeSignature(inv: Invoice): string {
  return JSON.stringify({
    items: inv.items,
    subtotal: inv.subtotal,
    total: inv.total,
    taxAmount: inv.taxAmount,
    discountAmount: inv.discountAmount,
    remaining: inv.remainingAmountSnapshot,
    projectTotal: inv.projectTotalSnapshot,
    alreadyPaid: inv.alreadyPaidSnapshot,
    paymentAmount: inv.paymentAmount,
    paymentMode: inv.paymentMode,
    paymentPercentage: inv.paymentPercentage,
    clientId: inv.clientId,
    currency: inv.currency,
  });
}

export function useInvoiceForm() {
  const navigate = useNavigate();
  const { invoiceId } = useParams();
  
  // Use the extracted hooks
  const { validateInvoice } = useInvoiceValidation();
  const { saveInvoice: saveToDB, invoices } = useInvoices();
  const { projects, isLoading: isProjectsLoading } = useProjects();
  const { services } = useServices();
  const { invoice: initialInvoice, setInvoice: setBaseInvoice, isLoading, isEditing } = useInvoiceData(invoiceId);
  const { generatePDF } = useInvoicePdf();
  
  // Maintain a local state of the invoice to prevent circular updates
  const [invoice, setInvoice] = useState<Invoice>(initialInvoice);
  const lastItemsMergeSigRef = useRef("");
  
  // Update local invoice when useInvoiceData resets or loads a different document
  useEffect(() => {
    setInvoice((prev) => {
      if (
        prev.id === initialInvoice.id &&
        invoiceItemsMergeSignature(prev) === invoiceItemsMergeSignature(initialInvoice)
      ) {
        return prev;
      }
      lastItemsMergeSigRef.current = "";
      return initialInvoice;
    });
  }, [initialInvoice]);
  
  // Initialize items hook with items from local invoice
  const { 
    items, 
    setItems, 
    addItem, 
    removeItem, 
    updateItem 
  } = useInvoiceItems(invoice?.items || []);

  const serverItemsHydratedRef = useRef(false);
  useEffect(() => {
    serverItemsHydratedRef.current = false;
  }, [invoiceId]);

  useEffect(() => {
    if (!isEditing || isLoading || !invoiceId) return;
    if (serverItemsHydratedRef.current) return;
    if (initialInvoice.id !== invoiceId) return;

    serverItemsHydratedRef.current = true;
    const raw = initialInvoice.items || [];
    setItems(
      raw.map((item) => ({
        id: item.id || uuidv4(),
        description: item.description || "",
        quantity: Number(item.quantity) || 1,
        rate: Number(item.rate) || 0,
        amount:
          item.amount ||
          calculateItemAmount(Number(item.quantity) || 1, Number(item.rate) || 0),
      })),
    );
    lastItemsMergeSigRef.current = "";
  }, [isEditing, isLoading, invoiceId, initialInvoice.id, initialInvoice.items, setItems]);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === invoice.projectId),
    [projects, invoice.projectId]
  );

  const itemsRef = useRef(items);
  itemsRef.current = items;
  const partialSeedCompositionRef = useRef<string | null>(null);
  const partialSeedTargetRef = useRef<number | undefined>(undefined);
  const invoiceRef = useRef(invoice);
  invoiceRef.current = invoice;

  const hasSavedOnceRef = useRef(false);
  const persistLockRef = useRef(false);

  useEffect(() => {
    if (isEditing) {
      hasSavedOnceRef.current = true;
    }
  }, [isEditing]);

  const [isPersisting, setIsPersisting] = useState(false);

  // When items change, update invoice with new totals
  useEffect(() => {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return;
    }

    console.log("useInvoiceForm: Items changed, recalculating totals", items);

    const prev = invoiceRef.current;
    const next = mergeInvoiceFromItems(prev, items, selectedProject, invoices);
    const sig = invoiceItemsMergeSignature(next);
    if (sig === lastItemsMergeSigRef.current) {
      return;
    }
    lastItemsMergeSigRef.current = sig;
    setInvoice(next);
    setBaseInvoice(next);
  }, [
    items,
    selectedProject,
    invoices,
    invoice.taxPercentage,
    invoice.discountPercentage,
    invoice.invoiceType,
    invoice.paymentType,
    invoice.paymentMode,
    invoice.paymentPercentage,
    invoice.paymentAmount,
    invoice.id,
    setBaseInvoice,
  ]);

  useEffect(() => {
    const inv = invoiceRef.current;
    const invoiceType = getInvoiceType(inv);
    if (!isPartialInvoiceType(invoiceType)) {
      partialSeedCompositionRef.current = null;
      partialSeedTargetRef.current = undefined;
      return;
    }
    if (!selectedProject || isEditing) {
      return;
    }

    const projectTotal = Number(selectedProject.fee) || 0;
    const alreadyPaid = getPaidAmountForProject(invoices, selectedProject.id, inv.id);
    const target = calculateInvoicePaymentAmount({
      invoiceType,
      paymentMode: inv.paymentMode || "percentage",
      paymentPercentage: inv.paymentPercentage ?? (invoiceType === "Milestone Payment" ? 25 : 50),
      paymentAmount: inv.paymentAmount || 0,
      projectTotal,
      alreadyPaid,
    });

    const comp = invoicePartialSeedCompositionKey(selectedProject, services);
    const shouldRebuild = partialSeedCompositionRef.current !== comp;

    if (shouldRebuild) {
      const nextItems = buildPartialInvoiceItemsFromProject({
        project: selectedProject,
        services,
        invoiceType,
        targetTotal: target,
      });
      setItems(nextItems);
      partialSeedCompositionRef.current = comp;
      partialSeedTargetRef.current = target;
      lastItemsMergeSigRef.current = "";
      return;
    }

    partialSeedTargetRef.current = target;
  }, [
    invoice.invoiceType,
    invoice.paymentType,
    invoice.paymentMode,
    invoice.paymentPercentage,
    invoice.paymentAmount,
    invoice.id,
    isEditing,
    selectedProject,
    invoices,
    services,
    setItems,
  ]);

  const saveToDBRef = useRef(saveToDB);
  saveToDBRef.current = saveToDB;

  // Autosave valid drafts shortly after edits (Generate PDF / Preview also persist explicitly)
  useEffect(() => {
    if (isLoading) return;

    const timer = window.setTimeout(async () => {
      if (persistLockRef.current) return;
      const inv = invoiceRef.current;
      // Fresh blank invoice: don't validate or toast — wait until user links a client (or project fills client).
      if (!inv.clientId) return;
      if (!validateInvoice(inv, { silent: true })) return;

      persistLockRef.current = true;
      try {
        const useUpdate = isEditing || hasSavedOnceRef.current;
        const success = await saveToDBRef.current(inv, useUpdate, { silent: true });
        if (!success) return;
        if (!isEditing) {
          hasSavedOnceRef.current = true;
          navigate(`/invoices/edit/${inv.id}`, { replace: true });
        }
      } finally {
        persistLockRef.current = false;
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [invoice, isLoading, isEditing, validateInvoice, navigate]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric fields
    if (name === "taxPercentage" || name === "discountPercentage") {
      const numValue = Number(value);
      console.log(`Updating ${name} to:`, numValue);
      
      setInvoice(prev => ({
        ...prev,
        [name]: numValue
      }));
      
      // Also update the base invoice
      setBaseInvoice(prev => ({
        ...prev,
        [name]: numValue
      }));
    } 
    // Handle other fields
    else {
      console.log(`Updating ${name} to:`, value);
      
      setInvoice(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Also update the base invoice
      setBaseInvoice(prev => ({
        ...prev,
        [name]: value
      }));
    }
  }, [setBaseInvoice]);

  const submitInvoice = useCallback(async () => {
    if (!validateInvoice(invoice)) {
      return;
    }

    setIsPersisting(true);
    persistLockRef.current = true;
    try {
      const useUpdate = isEditing || hasSavedOnceRef.current;
      console.log("Submitting invoice:", invoice);
      const success = await saveToDB(invoice, useUpdate, { silent: false });
      if (success) {
        if (!isEditing) {
          hasSavedOnceRef.current = true;
        }
        navigate("/invoices");
      }
    } finally {
      persistLockRef.current = false;
      setIsPersisting(false);
    }
  }, [invoice, isEditing, validateInvoice, saveToDB, navigate]);

  const handleGeneratePDF = useCallback(async () => {
    if (!validateInvoice(invoice)) {
      return;
    }

    if (persistLockRef.current) {
      return;
    }

    setIsPersisting(true);
    persistLockRef.current = true;
    try {
      const useUpdate = isEditing || hasSavedOnceRef.current;
      console.log("Saving then generating PDF for invoice:", invoice);
      const success = await saveToDB(invoice, useUpdate, { silent: true });
      if (!success) {
        return;
      }
      if (!isEditing) {
        hasSavedOnceRef.current = true;
      }
      await generatePDF(invoice);
      if (!isEditing) {
        navigate(`/invoices/edit/${invoice.id}`, { replace: true });
      }
    } finally {
      persistLockRef.current = false;
      setIsPersisting(false);
    }
  }, [invoice, isEditing, validateInvoice, saveToDB, generatePDF, navigate]);

  const setInvoiceSynced = useCallback((value: React.SetStateAction<Invoice>) => {
    setInvoice((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      setBaseInvoice(next);
      return next;
    });
  }, [setBaseInvoice]);

  return {
    invoice,
    setInvoice: setInvoiceSynced,
    isEditing,
    isLoading: isLoading || isProjectsLoading,
    projects,
    paidInvoices: invoices,
    addItem,
    removeItem,
    updateItem,
    handleInputChange,
    saveInvoice: submitInvoice,
    generatePDF: handleGeneratePDF,
    formatCurrency,
    isPersisting,
  };
}
