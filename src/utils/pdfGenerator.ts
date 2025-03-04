
import jsPDF from 'jspdf';
import { Invoice } from '@/types';
import { clients } from '@/mockData';
import { format } from 'date-fns';

export const generateInvoicePDF = async (invoice: Invoice): Promise<void> => {
  try {
    // Find client info
    const client = clients.find(c => c.id === invoice.clientId);
    
    // Initialize PDF document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Set default font
    pdf.setFont("helvetica");
    
    // Add invoice header
    pdf.setFontSize(24);
    pdf.text("INVOICE", 20, 20);
    
    // Add invoice details
    pdf.setFontSize(10);
    pdf.text(`Invoice Number: ${invoice.invoiceNumber}`, 20, 30);
    pdf.text(`Date: ${format(new Date(invoice.date), "MMMM dd, yyyy")}`, 20, 35);
    pdf.text(`Due Date: ${format(new Date(invoice.dueDate), "MMMM dd, yyyy")}`, 20, 40);
    
    // Add client information
    pdf.setFontSize(12);
    pdf.text("Billed To:", 140, 30);
    pdf.setFontSize(10);
    if (client) {
      pdf.text(client.name, 140, 35);
      pdf.text(client.email, 140, 40);
      pdf.text(client.phone, 140, 45);
    }
    
    // Draw table headers
    const tableTop = 55;
    const colWidths = [85, 25, 30, 30];
    const colStarts = [20, 105, 130, 160];
    
    pdf.setFillColor(242, 242, 242);
    pdf.rect(20, tableTop, 170, 8, "F");
    
    pdf.setFont("helvetica", "bold");
    pdf.text("Description", colStarts[0], tableTop + 6);
    pdf.text("Quantity", colStarts[1], tableTop + 6);
    pdf.text("Rate", colStarts[2], tableTop + 6);
    pdf.text("Amount", colStarts[3], tableTop + 6);
    pdf.setFont("helvetica", "normal");
    
    // Draw line below header
    pdf.setDrawColor(221, 221, 221);
    pdf.line(20, tableTop + 8, 190, tableTop + 8);
    
    // Add invoice items
    let currentY = tableTop + 16;
    invoice.items.forEach((item, index) => {
      pdf.text(item.description, colStarts[0], currentY);
      pdf.text(item.quantity.toString(), colStarts[1], currentY);
      pdf.text(`$${item.rate.toFixed(2)}`, colStarts[2], currentY);
      pdf.text(`$${item.amount.toFixed(2)}`, colStarts[3], currentY);
      
      currentY += 8;
      
      // Draw line below item
      pdf.line(20, currentY - 4, 190, currentY - 4);
      
      // Add new page if needed
      if (currentY > 270 && index < invoice.items.length - 1) {
        pdf.addPage();
        currentY = 20;
        
        // Redraw header on new page
        pdf.setFontSize(12);
        pdf.text("Invoice (continued)", 20, currentY);
        currentY += 10;
        
        // Redraw table headers
        pdf.setFillColor(242, 242, 242);
        pdf.rect(20, currentY, 170, 8, "F");
        
        pdf.setFont("helvetica", "bold");
        pdf.text("Description", colStarts[0], currentY + 6);
        pdf.text("Quantity", colStarts[1], currentY + 6);
        pdf.text("Rate", colStarts[2], currentY + 6);
        pdf.text("Amount", colStarts[3], currentY + 6);
        pdf.setFont("helvetica", "normal");
        
        // Draw line below header
        pdf.line(20, currentY + 8, 190, currentY + 8);
        
        currentY += 16;
      }
    });
    
    // Add summary section
    currentY += 10;
    
    // If near bottom of page, add new page
    if (currentY > 240) {
      pdf.addPage();
      currentY = 30;
    }
    
    const summaryX = 140;
    
    pdf.text("Subtotal:", summaryX, currentY);
    pdf.text(`$${invoice.subtotal.toFixed(2)}`, 190, currentY, { align: "right" });
    currentY += 8;
    
    pdf.text(`Tax (${invoice.taxPercentage}%):`, summaryX, currentY);
    pdf.text(`$${invoice.taxAmount.toFixed(2)}`, 190, currentY, { align: "right" });
    currentY += 8;
    
    pdf.text(`Discount (${invoice.discountPercentage}%):`, summaryX, currentY);
    pdf.text(`$${invoice.discountAmount.toFixed(2)}`, 190, currentY, { align: "right" });
    currentY += 8;
    
    // Add total
    pdf.setDrawColor(0, 0, 0);
    pdf.line(summaryX, currentY, 190, currentY);
    currentY += 6;
    
    pdf.setFont("helvetica", "bold");
    pdf.text("Total:", summaryX, currentY);
    pdf.text(`$${invoice.total.toFixed(2)}`, 190, currentY, { align: "right" });
    pdf.setFont("helvetica", "normal");
    
    // Add notes if present
    if (invoice.notes) {
      currentY += 20;
      
      // If near bottom of page, add new page
      if (currentY > 250) {
        pdf.addPage();
        currentY = 30;
      }
      
      pdf.setFont("helvetica", "bold");
      pdf.text("Notes", 20, currentY);
      pdf.setFont("helvetica", "normal");
      currentY += 8;
      
      // Split notes into lines
      const splitNotes = pdf.splitTextToSize(invoice.notes, 170);
      pdf.text(splitNotes, 20, currentY);
      currentY += splitNotes.length * 6;
    }
    
    // Add terms and conditions
    currentY += 15;
    
    // If near bottom of page, add new page
    if (currentY > 250) {
      pdf.addPage();
      currentY = 30;
    }
    
    pdf.setFont("helvetica", "bold");
    pdf.text("Terms and Conditions", 20, currentY);
    pdf.setFont("helvetica", "normal");
    currentY += 8;
    
    // Split terms into lines
    const splitTerms = pdf.splitTextToSize(invoice.termsAndConditions, 170);
    pdf.text(splitTerms, 20, currentY);
    
    // Save the PDF
    pdf.save(`Invoice_${invoice.invoiceNumber}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};
