
import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { InvoiceItem } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { createEmptyItem } from '@/utils/invoiceCalculations';

export function useInvoiceItems(initialItems: InvoiceItem[] = []) {
  const [items, setItems] = useState<InvoiceItem[]>(
    Array.isArray(initialItems) && initialItems.length > 0 ? initialItems : [createEmptyItem()]
  );
  const { toast } = useToast();

  const addItem = useCallback(() => {
    const newItem = createEmptyItem();
    console.log("Adding new item:", newItem);
    console.log("Current items:", items);

    setItems(currentItems => {
      const validItems = Array.isArray(currentItems) ? currentItems : [];
      const updatedItems = [...validItems, newItem];
      console.log("Updated items after add:", updatedItems);
      return updatedItems;
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
