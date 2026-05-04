export type LeadSource = 'Dribbble' | 'Website' | 'LinkedIn' | 'Behance' | 'Direct Email' | 'Other';

export type ProjectStatus = 'Planning' | 'In progress' | 'Awaiting Feedback' | 'Completed' | 'Paused' | 'Cancelled';

export type ProjectType = 'Project Based' | 'Monthly Retainer' | 'Monthly Pay as you go';

export type Currency = 'USD' | 'IDR';

export type PaymentType = 'Down Payment' | 'Final Payment' | 'Milestone Payment';

export type InvoiceType =
  | 'Down Payment'
  | 'Milestone Payment'
  | 'Settlement Invoice'
  | 'Full Invoice';

export type InvoicePaymentMode = 'percentage' | 'nominal';

export type PaymentTerms = 'Due on Receipt' | 'Net 15' | 'Net 30' | 'Net 45' | 'Net 60' | 'Custom';

export type TeamPosition = 
  | 'Project Manager' 
  | 'Account Executive' 
  | 'UI Designer' 
  | 'Senior UI Designer' 
  | 'Design Director' 
  | 'Lead UI Designer' 
  | 'Lead Graphic Designer' 
  | 'Lead Illustrator' 
  | 'Illustrator' 
  | 'Graphic Designer' 
  | 'Co-Founder';

export interface DateRange {
  from: Date;
  to: Date;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  leadSource: LeadSource;
  createdAt: Date;
  createdBy?: string; // Appwrite user_id
}

export interface Payment {
  id: string;
  projectId: string;
  paymentType: PaymentType;
  amount: number;
  date: Date;
  notes?: string;
}

export interface TeamMember {
  id: string;
  user_id: string;
  name: string;
  position: TeamPosition;
  startDate: Date;
  skills: string[];
  createdAt: Date;
  role?: string;
  email?: string;
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
  invoicePayments?: ProjectInvoicePayment[];
  serviceIds?: string[];
  subServiceIds?: string[];
  serviceQuantities?: number[];
  subServiceQuantities?: number[];
  teamMembers?: string[]; // Array of team member IDs
  createdAt: Date;
}

/** Stored in Appwrite (no spaces — Appwrite enum UI splits on space). */
export type ServiceCategory = 'ui_ux_design' | 'graphic_design' | 'illustrations';

export const SERVICE_CATEGORIES: ServiceCategory[] = ['ui_ux_design', 'graphic_design', 'illustrations'];

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  ui_ux_design: 'UI/UX Design',
  graphic_design: 'Graphic Design',
  illustrations: 'Illustrations',
};

export interface StudioService {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: Currency;
  category?: ServiceCategory;
  createdAt: Date;
  subServices?: StudioSubService[];
}

export interface StudioSubService {
  id: string;
  serviceId: string;
  name: string;
  description?: string;
  price: number;
  currency: Currency;
  createdAt: Date;
}

export interface ProjectInvoicePayment {
  id: string;
  invoiceNumber: string;
  invoiceType: InvoiceType;
  amount: number;
  date: Date;
  status: "Paid";
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
  clientName?: string;
  projectId?: string;
  projectName?: string;
  currency?: Currency;
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
  notes: string;
  termsAndConditions: string;
  createdAt: Date;
  status: "Draft" | "Sent" | "Paid" | "Overdue";
  invoiceType: InvoiceType;
  paymentType: InvoiceType;
  paymentMode?: InvoicePaymentMode;
  paymentPercentage?: number;
  paymentAmount?: number;
  projectTotalSnapshot?: number;
  alreadyPaidSnapshot?: number;
  remainingAmountSnapshot?: number;
}

export interface DashboardStats {
  totalClients: number;
  totalProjects: number;
  totalEarnings: number;
  activeProjects: number;
}

// New type definitions for Leads & Pipeline feature
export type LeadStage = 
  | 'Leads'
  | 'First Meeting'
  | 'Follow up 1'
  | 'Follow up 2'
  | 'Follow up 3'
  | 'Ghosting'
  | 'Provide Moodboard/Stylescape'
  | 'Down Payment'
  | 'Kickoff'
  | 'Finish';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  source?: string;
  stage: LeadStage;
  notes?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string; // Appwrite user_id
}
