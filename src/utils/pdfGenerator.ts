
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
    
    // Define colors
    const primaryColor = [41, 66, 112];  // Dark blue
    const secondaryColor = [72, 133, 237]; // Light blue
    const lightGray = [240, 240, 240];
    const darkGray = [100, 100, 100];
    
    // Set default font
    pdf.setFont("helvetica");
    
    // Add header with background color
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.rect(0, 0, 210, 40, 'F');
    
    // Add company logo area
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(14, 10, 60, 20, 3, 3, 'F');
    
    // Add invoice title
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont("helvetica", "bold");
    pdf.text("INVOICE", 155, 25);
    
    // Add invoice details section
    pdf.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    pdf.rect(120, 40, 90, 35, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.text("Invoice Number:", 125, 50);
    pdf.text("Date:", 125, 58);
    pdf.text("Due Date:", 125, 66);
    
    pdf.setFont("helvetica", "normal");
    pdf.text(`${invoice.invoiceNumber}`, 170, 50);
    pdf.text(`${format(new Date(invoice.date), "MMMM dd, yyyy")}`, 170, 58);
    pdf.text(`${format(new Date(invoice.dueDate), "MMMM dd, yyyy")}`, 170, 66);
    
    // Reset text color for rest of document
    pdf.setTextColor(0, 0, 0);
    
    // Add client information
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Billed To:", 20, 60);
    
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    if (client) {
      pdf.text(client.name, 20, 68);
      pdf.text(client.email, 20, 74);
      pdf.text(client.phone, 20, 80);
    }
    
    // Add table headers
    const tableTop = 100;
    const colWidths = [85, 25, 30, 30];
    const colStarts = [20, 105, 135, 165];
    
    // Draw table header background
    pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    pdf.rect(15, tableTop - 6, 180, 10, 'F');
    
    // Draw table border
    pdf.setDrawColor(darkGray[0], darkGray[1], darkGray[2]);
    pdf.setLineWidth(0.1);
    pdf.rect(15, tableTop - 6, 180, 10);
    
    // Table headers text
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.text("Description", colStarts[0], tableTop);
    pdf.text("Quantity", colStarts[1], tableTop);
    pdf.text("Rate", colStarts[2], tableTop);
    pdf.text("Amount", colStarts[3], tableTop);
    
    // Reset text color
    pdf.setTextColor(0, 0, 0);
    pdf.setFont("helvetica", "normal");
    
    // Draw items
    let currentY = tableTop + 10;
    let pageItemCount = 0;
    const itemsPerPage = 20; // Adjust based on your layout
    
    invoice.items.forEach((item, index) => {
      // Check if we need a new page
      if (pageItemCount >= itemsPerPage) {
        pdf.addPage();
        currentY = 30;
        pageItemCount = 0;
        
        // Add continued header on new page
        pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
        pdf.rect(15, currentY - 6, 180, 10, 'F');
        
        pdf.setDrawColor(darkGray[0], darkGray[1], darkGray[2]);
        pdf.rect(15, currentY - 6, 180, 10);
        
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        pdf.text("Description", colStarts[0], currentY);
        pdf.text("Quantity", colStarts[1], currentY);
        pdf.text("Rate", colStarts[2], currentY);
        pdf.text("Amount", colStarts[3], currentY);
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFont("helvetica", "normal");
        
        currentY += 10;
      }
      
      // Draw item row with alternating background
      if (index % 2 === 1) {
        pdf.setFillColor(250, 250, 250);
        pdf.rect(15, currentY - 5, 180, 8, 'F');
      }
      
      pdf.text(item.description, colStarts[0], currentY);
      pdf.text(item.quantity.toString(), colStarts[1], currentY);
      pdf.text(`$${item.rate.toFixed(2)}`, colStarts[2], currentY);
      pdf.text(`$${item.amount.toFixed(2)}`, colStarts[3], currentY);
      
      // Draw bottom border for the row
      pdf.setDrawColor(230, 230, 230);
      pdf.line(15, currentY + 3, 195, currentY + 3);
      
      currentY += 10;
      pageItemCount++;
    });
    
    // Add summary section with elegant styling
    currentY += 5;
    
    // If near bottom of page, add new page
    if (currentY > 240) {
      pdf.addPage();
      currentY = 30;
    }
    
    const summaryX = 125;
    const summaryWidth = 70;
    
    // Draw summary box with slight shadow effect
    pdf.setDrawColor(220, 220, 220);
    pdf.setFillColor(250, 250, 250);
    pdf.roundedRect(summaryX - 5, currentY - 5, summaryWidth, 45, 2, 2, 'FD');
    
    // Add summary items
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text("Subtotal:", summaryX, currentY);
    pdf.text(`$${invoice.subtotal.toFixed(2)}`, 190, currentY, { align: "right" });
    currentY += 8;
    
    pdf.text(`Tax (${invoice.taxPercentage}%):`, summaryX, currentY);
    pdf.text(`$${invoice.taxAmount.toFixed(2)}`, 190, currentY, { align: "right" });
    currentY += 8;
    
    pdf.text(`Discount (${invoice.discountPercentage}%):`, summaryX, currentY);
    pdf.text(`$${invoice.discountAmount.toFixed(2)}`, 190, currentY, { align: "right" });
    currentY += 8;
    
    // Add total with highlight
    pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.setLineWidth(0.5);
    pdf.line(summaryX - 2, currentY, 192, currentY);
    currentY += 6;
    
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.text("Total:", summaryX, currentY);
    pdf.text(`$${invoice.total.toFixed(2)}`, 190, currentY, { align: "right" });
    
    // Reset styling
    pdf.setTextColor(0, 0, 0);
    pdf.setFont("helvetica", "normal");
    pdf.setLineWidth(0.1);
    
    // Add a decorative footer
    const footerY = 280;
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.rect(0, footerY, 210, 15, 'F');
    
    // Add notes if present
    if (invoice.notes) {
      currentY += 25;
      
      // If near bottom of page, add new page
      if (currentY > 230) {
        pdf.addPage();
        currentY = 30;
      }
      
      // Add styled notes section
      pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      pdf.roundedRect(15, currentY - 6, 180, 10, 2, 2, 'F');
      
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.text("Notes", 20, currentY);
      
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(0, 0, 0);
      currentY += 10;
      
      // Add notes content in a nice box
      pdf.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
      pdf.roundedRect(15, currentY - 5, 180, 30, 2, 2, 'S');
      
      // Split notes into lines
      const splitNotes = pdf.splitTextToSize(invoice.notes, 170);
      pdf.text(splitNotes, 20, currentY);
      currentY += Math.max(30, splitNotes.length * 6); // Ensure minimum height
    }
    
    // Add terms and conditions with styled header
    currentY += 10;
    
    // If near bottom of page, add new page
    if (currentY > 230) {
      pdf.addPage();
      currentY = 30;
    }
    
    // Add styled terms section
    pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    pdf.roundedRect(15, currentY - 6, 180, 10, 2, 2, 'F');
    
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.text("Terms and Conditions", 20, currentY);
    
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);
    currentY += 10;
    
    // Add terms content in a nice box
    pdf.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
    pdf.roundedRect(15, currentY - 5, 180, 30, 2, 2, 'S');
    
    // Split terms into lines
    const splitTerms = pdf.splitTextToSize(invoice.termsAndConditions || "Payment is due within the specified term.", 170);
    pdf.text(splitTerms, 20, currentY);
    
    // Add "Thank you for your business" message
    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    pdf.text("Thank you for your business!", 105, footerY - 10, { align: "center" });
    
    // Add white text in the footer
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(255, 255, 255);
    pdf.text(`Invoice #${invoice.invoiceNumber} | Generated on ${format(new Date(), "MMMM dd, yyyy")}`, 105, footerY + 6, { align: "center" });
    
    // Save the PDF
    pdf.save(`Invoice_${invoice.invoiceNumber}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};
