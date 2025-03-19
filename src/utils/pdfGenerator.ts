
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
    const formattedDate = format(new Date(invoice.date), "MMMM dd, yyyy");
    const formattedDueDate = format(new Date(invoice.dueDate), "MMMM dd, yyyy");
    
    // Format client address with truncation if necessary
    const clientAddress = client.address || 'No address provided';
    
    // Generate HTML content for the invoice with new design
    const invoiceHtml = `
      <div id="invoice-container" style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333; width: 100%; margin: 0 auto; padding: 0; background: white; overflow: hidden;">
        <!-- Header Section with specific design -->
        <div style="position: relative; width: 100%;">
          <!-- Blue background header -->
          <div style="width: 100%; height: 135px; background-color: #E3EFFF; position: relative;"></div>
          
          <!-- Logo placeholder - white rounded square with shadow -->
          <div style="width: 112px; height: 112px; position: absolute; left: 40px; top: 52px; background-color: white; border-radius: 24px; box-shadow: 0px 2px 19px rgba(47.78, 94.96, 150.87, 0.07); border: 0.60px #EBEFF6 solid;"></div>
          
          <!-- Invoice number in a pill/capsule style - updated styling -->
          <div style="position: absolute; right: 30px; top: 52px; padding-left: 8px; padding-right: 8px; padding-top: 5px; padding-bottom: 5px; background: white; box-shadow: 0px 1px 2px rgba(54, 61, 85, 0.08); overflow: hidden; border-radius: 25px; justify-content: center; align-items: center; gap: 10px; display: inline-flex;">
            <div style="text-align: right; color: #19213D; font-size: 10px; font-weight: 500; text-transform: uppercase; line-height: 12px; letter-spacing: 0.40px; word-wrap: break-word;">${invoice.invoiceNumber}</div>
          </div>
        </div>
        
        <!-- From and To Sections - Updated with space-between distribution -->
        <div style="padding: 30px 30px 15px 30px; display: flex; justify-content: space-between; margin-top: 35px;">
          <!-- From section -->
          <div style="width: 30%;">
            <p style="font-size: 12px; color: #6B7280; margin: 0 0 6px 0;">From</p>
            <h2 style="font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">Plainthing Studio</h2>
            <p style="font-size: 13px; color: #4B5563; margin: 0 0 3px 0;">(612) 856 - 0989</p>
            <p style="font-size: 13px; color: #4B5563; margin: 0 0 3px 0;">contact@maurosicard.com</p>
            <p style="font-size: 13px; color: #4B5563; margin: 0 0 3px 0; line-height: 1.4;">
              Pablo Alto, San Francisco, CA 92102,<br>
              United States of America
            </p>
          </div>
          
          <!-- To section -->
          <div style="width: 30%;">
            <p style="font-size: 12px; color: #6B7280; margin: 0 0 6px 0;">Invoice to:</p>
            <h2 style="font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">${client.name}</h2>
            <p style="font-size: 13px; color: #4B5563; margin: 0 0 3px 0;">${client.phone || '(612) 856 - 0989'}</p>
            <p style="font-size: 13px; color: #4B5563; margin: 0 0 3px 0;">${client.email}</p>
            <p style="font-size: 13px; color: #4B5563; margin: 0 0 3px 0; line-height: 1.4;">
              ${clientAddress.replace(/,/g, ',<br>')}
            </p>
          </div>
          
          <!-- Date section -->
          <div style="width: 30%;">
            <p style="font-size: 12px; color: #6B7280; margin: 0 0 6px 0;">Date:</p>
            <p style="font-size: 13px; color: #4B5563; margin: 0 0 3px 0;">Issued</p>
            <h2 style="font-size: 16px; font-weight: 600; margin: 0 0 18px 0;">${formattedDate}</h2>
            
            <p style="font-size: 13px; color: #4B5563; margin: 0 0 3px 0;">Payment Due</p>
            <h2 style="font-size: 16px; font-weight: 600; margin: 0;">${formattedDueDate}</h2>
          </div>
        </div>
        
        <!-- Items Table -->
        <div style="padding: 15px 30px;">
          <!-- Table Header -->
          <div style="display: flex; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 8px;">
            <div style="flex: 2; font-weight: 500; font-size: 14px; color: #4B5563;">Item</div>
            <div style="flex: 1; font-weight: 500; font-size: 14px; color: #4B5563; text-align: right;">Price</div>
            <div style="flex: 1; font-weight: 500; font-size: 14px; color: #4B5563; text-align: right;">Qty</div>
            <div style="flex: 1; font-weight: 500; font-size: 14px; color: #4B5563; text-align: right;">Total</div>
          </div>
          
          <!-- Table Content -->
          ${invoice.items.map(item => `
            <div style="display: flex; padding: 15px 0; border-bottom: 1px solid #f3f4f6;">
              <div style="flex: 2; font-size: 14px;">${item.description}</div>
              <div style="flex: 1; font-size: 14px; text-align: right;">$ ${item.rate.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
              <div style="flex: 1; font-size: 14px; text-align: right;">${item.quantity}</div>
              <div style="flex: 1; font-size: 14px; text-align: right;">$ ${item.amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            </div>
          `).join('')}
          
          <!-- Summary Section -->
          <div style="display: flex; justify-content: flex-end; margin-top: 25px;">
            <div style="width: 250px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="color: #4B5563; font-size: 14px;">Subtotal</span>
                <span style="font-weight: 500; font-size: 14px;">$ ${invoice.subtotal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="color: #4B5563; font-size: 14px;">Discount ${invoice.discountPercentage > 0 ? `(Special Offer)` : ''}</span>
                <span style="font-weight: 500; font-size: 14px; color: #10B981;">$ ${invoice.discountAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="color: #4B5563; font-size: 14px;">TAX:</span>
                <span style="font-weight: 500; font-size: 14px; color: #3B82F6;">$ ${invoice.taxAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 1px solid #e5e7eb; margin-top: 6px;">
                <span style="font-weight: 600; font-size: 15px;">Invoice total</span>
                <span style="font-weight: 700; font-size: 15px;">$ ${invoice.total.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Terms and Notes -->
        <div style="padding: 30px 30px 40px 30px; display: flex; justify-content: space-between;">
          <div style="width: 48%;">
            <h3 style="font-size: 15px; font-weight: 600; margin: 0 0 12px 0;">Terms & Conditions:</h3>
            <p style="font-size: 13px; color: #6B7280; line-height: 1.5; margin: 0;">
              ${invoice.termsAndConditions || 'Fees and payment terms will be established in the contract or agreement prior to the commencement of the project. An initial deposit will be required before any design work begins. We reserve the right to suspend or halt work in the event of non-payment.'}
            </p>
          </div>
          
          <div style="width: 48%;">
            <h3 style="font-size: 15px; font-weight: 600; margin: 0 0 12px 0;">Notes</h3>
            <p style="font-size: 13px; color: #6B7280; line-height: 1.5; margin: 0;">
              ${invoice.notes || 'Fees and payment terms will be established in the contract or agreement prior to the commencement of the project. An initial deposit will be required before any design work begins. We reserve the right to suspend or halt work in the event of non-payment.'}
            </p>
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
      // Options for html2pdf - Updated to use A4 paper size with proper margins
      const options = {
        margin: 0, // Remove margins to use full width
        filename: `Invoice_${invoice.invoiceNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, // Higher scale for better quality
          useCORS: true,
          logging: false,
          backgroundColor: null
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', // A4 paper size (210mm × 297mm)
          orientation: 'portrait',
          compress: true,
          putOnlyUsedFonts: true,
          precision: 16 // Higher precision for better text rendering
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
