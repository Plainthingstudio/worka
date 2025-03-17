
export type LeadSource = 'Dribbble' | 'Website' | 'LinkedIn' | 'Behance' | 'Direct Email' | 'Other';

export type ProjectStatus = 'Planning' | 'In progress' | 'Completed' | 'Paused' | 'Cancelled';

export type ProjectType = 'Project Based' | 'Monthly Retainer' | 'Monthly Pay as you go';

export type Currency = 'USD' | 'IDR';

export type PaymentType = 'Down Payment' | 'Final Payment' | 'Milestone Payment';

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

export type ProjectCategory = 
  | 'Landing Page' 
  | 'Website Design' 
  | 'Mobile App Design' 
  | 'Dashboard Design'
  | 'Framer Development'
  | 'Webflow Development'
  | '2D Illustrations'
  | '3D Illustrations'
  | '2D Animations'
  | '3D Animations'
  | 'Logo Design'
  | 'Branding Design'
  | string; // Allow custom categories

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
  name: string;
  position: TeamPosition;
  startDate: Date;
  skills: string[];
  createdAt: Date;
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
  categories: ProjectCategory[];
  payments: Payment[];
  teamMembers?: string[]; // Array of team member IDs
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
  clientName?: string;
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
  | 'Provide Moodboard'
  | 'Follow up 3'
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
  createdAt: Date;
  updatedAt: Date;
}
