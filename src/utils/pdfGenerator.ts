
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
    
    // Remove company name and logo as requested
    
    // Add INVOICE header (top left)
    pdf.setFontSize(28);
    pdf.setFont("helvetica", "bold");
    pdf.text("INVOICE", margin, margin + 10);
    
    // Add invoice date (under INVOICE)
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(format(new Date(invoice.date), "MMMM dd, yyyy"), margin, margin + 20);
    
    // Add bill to section
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text("To:", margin, margin + 40);
    pdf.setFont("helvetica", "normal");
    pdf.text(client.name, margin, margin + 48);
    // Using default address
    pdf.text("Main street, Your Loc.", margin, margin + 56);
    pdf.text(`${client.phone}`, margin, margin + 64);
    
    // Add office address section (right aligned)
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text("Office Address", pageWidth - margin, margin + 40, { align: "right" });
    pdf.setFont("helvetica", "normal");
    pdf.text("Main street, Number 06/B,", pageWidth - margin, margin + 48, { align: "right" });
    pdf.text("South Mountain, YK", pageWidth - margin, margin + 56, { align: "right" });
    pdf.text("(+62) 123 456 7890", pageWidth - margin, margin + 64, { align: "right" });
    
    // Add separator line
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.5);
    pdf.line(margin, margin + 80, pageWidth - margin, margin + 80);
    
    // Add table headers
    const tableTop = margin + 95;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    
    // Table headers
    pdf.text("ITEM DESCRIPTION", margin, tableTop);
    pdf.text("UNIT PRICE", pageWidth - margin - 105, tableTop);
    pdf.text("QNT", pageWidth - margin - 50, tableTop);
    pdf.text("TOTAL", pageWidth - margin, tableTop, { align: "right" });
    
    // Draw table rows
    pdf.setFont("helvetica", "normal");
    let currentY = tableTop + 20;
    
    invoice.items.forEach((item, index) => {
      // Check if we need a new page
      if (currentY > 230) {
        pdf.addPage();
        currentY = 30;
      }
      
      // Draw the item's description with bold title
      pdf.setFont("helvetica", "bold");
      pdf.text(item.description, margin, currentY);
      
      // Add placeholder description text if no description
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      const descriptionText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonummy nibh.";
      pdf.text(descriptionText, margin, currentY + 6);
      
      // Draw price, quantity and total
      pdf.setFontSize(10);
      pdf.text(`${item.rate.toFixed(2)} USD`, pageWidth - margin - 105, currentY);
      pdf.text(item.quantity.toString(), pageWidth - margin - 50, currentY);
      pdf.text(`${item.amount.toFixed(2)} USD`, pageWidth - margin, currentY, { align: "right" });
      
      // Add space between items
      currentY += 25;
    });
    
    // Add separator line
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.5);
    pdf.line(margin, currentY + 5, pageWidth - margin, currentY + 5);
    currentY += 20;
    
    // Add totals section with right alignment
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    
    pdf.text("SUBTOTAL", pageWidth - margin - 80, currentY);
    pdf.text(`${invoice.subtotal.toFixed(2)} USD`, pageWidth - margin, currentY, { align: "right" });
    currentY += 10;
    
    pdf.text(`Tax VAT ${invoice.taxPercentage}%`, pageWidth - margin - 80, currentY);
    pdf.text(`${invoice.taxAmount.toFixed(2)} USD`, pageWidth - margin, currentY, { align: "right" });
    currentY += 10;
    
    pdf.setFont("helvetica", "bold");
    pdf.text("TOTAL DUE", pageWidth - margin - 80, currentY);
    pdf.text(`${invoice.total.toFixed(2)} USD`, pageWidth - margin, currentY, { align: "right" });
    
    // Add footer with dark background
    const footerHeight = 40;
    const footerTop = 257 - footerHeight;
    
    pdf.setFillColor(50, 50, 50);
    pdf.rect(0, footerTop, pageWidth, footerHeight, 'F');
    
    // Add terms and payment info in the footer
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    
    // Terms on left
    pdf.text("Terms & Conditions.", margin, footerTop + 15);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    const termsText = invoice.termsAndConditions || 
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonummy nibh euismod tincidunt.";
    
    const splitTerms = pdf.splitTextToSize(termsText, contentWidth / 2 - 10);
    pdf.text(splitTerms, margin, footerTop + 22);
    
    // Payment method on right
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text("Payment Method", pageWidth - margin, footerTop + 15, { align: "right" });
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.text("Paypal", pageWidth - margin, footerTop + 22, { align: "right" });
    pdf.text("clientname@email.com", pageWidth - margin, footerTop + 28, { align: "right" });
    
    // Reset text color for future text
    pdf.setTextColor(0, 0, 0);
    
    // Save the PDF
    pdf.save(`Invoice_${invoice.invoiceNumber}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};
