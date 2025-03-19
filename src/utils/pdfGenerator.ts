
import html2pdf from 'html2pdf.js';
import { format } from 'date-fns';
import { Invoice } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const generateInvoicePDF = async (invoice: Invoice): Promise<void> => {
  try {
    // Fetch client info from database
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', invoice.clientId)
      .single();
    
    if (clientError || !client) {
      console.error('Error fetching client data:', clientError?.message || 'Client not found');
      throw new Error('Client information could not be retrieved');
    }

    // Format dates
    const formattedDate = format(new Date(invoice.date), "dd MMMM, yyyy");
    const formattedDueDate = format(new Date(invoice.dueDate), "dd MMMM, yyyy");
    
    // Generate HTML content for the invoice
    const invoiceHtml = `
      <div id="invoice-container" style="font-family: Helvetica, Arial, sans-serif; color: #333; max-width: 800px; margin: 0 auto; padding: 0;">
        <!-- Header Section -->
        <div style="background-color: #f0f8ff; padding: 30px; border-radius: 10px 10px 0 0;">
          <div style="display: flex; justify-content: space-between; align-items: start;">
            <div>
              <h1 style="font-size: 32px; margin: 0 0 40px 0; font-weight: bold;">Invoice</h1>
              <p style="color: #666; margin: 0 0 5px 0;">Billed to:</p>
              <h2 style="font-size: 18px; margin: 0 0 5px 0;">${client.name}</h2>
              <p style="color: #666; margin: 0;">${client.address || 'No address provided'} ${client.phone ? `/ ${client.phone}` : ''}</p>
            </div>
            <div style="text-align: right;">
              <p style="color: #666; margin: 0 0 5px 0;">Invoice no:</p>
              <h3 style="font-size: 18px; margin: 0 0 30px 0; font-weight: bold;">${invoice.invoiceNumber}</h3>
              
              <p style="color: #666; margin: 0 0 5px 0;">Issued on:</p>
              <p style="font-weight: 600; font-size: 16px; margin: 0 0 15px 0;">${formattedDate}</p>
              
              <p style="color: #666; margin: 0 0 5px 0;">Payment Due:</p>
              <p style="font-weight: 600; font-size: 16px; margin: 0;">${formattedDueDate}</p>
            </div>
          </div>
        </div>
        
        <!-- Items Table -->
        <div style="padding: 30px 30px 0 30px;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
            <thead>
              <tr style="border-bottom: 1px solid #eee; text-align: left;">
                <th style="padding: 10px 10px 10px 0; color: #666;">Services</th>
                <th style="padding: 10px; color: #666; text-align: center;">Qty</th>
                <th style="padding: 10px; color: #666; text-align: right;">Price</th>
                <th style="padding: 10px 0 10px 10px; color: #666; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map(item => `
                <tr style="border-bottom: 1px solid #f6f6f6;">
                  <td style="padding: 15px 10px 15px 0;">${item.description}</td>
                  <td style="padding: 15px 10px; color: #666; text-align: center;">${item.quantity}</td>
                  <td style="padding: 15px 10px; color: #666; text-align: right;">$${item.rate.toLocaleString()}</td>
                  <td style="padding: 15px 0 15px 10px; text-align: right;">$${item.amount.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <!-- Totals Section -->
          <div style="display: flex; justify-content: flex-end; margin-bottom: 60px;">
            <div style="width: 250px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                <span style="color: #333; font-weight: 500;">Subtotal</span>
                <span style="font-weight: 500;">$${invoice.subtotal.toLocaleString()}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                <span style="color: #333; font-weight: 500;">Discount</span>
                <span style="font-weight: 500;">${invoice.discountAmount > 0 ? `$${invoice.discountAmount.toLocaleString()}` : '0'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                <span style="color: #333; font-weight: 500;">TAX:</span>
                <span style="font-weight: 500;">${invoice.taxAmount > 0 ? `$${invoice.taxAmount.toLocaleString()}` : '0'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 10px; background-color: #f0f8ff; border-radius: 5px; margin-top: 10px;">
                <span style="font-weight: bold; font-size: 18px;">Total</span>
                <span style="font-weight: bold; font-size: 18px;">$${invoice.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Footer Section -->
        <div style="padding: 0 30px 30px 30px; display: flex; justify-content: space-between;">
          <div style="width: 20%;">
            <div style="width: 60px; height: 60px; background-color: #f0f8ff; margin-bottom: 15px;"></div>
            <h3 style="font-size: 18px; margin: 0 0 5px 0;">Pin Box</h3>
            <p style="color: #666; margin: 0 0 3px 0; font-size: 14px;">www.pinbox.io</p>
            <p style="color: #666; margin: 0; font-size: 14px;">support@pinbox.io</p>
          </div>
          
          <div style="width: 25%;">
            <h4 style="font-size: 16px; margin: 0 0 10px 0;">Notes</h4>
            <p style="color: #666; margin: 0; font-size: 14px;">${invoice.notes || 'No additional notes'}</p>
          </div>
          
          <div style="width: 25%;">
            <h4 style="font-size: 16px; margin: 0 0 10px 0;">Terms & Conditions</h4>
            <p style="color: #666; margin: 0; font-size: 14px;">${invoice.termsAndConditions || 'Payment due within 14 days of receipt.'}</p>
          </div>
        </div>
      </div>
    `;
    
    // Create a temporary div element
    const element = document.createElement('div');
    element.innerHTML = invoiceHtml;
    
    // Get the invoice container from the temporary element
    const invoiceElement = element.firstElementChild;
    
    // Append to document body (required for proper rendering)
    if (invoiceElement) {
      document.body.appendChild(invoiceElement);
    } else {
      throw new Error('Failed to create invoice element');
    }
    
    try {
      // Options for html2pdf
      const options = {
        margin: 0,
        filename: `Invoice_${invoice.invoiceNumber}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { 
          scale: 2,
          logging: false,
          dpi: 192,
          letterRendering: true,
          useCORS: true
        },
        jsPDF: { 
          unit: 'pt', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true 
        }
      };
      
      // Generate PDF using the actual DOM element
      await html2pdf()
        .from(invoiceElement)
        .set(options)
        .save();
    } finally {
      // Clean up - always remove the element from DOM
      if (invoiceElement && invoiceElement.parentNode) {
        invoiceElement.parentNode.removeChild(invoiceElement);
      }
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};
