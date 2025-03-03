
export type LeadSource = 'Dribbble' | 'Website' | 'LinkedIn' | 'Behance' | 'Direct Email' | 'Other';

export type ProjectStatus = 'Planning' | 'In progress' | 'Completed' | 'Paused' | 'Cancelled';

export type ProjectType = 'Project Based' | 'Monthly Retainer' | 'Monthly Pay as you go';

export type Currency = 'USD' | 'IDR';

export type PaymentType = 'Down Payment' | 'Final Payment' | 'Milestone Payment';

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

export interface DashboardStats {
  totalClients: number;
  totalProjects: number;
  totalEarnings: number;
  activeProjects: number;
}
