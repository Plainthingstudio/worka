
import jsPDF from 'jspdf';
import { Invoice } from '@/types';
import { clients } from '@/mockData';
import { format } from 'date-fns';

export const generateInvoicePDF = async (invoice: Invoice): Promise<void> => {
  try {
    // Find client info
    const client = clients.find(c => c.id === invoice.clientId);
    if (!client) {
      throw new Error('Client not found');
    }
    
    // Initialize PDF document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Document constants
    const pageWidth = 210;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    // Set font
    pdf.setFont("helvetica");
    
    // Add company name (top left) - removed the logo
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Pin Box", margin, margin + 10);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text("Private Limited", margin, margin + 16);
    
    // Add INVOICE header (top right)
    pdf.setFontSize(36);
    pdf.setFont("helvetica", "bold");
    pdf.text("Invoice", pageWidth - margin, margin + 5, { align: "right" });
    
    // Add invoice details (top right, below INVOICE)
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text("Invoice#", pageWidth - margin, margin + 20, { align: "right" });
    pdf.text("Date:", pageWidth - margin, margin + 27, { align: "right" });
    
    pdf.setFont("helvetica", "normal");
    pdf.text(invoice.invoiceNumber, pageWidth - margin - 30, margin + 20);
    pdf.text(format(new Date(invoice.date), "dd/MMMM/yyyy"), pageWidth - margin - 30, margin + 27);
    
    // Add "Total Due:" section
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Total Due:", pageWidth - margin, margin + 40, { align: "right" });
    pdf.text(`USD: $ ${invoice.total.toFixed(2)}`, pageWidth - margin, margin + 47, { align: "right" });
    
    // Add billed to section (left)
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text("Bill To:", margin, margin + 40);
    pdf.setFont("helvetica", "normal");
    pdf.text(client.name, margin, margin + 47);
    // Since 'address' doesn't exist on the Client type, use a default address
    pdf.text("123 Street, Town/City, Country", margin, margin + 54);
    pdf.text(client.phone, margin, margin + 61);
    
    // Add table headers
    const tableTop = margin + 80;
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    
    // Table headers
    pdf.text("ITEM DESCRIPTION", margin, tableTop);
    pdf.text("PRICE", pageWidth - margin - 80, tableTop);
    pdf.text("QTY", pageWidth - margin - 45, tableTop);
    pdf.text("TOTAL", pageWidth - margin, tableTop, { align: "right" });
    
    // Table header underline
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.5);
    pdf.line(margin, tableTop + 2, pageWidth - margin, tableTop + 2);
    
    // Draw table rows
    pdf.setFont("helvetica", "normal");
    let currentY = tableTop + 10;
    
    invoice.items.forEach((item, index) => {
      // Check if we need a new page
      if (currentY > 250) {
        pdf.addPage();
        currentY = 30;
      }
      
      // Draw the item's details
      pdf.text(item.description, margin, currentY);
      pdf.text(`$${item.rate.toFixed(2)}`, pageWidth - margin - 80, currentY);
      pdf.text(item.quantity.toString(), pageWidth - margin - 45, currentY);
      pdf.text(`$${item.amount.toFixed(2)}`, pageWidth - margin, currentY, { align: "right" });
      
      // Draw thin line between items
      if (index < invoice.items.length - 1) {
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.1);
        pdf.line(margin, currentY + 4, pageWidth - margin, currentY + 4);
      }
      
      currentY += 12; // Increment Y position for next item
    });
    
    // Draw line before totals
    currentY += 5;
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.5);
    pdf.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 10;
    
    // Add totals section
    const totalsX = pageWidth - margin - 70;
    const valuesX = pageWidth - margin;
    
    pdf.text("SUB TOTAL", totalsX, currentY);
    pdf.text(`$${invoice.subtotal.toFixed(2)}`, valuesX, currentY, { align: "right" });
    currentY += 8;
    
    pdf.text(`Tax Vat ${invoice.taxPercentage}%`, totalsX, currentY);
    pdf.text(`$${invoice.taxAmount.toFixed(2)}`, valuesX, currentY, { align: "right" });
    currentY += 8;
    
    pdf.text(`Discount ${invoice.discountPercentage}%`, totalsX, currentY);
    pdf.text(`- $${invoice.discountAmount.toFixed(2)}`, valuesX, currentY, { align: "right" });
    currentY += 8;
    
    // Draw line before grand total
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.5);
    pdf.line(totalsX - 20, currentY, valuesX, currentY);
    currentY += 10;
    
    // Grand total
    pdf.setFont("helvetica", "bold");
    pdf.text("Grand Total", totalsX, currentY);
    pdf.text(`$${invoice.total.toFixed(2)}`, valuesX, currentY, { align: "right" });
    
    // Add terms and conditions (Skip payment method and contact sections)
    const termsY = currentY + 40;
    pdf.setFont("helvetica", "bold");
    pdf.text("Terms & Condition", margin, termsY);
    pdf.setFont("helvetica", "normal");
    
    const termsText = invoice.termsAndConditions || 
      "Payment is due within the specified term. Please make the payment to the specified account.";
    
    // Split terms into lines
    const splitTerms = pdf.splitTextToSize(termsText, contentWidth);
    pdf.text(splitTerms, margin, termsY + 7);
    
    // Add notes if available
    if (invoice.notes && invoice.notes.trim().length > 0) {
      const notesY = termsY + 30;
      pdf.setFont("helvetica", "bold");
      pdf.text("Notes", margin, notesY);
      pdf.setFont("helvetica", "normal");
      
      const notesText = invoice.notes;
      const splitNotes = pdf.splitTextToSize(notesText, contentWidth);
      pdf.text(splitNotes, margin, notesY + 7);
    }
    
    // Add very light shadow effect to the whole document
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.1);
    pdf.rect(5, 5, pageWidth - 10, 287, 'S');
    
    // Save the PDF
    pdf.save(`Invoice_${invoice.invoiceNumber}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};
