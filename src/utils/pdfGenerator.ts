
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Invoice } from '@/types';
import { clients } from '@/mockData';
import { format } from 'date-fns';

export const generateInvoicePDF = async (invoice: Invoice): Promise<void> => {
  try {
    // Create a temporary container for the invoice content
    const tempContainer = document.createElement('div');
    tempContainer.className = 'pdf-container bg-white p-8';
    tempContainer.style.width = '800px';
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    document.body.appendChild(tempContainer);

    // Get client info
    const client = clients.find(c => c.id === invoice.clientId);
    
    // Build invoice HTML
    tempContainer.innerHTML = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
          <div>
            <h1 style="font-size: 24px; color: #1a1a1a; margin-bottom: 10px;">INVOICE</h1>
            <p style="margin: 5px 0;"><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${format(new Date(invoice.date), "MMMM dd, yyyy")}</p>
            <p style="margin: 5px 0;"><strong>Due Date:</strong> ${format(new Date(invoice.dueDate), "MMMM dd, yyyy")}</p>
          </div>
          <div style="text-align: right;">
            <h2 style="font-size: 18px; margin-bottom: 5px;">Billed To:</h2>
            <p style="margin: 5px 0;"><strong>${client?.name || 'Client'}</strong></p>
            <p style="margin: 5px 0;">${client?.email || ''}</p>
            <p style="margin: 5px 0;">${client?.phone || ''}</p>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Description</th>
              <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Quantity</th>
              <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Rate</th>
              <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map(item => `
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.description}</td>
                <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">${item.quantity}</td>
                <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">$${item.rate.toFixed(2)}</td>
                <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">$${item.amount.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="display: flex; justify-content: flex-end;">
          <div style="width: 300px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <p style="margin: 5px 0;"><strong>Subtotal:</strong></p>
              <p style="margin: 5px 0;">$${invoice.subtotal.toFixed(2)}</p>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <p style="margin: 5px 0;"><strong>Tax (${invoice.taxPercentage}%):</strong></p>
              <p style="margin: 5px 0;">$${invoice.taxAmount.toFixed(2)}</p>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <p style="margin: 5px 0;"><strong>Discount (${invoice.discountPercentage}%):</strong></p>
              <p style="margin: 5px 0;">$${invoice.discountAmount.toFixed(2)}</p>
            </div>
            
            <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 2px solid #ddd;">
              <p style="margin: 5px 0; font-weight: bold;">Total:</p>
              <p style="margin: 5px 0; font-weight: bold;">$${invoice.total.toFixed(2)}</p>
            </div>
          </div>
        </div>

        ${invoice.notes ? `
          <div style="margin-top: 30px;">
            <h3 style="font-size: 16px; margin-bottom: 10px;">Notes</h3>
            <p style="margin: 5px 0;">${invoice.notes}</p>
          </div>
        ` : ''}

        <div style="margin-top: 30px;">
          <h3 style="font-size: 16px; margin-bottom: 10px;">Terms and Conditions</h3>
          <p style="margin: 5px 0;">${invoice.termsAndConditions}</p>
        </div>
      </div>
    `;

    // Create the PDF
    const canvas = await html2canvas(tempContainer, {
      scale: 1,
      useCORS: true,
      logging: false
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = canvas.height * imgWidth / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add new pages if content is longer than one page
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Download the PDF
    pdf.save(`Invoice_${invoice.invoiceNumber}.pdf`);

    // Clean up the temporary container
    document.body.removeChild(tempContainer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};
