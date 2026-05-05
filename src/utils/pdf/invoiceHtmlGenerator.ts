
import { format } from 'date-fns';
import { Invoice } from '@/types';
import { formatDateParts } from './invoiceHelpers';
import { getInvoiceType, getPartialPaymentPrincipalLabel, isPartialInvoiceType } from '@/utils/invoiceTypes';

/**
 * Generates the HTML for the invoice PDF
 */
export const generateInvoiceHtml = (
  invoice: Invoice,
  client: { name: string; phone?: string; email: string; address?: string }
): string => {
  // Format dates
  const formattedDate = format(new Date(invoice.date), "MMMM dd, yyyy");
  const formattedDueDate = format(new Date(invoice.dueDate), "MMMM dd, yyyy");
  
  // Format for the new date sections
  const dateParts = formatDateParts(invoice);
  
  // Format client address with truncation if necessary
  const clientAddress = client.address || 'No address provided';
  const invoiceTypeLabel = getInvoiceType(invoice);

  // Generate HTML content for the invoice with new design
  return `
    <div id="invoice-container" style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333; width: 100%; margin: 0 auto; padding: 0; background: white; overflow: hidden;">
      <!-- Header Section with specific design -->
      <div style="position: relative; width: 100%;">
        <!-- Blue background header - UPDATED to purple -->
        <div style="width: 100%; height: 135px; background-color: #F8E3FF; position: relative;"></div>
        
        <!-- Logo placeholder - white rounded square with shadow and logo -->
        <div style="width: 112px; height: 112px; position: absolute; left: 40px; top: 52px; background-color: white; border-radius: 24px; box-shadow: 0px 2px 19px rgba(47.78, 94.96, 150.87, 0.07); border: 0.60px #EBEFF6 solid; display: flex; justify-content: center; align-items: center; padding: 6px; overflow: hidden;">
          <img src="/lovable-uploads/c992b2ba-2210-4bfe-a32a-016522dfd451.png" style="max-width: 80%; max-height: 80%; object-fit: contain; width: auto; height: auto;" />
        </div>
        
        <!-- Invoice type + invoice no: table layout for even padding in html2pdf/html2canvas -->
        <div style="position: absolute; right: 30px; top: 52px; display: flex; flex-direction: row; flex-wrap: wrap; align-items: flex-start; justify-content: flex-end; gap: 10px; max-width: min(440px, 94vw);">
          <div style="display: inline-block; vertical-align: top; margin: 0; font-size: 0; line-height: 0; border-radius: 8px; overflow: hidden; box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.05); border: 0.5px solid #EBEFF6; max-width: 260px; background: white;">
            <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: collapse; margin: 0;">
              <tr>
                <td style="padding: 12px; text-align: right; vertical-align: top; background: white;">
                  <div style="color: #94A3B8; font-size: 10px; font-family: Helvetica, Arial, sans-serif; font-weight: 500; line-height: 12px; text-transform: uppercase; letter-spacing: 0.04em; margin: 0; padding: 0;">Invoice Type</div>
                  <div style="color: #7B23FF; font-size: 16px; font-family: Helvetica, Arial, sans-serif; font-weight: 600; line-height: 18px; margin: 4px 0 0 0; padding: 0; word-wrap: break-word;">${invoiceTypeLabel}</div>
                </td>
              </tr>
            </table>
          </div>
          <div style="display: inline-block; vertical-align: top; margin: 0; font-size: 0; line-height: 0; border-radius: 8px; overflow: hidden; box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.05); border: 0.5px solid #EBEFF6; background: white;">
            <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; margin: 0;">
              <tr>
                <td style="padding: 12px; text-align: right; vertical-align: top; background: white;">
                  <div style="color: #94A3B8; font-size: 10px; font-family: Helvetica, Arial, sans-serif; font-weight: 500; line-height: 12px; text-transform: uppercase; letter-spacing: 0.04em; margin: 0; padding: 0;">Invoice No.</div>
                  <div style="color: #7B23FF; font-size: 16px; font-family: Helvetica, Arial, sans-serif; font-weight: 600; line-height: 18px; margin: 4px 0 0 0; padding: 0;">${invoice.invoiceNumber}</div>
                </td>
              </tr>
            </table>
          </div>
        </div>
      </div>
      
      <!-- Updated From, To, and Date Sections with new design -->
      <div style="padding: 28px 40px 28px 40px; margin-top: 35px; width: 100%; box-sizing: border-box; justify-content: space-between; align-items: flex-start; display: inline-flex; flex-wrap: wrap; align-content: flex-start; gap: 20px 24px;">
        <!-- From section -->
        <div style="flex-direction: column; justify-content: flex-start; align-items: flex-start; gap: 10px; display: inline-flex">
          <div style="color: #7B23FF; font-size: 10px; font-family: Helvetica, Arial, sans-serif; font-weight: 500; line-height: 10px; text-transform: uppercase; letter-spacing: 0.04em;">From</div>
          <div style="align-self: stretch; flex-direction: column; justify-content: flex-start; align-items: flex-start; gap: 8px; display: flex">
            <div style="width: 178px; justify-content: flex-start; align-items: flex-start; display: inline-flex">
              <div style="flex: 1 1 0; color: #19213D; font-size: 14px; font-family: Inter; font-weight: 600; line-height: 18px; word-wrap: break-word">Plainthing Studio</div>
            </div>
            <div style="flex-direction: column; justify-content: flex-start; align-items: flex-start; gap: 4px; display: flex">
              <div style="justify-content: flex-start; align-items: flex-start; display: inline-flex">
                <div style="color: #5D6481; font-size: 10px; font-family: Inter; font-weight: 400; line-height: 14px; word-wrap: break-word">plainthingstudio@gmail.com</div>
              </div>
              <div style="width: 140px; justify-content: flex-start; align-items: flex-start; display: inline-flex">
                <div style="flex: 1 1 0; color: #5D6481; font-size: 10px; font-family: Inter; font-weight: 400; line-height: 14px; word-wrap: break-word">Yogyakarta, Indonesia</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- To section -->
        <div style="flex-direction: column; justify-content: flex-start; align-items: flex-start; gap: 10px; display: inline-flex">
          <div style="color: #7B23FF; font-size: 10px; font-family: Helvetica, Arial, sans-serif; font-weight: 500; line-height: 10px; text-transform: uppercase; letter-spacing: 0.04em;">Invoice to:</div>
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
            <div style="color: #7B23FF; font-size: 10px; font-family: Helvetica, Arial, sans-serif; font-weight: 500; line-height: 10px; text-transform: uppercase; letter-spacing: 0.04em;">Date:</div>
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
  const invoiceType = getInvoiceType(invoice);
  const isPartialInvoice = isPartialInvoiceType(invoiceType);
  const currency = invoice.currency || 'IDR';
  const fmt = (n: number) =>
    (Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const standardSummaryRows = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #4B5563; font-size: 14px;">Subtotal</span>
              <span style="font-weight: 500; font-size: 14px;">${currency} ${fmt(invoice.subtotal)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #4B5563; font-size: 14px;">Discount${
                invoice.discountPercentage > 0 ? ` (${invoice.discountPercentage}%)` : ''
              }</span>
              <span style="font-weight: 500; font-size: 14px; color: #10B981;">${currency} ${fmt(
                invoice.discountAmount
              )}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #4B5563; font-size: 14px;">Tax${
                invoice.taxPercentage > 0 ? ` (${invoice.taxPercentage}%)` : ''
              }</span>
              <span style="font-weight: 500; font-size: 14px; color: #3B82F6;">${currency} ${fmt(
                invoice.taxAmount
              )}</span>
            </div>`;

  const partialContextSection = isPartialInvoice
    ? `
            <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed #CBD5E1;">
              <div style="font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 10px;">Project summary</div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="color: #4B5563; font-size: 14px;">Project total</span>
                <span style="font-weight: 500; font-size: 14px;">${currency} ${fmt(
                    invoice.projectTotalSnapshot || 0
                  )}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="color: #4B5563; font-size: 14px;">${getPartialPaymentPrincipalLabel(
                  invoice
                )}</span>
                <span style="font-weight: 500; font-size: 14px;">${currency} ${fmt(
        invoice.paymentAmount || 0
      )}</span>
              </div>
              ${
                invoiceType !== 'Down Payment'
                  ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="color: #4B5563; font-size: 14px;">Already paid</span>
                <span style="font-weight: 500; font-size: 14px;">${currency} ${fmt(
                    invoice.alreadyPaidSnapshot || 0
                  )}</span>
              </div>`
                  : ''
              }
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="color: #4B5563; font-size: 14px;">${
                  invoiceType === 'Down Payment'
                    ? 'Remaining after down payment'
                    : 'Remaining balance'
                }</span>
                <span style="font-weight: 500; font-size: 14px;">${currency} ${fmt(
        invoice.remainingAmountSnapshot || 0
      )}</span>
              </div>
            </div>`
    : '';

  const footerLabel = isPartialInvoice ? 'Amount due today' : 'Invoice total';

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
      ${invoice.items
        .map(
          (item) => `
        <div style="display: flex; padding: 15px 0; border-bottom: 1px solid #f3f4f6;">
          <div style="flex: 2; font-size: 14px;">${item.description}</div>
          <div style="flex: 1; font-size: 14px; text-align: right;">${currency} ${fmt(item.rate)}</div>
          <div style="flex: 1; font-size: 14px; text-align: right;">${item.quantity}</div>
          <div style="flex: 1; font-size: 14px; text-align: right;">${currency} ${fmt(item.amount)}</div>
        </div>`
        )
        .join('')}
      
      <!-- Summary Section -->
      <div style="display: flex; justify-content: flex-end; margin-top: 25px;">
        <div style="width: 280px;">
          ${standardSummaryRows}
          ${partialContextSection}
          <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 1px solid #e5e7eb; margin-top: 10px;">
            <span style="font-weight: 600; font-size: 15px;">${footerLabel}</span>
            <span style="font-weight: 700; font-size: 15px;">${currency} ${fmt(invoice.total)}</span>
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
