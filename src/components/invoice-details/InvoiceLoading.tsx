
import React from "react";
import Sidebar from "@/components/Sidebar";
import { Loader2 } from "lucide-react";

const InvoiceLoading: React.FC = () => {
  return (
    <div className="flex h-screen bg-muted/10">
      <Sidebar />
      <div className="flex-1 pl-14 md:pl-56">
        <main className="container mx-auto py-8">
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading invoice data...</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default InvoiceLoading;
