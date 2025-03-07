import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { InvoiceItem } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { createEmptyItem } from '@/utils/invoiceCalculations';

export function useInvoiceItems(initialItems: InvoiceItem[] = []) {
  const { toast } = useToast();
  
  // Initialize items state
  const [items, setItems] = useState<InvoiceItem[]>(() => {
    // Process initial items if they exist
    if (Array.isArray(initialItems) && initialItems.length > 0) {
      console.log("Initializing useInvoiceItems with:", initialItems);
      return initialItems.map(item => ({
        ...item,
        id: item.id || uuidv4(),
        description: item.description || "",
        quantity: Number(item.quantity) || 1,
        rate: Number(item.rate) || 0,
        amount: Number(item.amount) || 0
      }));
    }
    // Otherwise create a default empty item
    return [createEmptyItem()];
  });

  // This effect runs whenever initialItems changes (e.g., when invoice is loaded from backend)
  useEffect(() => {
    // Only update if initialItems is a non-empty array
    if (Array.isArray(initialItems) && initialItems.length > 0) {
      console.log("useInvoiceItems: Updating items from initialItems change:", initialItems);
      
      const processedItems = initialItems.map(item => ({
        ...item,
        id: item.id || uuidv4(),
        description: item.description || "",
        quantity: Number(item.quantity) || 1,
        rate: Number(item.rate) || 0,
        amount: Number(item.amount) || 0
      }));
      
      // Check if the items are actually different before updating
      const areItemsDifferent = JSON.stringify(items) !== JSON.stringify(processedItems);
      
      if (areItemsDifferent) {
        console.log("Items have significant changes, updating state");
        setItems(processedItems);
      }
    }
  }, [initialItems]);

  const addItem = useCallback(() => {
    const newItem = createEmptyItem();
    console.log("Adding new item:", newItem);

    setItems(currentItems => {
      const validItems = Array.isArray(currentItems) ? currentItems : [];
      return [...validItems, newItem];
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    if (!Array.isArray(items) || items.length <= 1) {
      toast({
        title: "Cannot remove item",
        description: "Invoice must have at least one item.",
        variant: "destructive"
      });
      return;
    }
    
    console.log("Removing item with ID:", itemId);
    setItems(currentItems => currentItems.filter(item => item.id !== itemId));
  }, [items, toast]);

  const updateItem = useCallback((id: string, field: keyof InvoiceItem, value: any) => {
    console.log(`Updating item ${id}, field: ${field}, value:`, value);
    
    setItems(currentItems => {
      if (!Array.isArray(currentItems)) {
        return [createEmptyItem()];
      }
      
      return currentItems.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      );
    });
  }, []);

  return {
    items,
    setItems,
    addItem,
    removeItem,
    updateItem
  };
}
