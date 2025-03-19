
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

    // Format dates in the style shown in the design
    const formattedDate = format(new Date(invoice.date), "MMMM d, yyyy");
    const formattedDueDate = format(new Date(invoice.dueDate), "MMMM d, yyyy");
    
    // Format client address with no truncation
    const clientAddress = client.address || 'No address provided';
    
    // Generate HTML content for the invoice - clean, modern layout matching the provided design
    const invoiceHtml = `
      <div id="invoice-container" style="font-family: Arial, sans-serif; width: 595px; height: 842px; position: relative; background: white; margin: 0 auto; padding: 0;">
        <!-- Top blue header banner with correct height -->
        <div style="width: 100%; height: 180px; position: absolute; top: 0; left: 0; background: #E9F2FF; margin: 0; padding: 0;"></div>
        
        <!-- Logo container with better positioning -->
        <div style="width: 120px; height: 120px; position: absolute; left: 50px; top: 30px; background: white; border-radius: 24px; display: flex; align-items: center; justify-content: center; box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.05);">
          <div style="font-size: 18px; font-weight: bold; color: #19213D;">Pin Box</div>
        </div>
        
        <!-- Invoice number - better positioned -->
        <div style="position: absolute; right: 50px; top: 30px; background: white; border-radius: 20px; padding: 6px 12px; box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.1);">
          <div style="text-align: right; color: #19213D; font-size: 12px; font-weight: 500;">${invoice.invoiceNumber}</div>
        </div>
        
        <!-- Content container with proper spacing -->
        <div style="position: absolute; width: 495px; left: 50px; top: 210px; display: flex; flex-direction: column; gap: 30px;">
          <!-- From/To/Date info with better spacing -->
          <div style="display: flex; justify-content: space-between; width: 100%;">
            <!-- From section -->
            <div style="width: 30%;">
              <div style="padding: 4px 8px; background: #E9F2FF; border-radius: 4px; width: fit-content; margin-bottom: 10px;">
                <div style="color: #2388FF; font-size: 10px; font-weight: 500;">From</div>
              </div>
              <div style="font-size: 14px; font-weight: 600; color: #19213D; margin-bottom: 8px;">Pin Box</div>
              <div style="font-size: 10px; color: #5D6481; line-height: 1.5;">
                ${client.phone ? `(612) 856 - 0989<br>` : ''}
                support@pinbox.io<br>
                ${clientAddress ? clientAddress.replace(/,/g, ',<br>') : ''}
              </div>
            </div>
            
            <!-- Invoice to section -->
            <div style="width: 30%;">
              <div style="padding: 4px 8px; background: #E9F2FF; border-radius: 4px; width: fit-content; margin-bottom: 10px;">
                <div style="color: #2388FF; font-size: 10px; font-weight: 500;">Invoice to:</div>
              </div>
              <div style="font-size: 14px; font-weight: 600; color: #19213D; margin-bottom: 8px;">${client.name}</div>
              <div style="font-size: 10px; color: #5D6481; line-height: 1.5;">
                ${client.phone ? `${client.phone}<br>` : ''}
                ${client.email ? `${client.email}<br>` : ''}
                ${clientAddress ? clientAddress.replace(/,/g, ',<br>') : ''}
              </div>
            </div>
            
            <!-- Date section -->
            <div style="width: 30%;">
              <div style="padding: 4px 8px; background: #E9F2FF; border-radius: 4px; width: fit-content; margin-bottom: 10px;">
                <div style="color: #2388FF; font-size: 10px; font-weight: 500;">Date:</div>
              </div>
              
              <!-- Issue date - better spacing -->
              <div style="margin-bottom: 15px;">
                <div style="font-size: 10px; color: #5D6481; margin-bottom: 4px;">Issued</div>
                <div style="font-size: 14px; font-weight: 600; color: #19213D;">${formattedDate}</div>
              </div>
              
              <!-- Payment due date -->
              <div>
                <div style="font-size: 10px; color: #5D6481; margin-bottom: 4px;">Payment Due</div>
                <div style="font-size: 14px; font-weight: 600; color: #19213D;">${formattedDueDate}</div>
              </div>
            </div>
          </div>
          
          <!-- Items Table with correct width -->
          <div style="width: 100%;">
            <!-- Table header with proper styling -->
            <div style="display: flex; background: #F6F8FC; border-radius: 8px; padding: 12px; margin-bottom: 5px;">
              <div style="flex: 3; color: #19213D; font-size: 10px; font-weight: 600;">Item</div>
              <div style="flex: 1; text-align: right; color: #19213D; font-size: 10px; font-weight: 600;">Price</div>
              <div style="flex: 1; text-align: center; color: #19213D; font-size: 10px; font-weight: 600;">Qty</div>
              <div style="flex: 1; text-align: right; color: #19213D; font-size: 10px; font-weight: 600;">Total</div>
            </div>
            
            <!-- Table rows with clean styling -->
            ${invoice.items.map(item => `
              <div style="display: flex; padding: 16px 12px; border-bottom: 1px solid #F6F8FC;">
                <div style="flex: 3; color: #19213D; font-size: 10px; font-weight: 600;">${item.description}</div>
                <div style="flex: 1; text-align: right; color: #5D6481; font-size: 10px;">$ ${item.rate.toLocaleString()}</div>
                <div style="flex: 1; text-align: center; color: #5D6481; font-size: 10px;">${item.quantity}</div>
                <div style="flex: 1; text-align: right; color: #19213D; font-size: 10px; font-weight: 600;">$ ${item.amount.toLocaleString()}</div>
              </div>
            `).join('')}
          </div>
          
          <!-- Bottom Section with Totals and Notes with proper spacing -->
          <div style="display: flex; flex-direction: column; gap: 40px; margin-top: 20px;">
            <!-- Totals Section - aligned to right -->
            <div style="width: 250px; align-self: flex-end;">
              <!-- Subtotal -->
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <div style="color: #19213D; font-size: 10px; font-weight: 600;">Subtotal</div>
                <div style="color: #5D6481; font-size: 10px;">$ ${invoice.subtotal.toLocaleString()}</div>
              </div>
              
              <!-- Discount with special offer label -->
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <div>
                  <span style="color: #19213D; font-size: 10px; font-weight: 600;">Discount </span>
                  ${invoice.discountAmount > 0 ? `<span style="color: #5D6481; font-size: 10px;">(Special Offer)</span>` : ''}
                </div>
                <div style="color: #5D6481; font-size: 10px;">$ ${invoice.discountAmount.toLocaleString()}</div>
              </div>
              
              <!-- Tax with blue highlight -->
              <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                <div style="color: #19213D; font-size: 10px; font-weight: 600;">TAX:</div>
                <div style="color: #2388FF; font-size: 10px;">$ ${invoice.taxAmount.toLocaleString()}</div>
              </div>
              
              <!-- Total with background highlight -->
              <div style="display: flex; justify-content: space-between; background: #F6F8FC; padding: 10px; border-radius: 8px;">
                <div style="color: #19213D; font-size: 10px; font-weight: 600;">Invoice total</div>
                <div style="color: #19213D; font-size: 10px; font-weight: 600;">$ ${invoice.total.toLocaleString()}</div>
              </div>
            </div>
            
            <!-- Terms and Notes Section with fixed width and proper alignment -->
            <div style="display: flex; justify-content: space-between; width: 100%; margin-top: 20px;">
              <!-- Terms column -->
              <div style="width: 45%;">
                <div style="color: #19213D; font-size: 8px; font-weight: 600; margin-bottom: 8px;">Terms & Conditions:</div>
                <div style="color: #868DA6; font-size: 8px; line-height: 1.4;">
                  ${invoice.termsAndConditions || 'Payment is due within the specified term. Please make the payment to the specified account.'}
                </div>
              </div>
              
              <!-- Notes column -->
              <div style="width: 45%;">
                <div style="color: #19213D; font-size: 8px; font-weight: 600; margin-bottom: 8px;">Notes</div>
                <div style="color: #868DA6; font-size: 8px; line-height: 1.4;">
                  ${invoice.notes || 'Fees and payment terms will be established in the contract or agreement prior to the commencement of the project. An initial deposit will be required before any design work begins. We reserve the right to suspend or halt work in the event of non-payment.'}
                </div>
              </div>
            </div>
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
      // Options for html2pdf with better quality settings
      const options = {
        margin: 0,
        filename: `Invoice_${invoice.invoiceNumber}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { 
          scale: 2,
          logging: false,
          dpi: 300,
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
