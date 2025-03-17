
import React, { useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { InvoiceTemplate } from "@/types/template";
import { Download, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TemplatePreviewPanelProps {
  template: InvoiceTemplate;
  isApplied: boolean;
  onApplyTemplate: () => void;
}

const TemplatePreviewPanel: React.FC<TemplatePreviewPanelProps> = ({
  template,
  isApplied,
  onApplyTemplate
}) => {
  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);
  const { style } = template;

  // Mock invoice data for preview
  const mockInvoice = {
    invoiceNumber: "INV-2023-001",
    date: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    clientName: "Acme Corporation",
    clientAddress: "123 Business Street, Business City, 12345",
    clientPhone: "+1 (555) 123-4567",
    items: [
      { description: "Website Design", quantity: 1, rate: 1200, amount: 1200 },
      { description: "Logo Design", quantity: 1, rate: 600, amount: 600 },
      { description: "Hosting (Annual)", quantity: 1, rate: 240, amount: 240 }
    ],
    subtotal: 2040,
    taxPercentage: 10,
    taxAmount: 204,
    discountPercentage: 5,
    discountAmount: 102,
    total: 2142,
    notes: "Thank you for your business!",
    termsAndConditions: "Payment due within 30 days."
  };

  // Handle export as PDF (mock)
  const handleExportPDF = () => {
    toast({
      title: "PDF Export",
      description: "PDF preview export functionality would be implemented here."
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Template Preview</h2>
          <p className="text-sm text-muted-foreground">
            How your invoice will look
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExportPDF}
            className="gap-1"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
          
          <Button 
            size="sm" 
            onClick={onApplyTemplate}
            className="gap-1"
            disabled={isApplied}
          >
            <Check className="h-4 w-4" />
            {isApplied ? "Applied" : "Apply Template"}
          </Button>
        </div>
      </div>
      
      <div className="flex-1 border rounded-md bg-white">
        <ScrollArea className="h-full">
          <div 
            ref={previewRef} 
            className="p-8 min-h-full"
            style={{ fontFamily: style.fontFamily }}
          >
            {/* Invoice Header */}
            <div className="flex justify-between mb-8">
              <div style={{ order: style.logoPosition === 'right' ? 1 : 0 }}>
                <h1 
                  className="text-2xl font-bold mb-1" 
                  style={{ color: style.primaryColor }}
                >
                  INVOICE
                </h1>
                <div>
                  <div>
                    <span className="font-semibold">Invoice #:</span> {mockInvoice.invoiceNumber}
                  </div>
                  <div>
                    <span className="font-semibold">Date:</span>{" "}
                    {mockInvoice.date.toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-semibold">Due Date:</span>{" "}
                    {mockInvoice.dueDate.toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              {style.showLogo && (
                <div 
                  className="w-32 h-32 border rounded-md flex items-center justify-center"
                  style={{ order: style.logoPosition === 'right' ? 0 : 1 }}
                >
                  <div 
                    className="text-lg font-bold text-center" 
                    style={{ color: style.secondaryColor }}
                  >
                    Your Logo
                  </div>
                </div>
              )}
            </div>
            
            {/* Client Info */}
            <div 
              className="mb-8 p-4 rounded"
              style={{ 
                borderWidth: style.borderWidth,
                borderStyle: style.borderStyle,
                borderColor: style.borderColor,
                backgroundColor: `${style.secondaryColor}10`  // 10% opacity
              }}
            >
              <h2 
                className="text-lg font-semibold mb-2"
                style={{ color: style.secondaryColor }}
              >
                Bill To
              </h2>
              <div className="text-sm">
                <div className="font-medium">{mockInvoice.clientName}</div>
                <div>{mockInvoice.clientAddress}</div>
                <div>{mockInvoice.clientPhone}</div>
              </div>
            </div>
            
            {/* Items Table */}
            <div className="mb-8">
              <table className="w-full" 
                style={{ 
                  borderCollapse: "collapse",
                  borderStyle: style.borderStyle,
                  borderWidth: style.tableStyle === 'bordered' ? style.borderWidth : 0,
                  borderColor: style.borderColor,
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: style.primaryColor, color: 'white' }}>
                    <th className="py-2 px-4 text-left">Description</th>
                    <th className="py-2 px-4 text-right">Quantity</th>
                    <th className="py-2 px-4 text-right">Rate</th>
                    <th className="py-2 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {mockInvoice.items.map((item, index) => (
                    <tr 
                      key={index}
                      style={{
                        backgroundColor: style.tableStyle === 'striped' && index % 2 === 1 
                          ? `${style.primaryColor}05`  // 5% opacity
                          : 'transparent',
                        borderBottomWidth: 1,
                        borderBottomStyle: style.borderStyle,
                        borderBottomColor: style.borderColor
                      }}
                    >
                      <td className="py-2 px-4">{item.description}</td>
                      <td className="py-2 px-4 text-right">{item.quantity}</td>
                      <td className="py-2 px-4 text-right">${item.rate.toFixed(2)}</td>
                      <td className="py-2 px-4 text-right">${item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Totals */}
            <div 
              className="flex justify-end mb-8"
            >
              <div className="w-64">
                <div className="flex justify-between py-1">
                  <span className="font-medium">Subtotal:</span>
                  <span>${mockInvoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="font-medium">Tax ({mockInvoice.taxPercentage}%):</span>
                  <span>${mockInvoice.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="font-medium">Discount ({mockInvoice.discountPercentage}%):</span>
                  <span>-${mockInvoice.discountAmount.toFixed(2)}</span>
                </div>
                <div 
                  className="flex justify-between py-2 text-lg font-bold mt-1"
                  style={{ 
                    borderTopWidth: style.borderWidth,
                    borderTopStyle: style.borderStyle,
                    borderTopColor: style.borderColor,
                    color: style.accentColor
                  }}
                >
                  <span>Total:</span>
                  <span>${mockInvoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            {/* Notes and Terms */}
            <div className="mb-4">
              <h3 
                className="text-md font-semibold mb-2"
                style={{ color: style.secondaryColor }}
              >
                Notes
              </h3>
              <p className="text-sm">{mockInvoice.notes}</p>
            </div>
            
            <div className="mb-4">
              <h3 
                className="text-md font-semibold mb-2"
                style={{ color: style.secondaryColor }}
              >
                Terms & Conditions
              </h3>
              <p className="text-sm">{mockInvoice.termsAndConditions}</p>
            </div>
            
            {/* Signature */}
            {style.showSignature && (
              <div 
                className="mt-12 flex flex-col items-start"
              >
                <div 
                  className="w-64 border-b-2 mb-1" 
                  style={{ borderColor: style.primaryColor }}
                ></div>
                <div className="text-sm">Authorized Signature</div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default TemplatePreviewPanel;
