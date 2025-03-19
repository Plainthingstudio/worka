
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
    const formattedDate = format(new Date(invoice.date), "MMMM d, yyyy");
    const formattedDueDate = format(new Date(invoice.dueDate), "MMMM d, yyyy");
    
    // Format client address with no truncation
    const clientAddress = client.address || 'No address provided';
    
    // Generate HTML content for the invoice - simplified, cleaner layout
    const invoiceHtml = `
      <div id="invoice-container" style="font-family: Helvetica, Arial, sans-serif; width: 595px; height: 842px; position: relative; background: white; margin: 0 auto;">
        <!-- Top blue header banner -->
        <div style="width: 100%; height: 170px; position: absolute; top: 0; left: 0; background: #E3EFFF;"></div>
        
        <!-- Logo container (white box in top-left) -->
        <div style="width: 112px; height: 112px; left: 40px; top: 52px; position: absolute; background: white; box-shadow: 0px 2px 19px rgba(47, 94, 150, 0.07); border-radius: 24px; border: 0.60px #EBEFF6 solid; display: flex; align-items: center; justify-content: center;">
          <div style="font-size: 18px; font-weight: bold; color: #19213D;">Pin Box</div>
        </div>
        
        <!-- Invoice number pill -->
        <div style="padding: 5px 8px; right: 40px; top: 52px; position: absolute; background: white; box-shadow: 0px 1px 2px rgba(54, 61, 85, 0.08); border-radius: 25px; display: inline-flex; align-items: center;">
          <div style="text-align: right; color: #19213D; font-size: 10px; font-family: Helvetica, Arial, sans-serif; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;">${invoice.invoiceNumber}</div>
        </div>
        
        <!-- Main content container -->
        <div style="width: 523px; left: 40px; top: 210px; position: absolute; display: flex; flex-direction: column; gap: 24px;">
          <!-- From/To/Date section -->
          <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
            <!-- From section -->
            <div style="display: inline-flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
              <div style="background: #E3EFFF; border-radius: 4px; padding: 3px 4px;">
                <div style="color: #2388FF; font-size: 8px; font-weight: 500; line-height: 12px;">From</div>
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <div style="color: #19213D; font-size: 12px; font-weight: 600; line-height: 16px;">Pin Box</div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <div style="color: #5D6481; font-size: 8px; font-weight: 400; line-height: 12px;">support@pinbox.io</div>
                  <div style="color: #5D6481; font-size: 8px; font-weight: 400; line-height: 12px;">www.pinbox.io</div>
                </div>
              </div>
            </div>
            
            <!-- Invoice to section -->
            <div style="display: inline-flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
              <div style="background: #E3EFFF; border-radius: 4px; padding: 3px 4px;">
                <div style="color: #2388FF; font-size: 8px; font-weight: 500; line-height: 12px;">Invoice to:</div>
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <div style="color: #19213D; font-size: 12px; font-weight: 600; line-height: 16px;">${client.name}</div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  ${client.phone ? `<div style="color: #5D6481; font-size: 8px; font-weight: 400; line-height: 12px;">${client.phone}</div>` : ''}
                  ${client.email ? `<div style="color: #5D6481; font-size: 8px; font-weight: 400; line-height: 12px;">${client.email}</div>` : ''}
                  <div style="color: #5D6481; font-size: 8px; font-weight: 400; line-height: 12px; max-width: 140px;">${clientAddress}</div>
                </div>
              </div>
            </div>
            
            <!-- Date section -->
            <div style="display: inline-flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
              <div style="background: #E3EFFF; border-radius: 4px; padding: 3px 4px;">
                <div style="color: #2388FF; font-size: 8px; font-weight: 500; line-height: 12px;">Date:</div>
              </div>
              
              <!-- Issue date -->
              <div style="display: flex; flex-direction: column; gap: 4px;">
                <div style="color: #5D6481; font-size: 8px; font-weight: 400; line-height: 12px;">Issued</div>
                <div style="color: #19213D; font-size: 12px; font-weight: 600; line-height: 16px;">${formattedDate}</div>
              </div>
              
              <!-- Payment due date -->
              <div style="display: flex; flex-direction: column; gap: 4px;">
                <div style="color: #5D6481; font-size: 8px; font-weight: 400; line-height: 12px;">Payment Due</div>
                <div style="color: #19213D; font-size: 12px; font-weight: 600; line-height: 16px;">${formattedDueDate}</div>
              </div>
            </div>
          </div>
          
          <!-- Items Table -->
          <div style="display: flex; flex-direction: column;">
            <!-- Table header -->
            <div style="height: 39px; position: relative; background: #F6F8FC; border-radius: 8px; margin-bottom: 10px;">
              <div style="left: 12px; top: 12.50px; position: absolute; color: #19213D; font-size: 10px; font-weight: 600; line-height: 14px;">Item</div>
              <div style="left: 333px; top: 12.50px; position: absolute; text-align: right; color: #19213D; font-size: 10px; font-weight: 600; line-height: 14px;">Price</div>
              <div style="left: 408px; top: 12.50px; position: absolute; color: #19213D; font-size: 10px; font-weight: 600; line-height: 14px;">Qty</div>
              <div style="right: 12px; top: 12.50px; position: absolute; color: #19213D; font-size: 10px; font-weight: 600; line-height: 14px;">Total</div>
            </div>
            
            <!-- Table rows -->
            ${invoice.items.map(item => `
              <div style="padding: 16px 8px 16px 13px; border-bottom: 0.60px #F6F8FC solid; display: flex; justify-content: space-between; align-items: center;">
                <div style="width: 272px; display: flex; gap: 12px;">
                  <div style="color: #19213D; font-size: 10px; font-weight: 600; line-height: 14px;">${item.description}</div>
                </div>
                <div style="width: 200px; display: flex; justify-content: space-between;">
                  <div style="width: 110px; display: flex; justify-content: space-between;">
                    <div style="display: flex; gap: 2px;">
                      <div style="color: #5D6481; font-size: 10px; font-weight: 400; line-height: 14px;">$</div>
                      <div style="color: #5D6481; font-size: 10px; font-weight: 400; line-height: 14px;">${item.rate.toLocaleString()}</div>
                    </div>
                    <div style="color: #5D6481; font-size: 10px; font-weight: 400; line-height: 14px;">${item.quantity}</div>
                  </div>
                  <div style="display: flex; gap: 2px;">
                    <div style="color: #19213D; font-size: 10px; font-weight: 600; line-height: 14px;">$</div>
                    <div style="color: #19213D; font-size: 10px; font-weight: 600; line-height: 14px;">${item.amount.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
          
          <!-- Totals and Footer Section -->
          <div style="height: 262px; display: flex; flex-direction: column; justify-content: space-between; align-items: flex-end;">
            <!-- Totals -->
            <div style="width: 249px; display: flex; flex-direction: column; gap: 8px;">
              <!-- Subtotal line -->
              <div style="display: flex; flex-direction: column; gap: 4px;">
                <div style="padding: 0 8px; display: flex; justify-content: space-between; align-items: center;">
                  <div style="color: #19213D; font-size: 10px; font-weight: 600; line-height: 14px;">Subtotal</div>
                  <div style="display: flex; gap: 2px;">
                    <div style="color: #868DA6; font-size: 10px; font-weight: 400; line-height: 14px;">$</div>
                    <div style="color: #868DA6; font-size: 10px; font-weight: 400; line-height: 14px;">${invoice.subtotal.toLocaleString()}</div>
                  </div>
                </div>
                
                <!-- Discount line -->
                <div style="padding: 0 8px; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <span style="color: #19213D; font-size: 10px; font-weight: 600; line-height: 14px;">Discount </span>
                    ${invoice.discountAmount > 0 ? `<span style="color: #868DA6; font-size: 10px; font-weight: 600; line-height: 14px;">(Special Offer)</span>` : ''}
                  </div>
                  <div style="display: flex; gap: 2px;">
                    <div style="color: #868DA6; font-size: 10px; font-weight: 400; line-height: 14px;">$</div>
                    <div style="color: #868DA6; font-size: 10px; font-weight: 400; line-height: 14px;">${invoice.discountAmount.toLocaleString()}</div>
                  </div>
                </div>
                
                <!-- Tax line -->
                <div style="padding: 0 8px; display: flex; justify-content: space-between; align-items: center;">
                  <div style="color: #19213D; font-size: 10px; font-weight: 600; line-height: 14px;">TAX:</div>
                  <div style="display: flex; gap: 2px;">
                    <div style="color: #2388FF; font-size: 10px; font-weight: 400; line-height: 14px;">$</div>
                    <div style="color: #2388FF; font-size: 10px; font-weight: 400; line-height: 14px;">${invoice.taxAmount.toLocaleString()}</div>
                  </div>
                </div>
              </div>
              
              <!-- Total box -->
              <div style="width: 249px; padding: 10px 8px; background: #F6F8FC; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                <div style="color: #19213D; font-size: 10px; font-weight: 600; line-height: 14px;">Invoice total</div>
                <div style="display: flex; gap: 2px;">
                  <div style="color: #19213D; font-size: 10px; font-weight: 600; line-height: 14px;">$</div>
                  <div style="color: #19213D; font-size: 10px; font-weight: 600; line-height: 14px;">${invoice.total.toLocaleString()}</div>
                </div>
              </div>
            </div>
            
            <!-- Terms and Notes -->
            <div style="display: flex; width: 100%; gap: 50px;">
              <!-- Terms column -->
              <div style="flex: 1; display: flex; flex-direction: column; gap: 4px;">
                <div style="color: #19213D; font-size: 8px; font-weight: 600; line-height: 12px;">Terms & Conditions:</div>
                <div style="width: 220px;">
                  <div style="color: #868DA6; font-size: 8px; font-weight: 400; line-height: 12px;">${invoice.termsAndConditions || 'Payment due within 14 days of receipt.'}</div>
                </div>
              </div>
              
              <!-- Notes column -->
              <div style="flex: 1; display: flex; flex-direction: column; gap: 4px;">
                <div style="color: #19213D; font-size: 8px; font-weight: 600; line-height: 12px;">Notes</div>
                <div style="width: 220px;">
                  <div style="color: #868DA6; font-size: 8px; font-weight: 400; line-height: 12px;">${invoice.notes || 'No additional notes'}</div>
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
