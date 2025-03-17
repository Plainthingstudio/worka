
import { InvoiceTemplate, InvoiceTemplateStyle } from '@/types/template';

// Default template style
export const defaultTemplateStyle: InvoiceTemplateStyle = {
  fontFamily: 'helvetica',
  primaryColor: '#1A1F2C',
  secondaryColor: '#7E69AB',
  accentColor: '#9b87f5',
  logoPosition: 'left',
  borderStyle: 'solid',
  borderWidth: 1,
  borderColor: '#e2e8f0',
  showLogo: true,
  showSignature: false,
  headerStyle: 'standard',
  footerStyle: 'standard',
  tableStyle: 'standard',
  elements: {
    header: { x: 40, y: 40 },
    clientInfo: { x: 40, y: 120 },
    dates: { x: 400, y: 120 },
    items: { x: 40, y: 220 },
    totals: { x: 400, y: 400 },
    notes: { x: 40, y: 450 },
    signature: { x: 400, y: 500 }
  }
};

// Default template
export const defaultTemplate: InvoiceTemplate = {
  id: 'default',
  name: 'Default Template',
  description: 'The default invoice template',
  isDefault: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  style: defaultTemplateStyle
};
