
import React from "react";
import Sidebar from "@/components/Sidebar";

const InvoiceLoading: React.FC = () => {
  return (
    <div className="flex h-screen bg-muted/10">
      <Sidebar />
      <div className="flex-1 pl-14 md:pl-56">
        <main className="container mx-auto py-8">
          <div className="flex items-center justify-center h-64">
            <p>Loading invoice...</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default InvoiceLoading;
