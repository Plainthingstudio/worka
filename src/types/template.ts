export interface ElementPosition {
  x: number;
  y: number;
}

export interface InvoiceTemplateElements {
  header?: ElementPosition;
  clientInfo?: ElementPosition;
  dates?: ElementPosition;
  items?: ElementPosition;
  totals?: ElementPosition;
  notes?: ElementPosition;
  signature?: ElementPosition;
}

export interface InvoiceTemplateStyle {
  fontFamily: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoPosition: 'left' | 'center' | 'right';
  borderStyle: 'none' | 'solid' | 'dashed' | 'dotted';
  borderWidth: number;
  borderColor: string;
  showLogo: boolean;
  showSignature: boolean;
  headerStyle: 'standard' | 'minimal' | 'modern';
  footerStyle: 'standard' | 'minimal' | 'modern';
  tableStyle: 'standard' | 'striped' | 'bordered';
  elements?: InvoiceTemplateElements;
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  style: InvoiceTemplateStyle;
}
