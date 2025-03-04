
import React, { useEffect, useState } from 'react';
import { clients } from '@/mockData';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import InvoiceFormContainer from '@/components/invoice/InvoiceFormContainer';
import { useInvoiceForm } from '@/hooks/useInvoiceForm';
import InvoiceLoading from '@/components/invoice-details/InvoiceLoading';

const InvoiceForm = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const {
    invoice,
    setInvoice,
    isEditing,
    isLoading,
    addItem,
    removeItem,
    updateItem,
    handleInputChange,
    saveInvoice,
    generatePDF,
    formatCurrency
  } = useInvoiceForm();

  // For debugging
  useEffect(() => {
    console.log("Current invoice state:", invoice);
    console.log("Is editing mode:", isEditing);
    if (Array.isArray(invoice.items)) {
      console.log("Items count:", invoice.items.length);
    }
  }, [invoice, isEditing]);

  // Listen for sidebar state changes
  useEffect(() => {
    const handleSidebarChange = () => {
      const sidebarElement = document.querySelector('[class*="w-56"], [class*="w-14"]');
      setIsSidebarExpanded(sidebarElement?.classList.contains('w-56') || false);
    };

    // Initial check
    handleSidebarChange();

    // Set up mutation observer to watch for class changes on the sidebar
    const observer = new MutationObserver(handleSidebarChange);
    const sidebarElement = document.querySelector('[class*="flex flex-col border-r"]');
    
    if (sidebarElement) {
      observer.observe(sidebarElement, { attributes: true, attributeFilter: ['class'] });
    }

    return () => observer.disconnect();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-muted/10">
        <Sidebar />
        <div 
          className={`flex-1 w-full transition-all duration-300 ease-in-out ${
            isSidebarExpanded ? "ml-56" : "ml-14"
          }`}
        >
          <Navbar title={isEditing ? "Edit Invoice" : "New Invoice"} />
          <main className="p-6">
            <InvoiceLoading />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-muted/10">
      <Sidebar />
      <div 
        className={`flex-1 w-full transition-all duration-300 ease-in-out ${
          isSidebarExpanded ? "ml-56" : "ml-14"
        }`}
      >
        <Navbar title={isEditing ? "Edit Invoice" : "New Invoice"} />
        <main className="p-6">
          <InvoiceFormContainer 
            invoice={invoice}
            setInvoice={setInvoice}
            isEditing={isEditing}
            isLoading={isLoading}
            addItem={addItem}
            removeItem={removeItem}
            updateItem={updateItem}
            handleInputChange={handleInputChange}
            saveInvoice={saveInvoice}
            generatePDF={generatePDF}
            formatCurrency={formatCurrency}
          />
        </main>
      </div>
    </div>
  );
};

export default InvoiceForm;
