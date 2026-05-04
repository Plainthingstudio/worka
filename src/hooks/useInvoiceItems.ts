
import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { InvoiceItem } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { createEmptyItem, calculateItemAmount } from '@/utils/invoiceCalculations';

export function useInvoiceItems(initialItems: InvoiceItem[] = []) {
  const { toast } = useToast();
  
  // Line items are owned here; parent `invoice.items` is derived via merge in useInvoiceForm.
  // Do not sync from parent on every prop change — that races when hook rows are ahead of
  // parent (e.g. payment % rescale) and reverts totals.
  const [items, setItems] = useState<InvoiceItem[]>(() => {
    // Ensure we have a valid array of items
    if (!Array.isArray(initialItems) || initialItems.length === 0) {
      console.log("No initialItems provided to useInvoiceItems, creating default empty item");
      return [createEmptyItem()];
    }
    
    console.log("Initializing useInvoiceItems with:", initialItems);
    
    // Process and validate each item
    return initialItems.map(item => ({
      id: item.id || uuidv4(),
      description: item.description || "",
      quantity: Number(item.quantity) || 1,
      rate: Number(item.rate) || 0,
      amount: item.amount || calculateItemAmount(Number(item.quantity) || 1, Number(item.rate) || 0)
    }));
  });

  const addItem = useCallback(() => {
    const newItem = createEmptyItem();
    console.log("Adding new item:", newItem);
    
    setItems(currentItems => {
      // Ensure currentItems is an array
      const validItems = Array.isArray(currentItems) ? currentItems : [];
      return [...validItems, newItem];
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    console.log("Attempting to remove item with ID:", itemId);
    
    setItems(currentItems => {
      // Ensure currentItems is an array
      const validItems = Array.isArray(currentItems) ? currentItems : [createEmptyItem()];
      
      // Don't remove the last item
      if (validItems.length <= 1) {
        toast({
          title: "Cannot remove item",
          description: "Invoice must have at least one item.",
          variant: "destructive"
        });
        return validItems;
      }
      
      return validItems.filter(item => item.id !== itemId);
    });
  }, [toast]);

  const updateItem = useCallback((id: string, field: keyof InvoiceItem, value: any) => {
    console.log(`Updating item ${id}, field: ${field}, value:`, value);
    
    setItems(currentItems => {
      // Ensure currentItems is an array
      const validItems = Array.isArray(currentItems) ? currentItems : [createEmptyItem()];
      
      return validItems.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          
          // Automatically update amount when quantity or rate changes
          if (field === 'quantity' || field === 'rate') {
            updatedItem.amount = calculateItemAmount(
              field === 'quantity' ? Number(value) : Number(item.quantity), 
              field === 'rate' ? Number(value) : Number(item.rate)
            );
            console.log(`Auto-updated amount for item ${id} to:`, updatedItem.amount);
          }
          
          return updatedItem;
        }
        return item;
      });
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
