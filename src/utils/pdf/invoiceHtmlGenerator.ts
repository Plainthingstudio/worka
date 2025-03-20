
import { format } from 'date-fns';
import { Invoice } from '@/types';
import { formatDateParts } from './invoiceHelpers';

/**
 * Generates the HTML for the invoice PDF
 */
export const generateInvoiceHtml = (invoice: Invoice, client: any): string => {
  // Format dates
  const formattedDate = format(new Date(invoice.date), "MMMM dd, yyyy");
  const formattedDueDate = format(new Date(invoice.dueDate), "MMMM dd, yyyy");
  
  // Format for the new date sections
  const dateParts = formatDateParts(invoice);
  
  // Format client address with truncation if necessary
  const clientAddress = client.address || 'No address provided';
  
  // Generate HTML content for the invoice with new design
  return `
    <div id="invoice-container" style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333; width: 100%; margin: 0 auto; padding: 0; background: white; overflow: hidden;">
      <!-- Header Section with specific design -->
      <div style="position: relative; width: 100%;">
        <!-- Blue background header -->
        <div style="width: 100%; height: 135px; background-color: #E3EFFF; position: relative;"></div>
        
        <!-- Logo placeholder - white rounded square with shadow -->
        <div style="width: 112px; height: 112px; position: absolute; left: 40px; top: 52px; background-color: white; border-radius: 24px; box-shadow: 0px 2px 19px rgba(47.78, 94.96, 150.87, 0.07); border: 0.60px #EBEFF6 solid;"></div>
        
        <!-- Invoice number in a pill/capsule style - updated padding to 0px top and 16px bottom -->
        <div style="position: absolute; right: 30px; top: 52px; background: white; border-radius: 8px; padding-left: 12px; padding-right: 12px; padding-top: 0px; padding-bottom: 16px; box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.05); border: 0.5px solid #EBEFF6; justify-content: center; align-items: center; display: inline-flex;">
          <div style="color: #2388FF; font-size: 16px; font-family: Inter; font-weight: 500; line-height: 20px; word-wrap: break-word">${invoice.invoiceNumber}</div>
        </div>
      </div>
      
      <!-- Updated From, To, and Date Sections with new design -->
      <div style="padding: 30px 30px 15px 30px; margin-top: 35px; width: 100%; justify-content: space-between; align-items: flex-start; display: inline-flex; flex-wrap: wrap; align-content: flex-start">
        <!-- From section -->
        <div style="flex-direction: column; justify-content: flex-start; align-items: flex-start; gap: 10px; display: inline-flex">
          <div style="padding-left: 8px; padding-right: 8px; padding-top: 0px; padding-bottom: 12px; background: #E3EFFF; border-radius: 4px; justify-content: center; align-items: center; display: inline-flex">
            <div style="color: #2388FF; font-size: 10px; font-family: Inter; font-weight: 500; line-height: 14px; word-wrap: break-word">From</div>
          </div>
          <div style="align-self: stretch; flex-direction: column; justify-content: flex-start; align-items: flex-start; gap: 8px; display: flex">
            <div style="width: 178px; justify-content: flex-start; align-items: flex-start; display: inline-flex">
              <div style="flex: 1 1 0; color: #19213D; font-size: 14px; font-family: Inter; font-weight: 600; line-height: 18px; word-wrap: break-word">Plainthing Studio</div>
            </div>
            <div style="flex-direction: column; justify-content: flex-start; align-items: flex-start; gap: 4px; display: flex">
              <div style="justify-content: flex-start; align-items: flex-start; display: inline-flex">
                <div style="color: #5D6481; font-size: 10px; font-family: Inter; font-weight: 400; line-height: 14px; word-wrap: break-word">(612) 856 - 0989</div>
              </div>
              <div style="justify-content: flex-start; align-items: flex-start; display: inline-flex">
                <div style="color: #5D6481; font-size: 10px; font-family: Inter; font-weight: 400; line-height: 14px; word-wrap: break-word">contact@maurosicard.com</div>
              </div>
              <div style="width: 140px; justify-content: flex-start; align-items: flex-start; display: inline-flex">
                <div style="flex: 1 1 0; color: #5D6481; font-size: 10px; font-family: Inter; font-weight: 400; line-height: 14px; word-wrap: break-word">Pablo Alto, San Francisco, CA 92102, United States of America</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- To section -->
        <div style="flex-direction: column; justify-content: flex-start; align-items: flex-start; gap: 10px; display: inline-flex">
          <div style="padding-left: 8px; padding-right: 8px; padding-top: 0px; padding-bottom: 12px; background: #E3EFFF; border-radius: 4px; justify-content: center; align-items: center; display: inline-flex">
            <div style="color: #2388FF; font-size: 10px; font-family: Inter; font-weight: 500; line-height: 14px; word-wrap: break-word">Invoice to:</div>
          </div>
          <div style="align-self: stretch; flex-direction: column; justify-content: flex-start; align-items: flex-start; gap: 8px; display: flex">
            <div style="width: 178px; justify-content: flex-start; align-items: flex-start; display: inline-flex">
              <div style="flex: 1 1 0; color: #19213D; font-size: 14px; font-family: Inter; font-weight: 600; line-height: 18px; word-wrap: break-word">${client.name}</div>
            </div>
            <div style="flex-direction: column; justify-content: flex-start; align-items: flex-start; gap: 4px; display: flex">
              <div style="justify-content: flex-start; align-items: flex-start; display: inline-flex">
                <div style="color: #5D6481; font-size: 10px; font-family: Inter; font-weight: 400; line-height: 14px; word-wrap: break-word">${client.phone || '(612) 856 - 0989'}</div>
              </div>
              <div style="justify-content: flex-start; align-items: flex-start; display: inline-flex">
                <div style="color: #5D6481; font-size: 10px; font-family: Inter; font-weight: 400; line-height: 14px; word-wrap: break-word">${client.email}</div>
              </div>
              <div style="width: 140px; justify-content: flex-start; align-items: flex-start; display: inline-flex">
                <div style="flex: 1 1 0; color: #5D6481; font-size: 10px; font-family: Inter; font-weight: 400; line-height: 14px; word-wrap: break-word">${clientAddress}</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Date section -->
        <div style="flex-direction: column; justify-content: flex-start; align-items: flex-start; gap: 10px; display: inline-flex">
          <div style="flex-direction: column; justify-content: flex-start; align-items: flex-start; gap: 10px; display: flex">
            <div style="padding-left: 8px; padding-right: 8px; padding-top: 0px; padding-bottom: 12px; background: #E3EFFF; border-radius: 4px; justify-content: center; align-items: center; display: inline-flex">
              <div style="color: #2388FF; font-size: 10px; font-family: Inter; font-weight: 500; line-height: 14px; word-wrap: break-word">Date:</div>
            </div>
            <div style="flex-direction: column; justify-content: flex-start; align-items: flex-start; gap: 4px; display: flex">
              <div style="color: #5D6481; font-size: 10px; font-family: Inter; font-weight: 400; line-height: 14px; word-wrap: break-word">Issued</div>
              <div style="justify-content: flex-start; align-items: flex-start; gap: 2px; display: inline-flex">
                <div style="justify-content: flex-start; align-items: flex-start; gap: 20px; display: flex">
                  <div style="color: #19213D; font-size: 14px; font-family: Inter; font-weight: 600; line-height: 18px; word-wrap: break-word">${dateParts.issued.month}</div>
                </div>
                <div style="justify-content: flex-start; align-items: flex-start; gap: 20px; display: flex">
                  <div style="color: #19213D; font-size: 14px; font-family: Inter; font-weight: 600; line-height: 18px; word-wrap: break-word">${dateParts.issued.day}</div>
                </div>
                <div style="justify-content: flex-start; align-items: flex-start; gap: 20px; display: flex">
                  <div style="color: #19213D; font-size: 14px; font-family: Inter; font-weight: 600; line-height: 18px; word-wrap: break-word">${dateParts.issued.year}</div>
                </div>
              </div>
            </div>
            <div style="flex-direction: column; justify-content: flex-start; align-items: flex-start; gap: 4px; display: flex">
              <div style="color: #5D6481; font-size: 10px; font-family: Inter; font-weight: 400; line-height: 14px; word-wrap: break-word">Payment Due</div>
              <div style="justify-content: flex-start; align-items: flex-start; gap: 2px; display: inline-flex">
                <div style="justify-content: flex-start; align-items: flex-start; gap: 20px; display: flex">
                  <div style="color: #19213D; font-size: 14px; font-family: Inter; font-weight: 600; line-height: 18px; word-wrap: break-word">${dateParts.due.month}</div>
                </div>
                <div style="justify-content: flex-start; align-items: flex-start; gap: 20px; display: flex">
                  <div style="color: #19213D; font-size: 14px; font-family: Inter; font-weight: 600; line-height: 18px; word-wrap: break-word">${dateParts.due.day}</div>
                </div>
                <div style="justify-content: flex-start; align-items: flex-start; gap: 20px; display: flex">
                  <div style="color: #19213D; font-size: 14px; font-family: Inter; font-weight: 600; line-height: 18px; word-wrap: break-word">${dateParts.due.year}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      ${renderInvoiceItems(invoice)}
      
      ${renderTermsAndNotes(invoice)}
    </div>
  `;
};

/**
 * Renders the items table section of the invoice
 */
function renderInvoiceItems(invoice: Invoice): string {
  return `
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
  `;
}

/**
 * Renders the terms and notes section of the invoice
 */
function renderTermsAndNotes(invoice: Invoice): string {
  return `
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
  `;
}
