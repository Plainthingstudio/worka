
export type LeadSource = 'Dribbble' | 'Website' | 'LinkedIn' | 'Behance' | 'Direct Email' | 'Other';

export type ProjectStatus = 'Planning' | 'In progress' | 'Completed' | 'Paused' | 'Cancelled';

export type ProjectType = 'Project Based' | 'Monthly Retainer' | 'Monthly Pay as you go';

export type Currency = 'USD' | 'IDR';

export type PaymentType = 'Down Payment' | 'Final Payment' | 'Milestone Payment';

export type PaymentTerms = 'Due on Receipt' | 'Net 15' | 'Net 30' | 'Net 45' | 'Net 60' | 'Custom';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  leadSource: LeadSource;
  createdAt: Date;
}

export interface Payment {
  id: string;
  projectId: string;
  paymentType: PaymentType;
  amount: number;
  date: Date;
  notes?: string;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  client?: Client;
  status: ProjectStatus;
  deadline: Date;
  fee: number;
  currency: Currency;
  projectType: ProjectType;
  payments: Payment[];
  createdAt: Date;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  client?: Client;
  date: Date;
  dueDate: Date;
  paymentTerms: string;
  items: InvoiceItem[];
  subtotal: number;
  taxPercentage: number;
  taxAmount: number;
  discountPercentage: number;
  discountAmount: number;
  total: number;
  notes?: string;
  termsAndConditions?: string;
  createdAt: Date;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
}

export interface DashboardStats {
  totalClients: number;
  totalProjects: number;
  totalEarnings: number;
  activeProjects: number;
}
