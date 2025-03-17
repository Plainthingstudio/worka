
export interface InvoiceTemplateStyle {
  fontFamily: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoPosition: 'left' | 'right' | 'center';
  borderStyle: 'none' | 'solid' | 'dashed' | 'dotted';
  borderWidth: number;
  borderColor: string;
  showLogo: boolean;
  showSignature: boolean;
  headerStyle: 'standard' | 'minimal' | 'detailed';
  footerStyle: 'standard' | 'minimal' | 'detailed';
  tableStyle: 'standard' | 'striped' | 'bordered';
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
