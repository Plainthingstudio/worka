
import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { InvoiceItem } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { createEmptyItem } from '@/utils/invoiceCalculations';

export function useInvoiceItems(initialItems: InvoiceItem[] = []) {
  // Initialize with a safe default - either initialItems or an empty array
  // We'll add the default empty item in useEffect after checking
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const { toast } = useToast();

  // Initialize items when component mounts or initialItems changes
  useEffect(() => {
    if (Array.isArray(initialItems) && initialItems.length > 0) {
      console.log("Initializing items from props:", initialItems);
      
      const processedItems = initialItems.map(item => ({
        ...item,
        id: item.id || uuidv4(),
        description: item.description || "",
        quantity: Number(item.quantity) || 1,
        rate: Number(item.rate) || 0,
        amount: Number(item.amount) || 0
      }));
      
      setItems(processedItems);
    } else {
      // If no items provided, create a default empty one
      console.log("No items provided, creating default empty item");
      setItems([createEmptyItem()]);
    }
  }, []);

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
