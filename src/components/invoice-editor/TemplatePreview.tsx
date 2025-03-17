import React from 'react';
import { format } from 'date-fns';
import { InvoiceTemplate } from '@/types/template';
import DraggableElement from './DraggableElement';

interface TemplatePreviewProps {
  template: InvoiceTemplate;
  isEditing?: boolean;
  isActive?: boolean;
  onClick?: () => void;
  onElementPositionChange?: (elementType: string, position: { x: number; y: number }) => void;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ 
  template, 
  isEditing = false,
  isActive = false,
  onClick,
  onElementPositionChange 
}) => {
  const style = template.style;
  const elements = style.elements || {
    header: { x: 40, y: 40 },
    clientInfo: { x: 40, y: 120 },
    dates: { x: 400, y: 120 },
    items: { x: 40, y: 220 },
    totals: { x: 400, y: 400 },
    notes: { x: 40, y: 450 },
    signature: { x: 400, y: 500 }
  };

  const sampleData = {
    invoiceNumber: "INV-001",
    date: new Date(),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 14)),
    clientName: "Sample Client",
    clientAddress: "123 Business Ave, Suite 101\nNew York, NY 10001",
    items: [
      { description: "Web Design Services", quantity: 1, rate: 1500, amount: 1500 },
      { description: "Logo Design", quantity: 1, rate: 500, amount: 500 },
      { description: "SEO Consultation", quantity: 2, rate: 250, amount: 500 }
    ],
    subtotal: 2500,
    taxPercentage: 10,
    taxAmount: 250,
    total: 2750,
    notes: "Thank you for your business!",
    termsAndConditions: "Payment due within 14 days of receipt."
  };

  const handlePositionChange = (id: string, position: { x: number; y: number }) => {
    if (onElementPositionChange) {
      onElementPositionChange(id, position);
    }
  };

  return (
    <div 
      className={`relative w-full h-full bg-white overflow-hidden rounded-md shadow-sm border ${
        isActive ? 'ring-2 ring-primary' : ''
      } ${onClick ? 'cursor-pointer' : ''}`}
      style={{ 
        minHeight: '800px',
        fontFamily: style.fontFamily,
        color: style.primaryColor
      }}
      onClick={onClick}
    >
      {/* Header with Logo */}
      <DraggableElement
        id="header"
        type="header"
        defaultPosition={elements.header}
        onPositionChange={handlePositionChange}
        locked={!isEditing}
        className="w-[calc(100%-80px)] pt-4"
      >
        <div className="flex items-center justify-between">
          {style.showLogo && (
            <div 
              className={`h-16 w-32 bg-muted/20 rounded flex items-center justify-center text-sm text-muted-foreground`}
              style={{ textAlign: style.logoPosition }}
            >
              LOGO
            </div>
          )}
          <div 
            className="text-2xl font-bold"
            style={{ color: style.secondaryColor }}
          >
            INVOICE
          </div>
        </div>
      </DraggableElement>

      {/* Client Information */}
      <DraggableElement
        id="clientInfo"
        type="client"
        defaultPosition={elements.clientInfo}
        onPositionChange={handlePositionChange}
        locked={!isEditing}
        className="w-[300px]"
      >
        <div className="space-y-1">
          <h3 className="font-semibold" style={{ color: style.secondaryColor }}>Bill To:</h3>
          <div className="text-base font-medium">{sampleData.clientName}</div>
          <div className="text-sm whitespace-pre-line">{sampleData.clientAddress}</div>
        </div>
      </DraggableElement>

      {/* Invoice Details/Dates */}
      <DraggableElement
        id="dates"
        type="dates"
        defaultPosition={elements.dates}
        onPositionChange={handlePositionChange}
        locked={!isEditing}
        className="w-[250px]"
      >
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">Invoice No:</span>
            <span>{sampleData.invoiceNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Date:</span>
            <span>{format(sampleData.date, 'MM/dd/yyyy')}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Due Date:</span>
            <span>{format(sampleData.dueDate, 'MM/dd/yyyy')}</span>
          </div>
        </div>
      </DraggableElement>

      {/* Invoice Items */}
      <DraggableElement
        id="items"
        type="items"
        defaultPosition={elements.items}
        onPositionChange={handlePositionChange}
        locked={!isEditing}
        className="w-[calc(100%-80px)]"
      >
        <div>
          <table className="w-full" 
            style={{ 
              borderCollapse: 'collapse',
              borderColor: style.borderColor
            }}
          >
            <thead>
              <tr style={{ backgroundColor: style.secondaryColor, color: 'white' }}>
                <th className="text-left p-2 border" style={{ borderColor: style.borderColor }}>Description</th>
                <th className="text-center p-2 border" style={{ borderColor: style.borderColor }}>Qty</th>
                <th className="text-right p-2 border" style={{ borderColor: style.borderColor }}>Rate</th>
                <th className="text-right p-2 border" style={{ borderColor: style.borderColor }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {sampleData.items.map((item, index) => (
                <tr key={index} className={index % 2 !== 0 && style.tableStyle === 'striped' ? 'bg-muted/10' : ''}>
                  <td className={`p-2 ${style.tableStyle === 'bordered' ? 'border' : 'border-b'}`} style={{ borderColor: style.borderColor }}>{item.description}</td>
                  <td className={`p-2 text-center ${style.tableStyle === 'bordered' ? 'border' : 'border-b'}`} style={{ borderColor: style.borderColor }}>{item.quantity}</td>
                  <td className={`p-2 text-right ${style.tableStyle === 'bordered' ? 'border' : 'border-b'}`} style={{ borderColor: style.borderColor }}>${item.rate.toFixed(2)}</td>
                  <td className={`p-2 text-right ${style.tableStyle === 'bordered' ? 'border' : 'border-b'}`} style={{ borderColor: style.borderColor }}>${item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DraggableElement>

      {/* Totals */}
      <DraggableElement
        id="totals"
        type="totals"
        defaultPosition={elements.totals}
        onPositionChange={handlePositionChange}
        locked={!isEditing}
        className="w-[250px]"
      >
        <div className="space-y-2 border rounded p-3" style={{ borderColor: style.borderColor }}>
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${sampleData.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax ({sampleData.taxPercentage}%):</span>
            <span>${sampleData.taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold" style={{ color: style.accentColor }}>
            <span>Total:</span>
            <span>${sampleData.total.toFixed(2)}</span>
          </div>
        </div>
      </DraggableElement>

      {/* Notes */}
      <DraggableElement
        id="notes"
        type="notes"
        defaultPosition={elements.notes}
        onPositionChange={handlePositionChange}
        locked={!isEditing}
        className="w-[calc(100%-80px)]"
      >
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold" style={{ color: style.secondaryColor }}>Notes:</h3>
            <p className="text-sm">{sampleData.notes}</p>
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: style.secondaryColor }}>Terms & Conditions:</h3>
            <p className="text-sm">{sampleData.termsAndConditions}</p>
          </div>
        </div>
      </DraggableElement>

      {/* Signature */}
      {style.showSignature && (
        <DraggableElement
          id="signature"
          type="signature"
          defaultPosition={elements.signature}
          onPositionChange={handlePositionChange}
          locked={!isEditing}
          className="w-[200px]"
        >
          <div className="mt-6">
            <div className="border-t-2 pt-2" style={{ borderColor: style.accentColor }}>
              <p className="text-sm text-center">Authorized Signature</p>
            </div>
          </div>
        </DraggableElement>
      )}
    </div>
  );
};

export default TemplatePreview;
