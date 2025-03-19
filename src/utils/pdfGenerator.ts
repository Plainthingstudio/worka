
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
      <div id="invoice-container" style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333; max-width: 800px; margin: 0 auto; padding: 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); background: white; border-radius: 10px; overflow: hidden;">
        <!-- Header Section with light blue background and logo -->
        <div style="background-color: #e6f2ff; padding: 30px 40px; position: relative;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <!-- Logo placeholder - white rounded square -->
            <div style="width: 100px; height: 100px; background-color: white; border-radius: 20px; margin-right: 20px;"></div>
            
            <!-- Invoice number in a pill/capsule style -->
            <div style="background-color: white; border-radius: 50px; padding: 8px 16px; font-weight: 500; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
              ${invoice.invoiceNumber}
            </div>
          </div>
        </div>
        
        <!-- From and To Sections -->
        <div style="padding: 40px 40px 20px 40px; display: flex; justify-content: space-between;">
          <!-- From section -->
          <div style="width: 30%;">
            <p style="font-size: 13px; color: #6B7280; margin: 0 0 8px 0;">From</p>
            <h2 style="font-size: 18px; font-weight: 600; margin: 0 0 10px 0;">Plainthing Studio</h2>
            <p style="font-size: 14px; color: #4B5563; margin: 0 0 4px 0;">(612) 856 - 0989</p>
            <p style="font-size: 14px; color: #4B5563; margin: 0 0 4px 0;">contact@maurosicard.com</p>
            <p style="font-size: 14px; color: #4B5563; margin: 0 0 4px 0; line-height: 1.5;">
              Pablo Alto, San Francisco, CA 92102,<br>
              United States of America
            </p>
          </div>
          
          <!-- To section -->
          <div style="width: 30%;">
            <p style="font-size: 13px; color: #6B7280; margin: 0 0 8px 0;">Invoice to:</p>
            <h2 style="font-size: 18px; font-weight: 600; margin: 0 0 10px 0;">${client.name}</h2>
            <p style="font-size: 14px; color: #4B5563; margin: 0 0 4px 0;">${client.phone || '(612) 856 - 0989'}</p>
            <p style="font-size: 14px; color: #4B5563; margin: 0 0 4px 0;">${client.email}</p>
            <p style="font-size: 14px; color: #4B5563; margin: 0 0 4px 0; line-height: 1.5;">
              ${clientAddress.replace(/,/g, ',<br>')}
            </p>
          </div>
          
          <!-- Date section -->
          <div style="width: 30%;">
            <p style="font-size: 13px; color: #6B7280; margin: 0 0 8px 0;">Date:</p>
            <p style="font-size: 14px; color: #4B5563; margin: 0 0 4px 0;">Issued</p>
            <h2 style="font-size: 18px; font-weight: 600; margin: 0 0 25px 0;">${formattedDate}</h2>
            
            <p style="font-size: 14px; color: #4B5563; margin: 0 0 4px 0;">Payment Due</p>
            <h2 style="font-size: 18px; font-weight: 600; margin: 0;">${formattedDueDate}</h2>
          </div>
        </div>
        
        <!-- Items Table -->
        <div style="padding: 20px 40px;">
          <!-- Table Header -->
          <div style="display: flex; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 10px;">
            <div style="flex: 2; font-weight: 500; font-size: 15px; color: #4B5563;">Item</div>
            <div style="flex: 1; font-weight: 500; font-size: 15px; color: #4B5563; text-align: right;">Price</div>
            <div style="flex: 1; font-weight: 500; font-size: 15px; color: #4B5563; text-align: right;">Qty</div>
            <div style="flex: 1; font-weight: 500; font-size: 15px; color: #4B5563; text-align: right;">Total</div>
          </div>
          
          <!-- Table Content -->
          ${invoice.items.map(item => `
            <div style="display: flex; padding: 18px 0; border-bottom: 1px solid #f3f4f6;">
              <div style="flex: 2; font-size: 15px;">${item.description}</div>
              <div style="flex: 1; font-size: 15px; text-align: right;">$ ${item.rate.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
              <div style="flex: 1; font-size: 15px; text-align: right;">${item.quantity}</div>
              <div style="flex: 1; font-size: 15px; text-align: right;">$ ${item.amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            </div>
          `).join('')}
          
          <!-- Summary Section -->
          <div style="display: flex; justify-content: flex-end; margin-top: 30px;">
            <div style="width: 280px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                <span style="color: #4B5563; font-size: 15px;">Subtotal</span>
                <span style="font-weight: 500; font-size: 15px;">$ ${invoice.subtotal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                <span style="color: #4B5563; font-size: 15px;">Discount ${invoice.discountPercentage > 0 ? `(Special Offer)` : ''}</span>
                <span style="font-weight: 500; font-size: 15px; color: #10B981;">$ ${invoice.discountAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                <span style="color: #4B5563; font-size: 15px;">TAX:</span>
                <span style="font-weight: 500; font-size: 15px; color: #3B82F6;">$ ${invoice.taxAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; padding-top: 12px; border-top: 1px solid #e5e7eb; margin-top: 8px;">
                <span style="font-weight: 600; font-size: 16px;">Invoice total</span>
                <span style="font-weight: 700; font-size: 16px;">$ ${invoice.total.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Terms and Notes -->
        <div style="padding: 40px 40px 60px 40px; display: flex; justify-content: space-between;">
          <div style="width: 48%;">
            <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 15px 0;">Terms & Conditions:</h3>
            <p style="font-size: 14px; color: #6B7280; line-height: 1.5; margin: 0;">
              ${invoice.termsAndConditions || 'Fees and payment terms will be established in the contract or agreement prior to the commencement of the project. An initial deposit will be required before any design work begins. We reserve the right to suspend or halt work in the event of non-payment.'}
            </p>
          </div>
          
          <div style="width: 48%;">
            <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 15px 0;">Notes</h3>
            <p style="font-size: 14px; color: #6B7280; line-height: 1.5; margin: 0;">
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
      // Options for html2pdf
      const options = {
        margin: 0,
        filename: `Invoice_${invoice.invoiceNumber}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: false,
          width: 800, // Set exact width to 800px
          height: undefined, // Let height adjust automatically
          backgroundColor: null
        },
        jsPDF: { 
          unit: 'px', 
          format: [800, 1100], // Custom page size to match design
          orientation: 'portrait',
          compress: true,
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
