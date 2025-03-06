import { Client, Project, LeadSource, ProjectStatus, ProjectType, Currency, PaymentType, ProjectCategory } from "@/types";

// Mock data for clients
export const clients: Client[] = [
  {
    id: '1',
    name: 'Jane Cooper',
    email: 'jane.cooper@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, New York, NY 10001',
    leadSource: 'Website' as LeadSource,
    createdAt: new Date('2023-03-15T10:30:00Z'),
  },
  {
    id: '2',
    name: 'Robert Fox',
    email: 'robert.fox@example.com',
    phone: '+1 (555) 234-5678',
    address: '456 Elm St, San Francisco, CA 94107',
    leadSource: 'Dribbble' as LeadSource,
    createdAt: new Date('2023-04-20T14:45:00Z'),
  },
  {
    id: '3',
    name: 'Esther Howard',
    email: 'esther.howard@example.com',
    phone: '+1 (555) 345-6789',
    address: '789 Oak St, Chicago, IL 60611',
    leadSource: 'LinkedIn' as LeadSource,
    createdAt: new Date('2023-05-05T09:15:00Z'),
  },
  {
    id: '4',
    name: 'Leslie Alexander',
    email: 'leslie.alexander@example.com',
    phone: '+1 (555) 456-7890',
    address: '321 Pine St, Seattle, WA, 98101',
    leadSource: 'Direct Email' as LeadSource,
    createdAt: new Date('2023-05-12T11:20:00Z'),
  },
  {
    id: '5',
    name: 'Dianne Russell',
    email: 'dianne.russell@example.com',
    phone: '+1 (555) 567-8901',
    address: '654 Maple Ave, Boston, MA 02108',
    leadSource: 'Behance' as LeadSource,
    createdAt: new Date('2023-06-01T16:00:00Z'),
  },
];

// Mock data for projects
export const projects: Project[] = [
  {
    id: '1',
    name: 'Website Redesign',
    clientId: '1',
    status: 'In progress' as ProjectStatus,
    deadline: new Date('2023-08-30T23:59:59Z'),
    fee: 5000,
    currency: 'USD' as Currency,
    projectType: 'Project Based' as ProjectType,
    categories: ['Website Design', 'Landing Page'],
    createdAt: new Date('2023-06-15T10:30:00Z'),
    payments: [
      {
        id: '1',
        projectId: '1',
        paymentType: 'Down Payment' as PaymentType,
        amount: 2500,
        date: new Date('2023-06-20T14:30:00Z'),
        notes: 'Initial 50% payment',
      },
    ],
  },
  {
    id: '2',
    name: 'Mobile App Development',
    clientId: '2',
    status: 'Planning' as ProjectStatus,
    deadline: new Date('2023-10-15T23:59:59Z'),
    fee: 12000,
    currency: 'USD' as Currency,
    projectType: 'Project Based' as ProjectType,
    categories: ['Mobile App Design'],
    createdAt: new Date('2023-05-20T09:15:00Z'),
    payments: [
      {
        id: '1',
        projectId: '2',
        paymentType: 'Down Payment' as PaymentType,
        amount: 4000,
        date: new Date('2023-05-25T11:30:00Z'),
        notes: 'Initial payment',
      },
    ],
  },
  {
    id: '3',
    name: 'Branding Package',
    clientId: '3',
    status: 'Completed' as ProjectStatus,
    deadline: new Date('2023-06-30T23:59:59Z'),
    fee: 3500,
    currency: 'USD' as Currency,
    projectType: 'Project Based' as ProjectType,
    categories: ['Branding Design', 'Logo Design'],
    createdAt: new Date(new Date().getFullYear(), new Date().getMonth() - 2, 15),
    payments: [
      {
        id: '1',
        projectId: '3',
        paymentType: 'Down Payment' as PaymentType,
        amount: 1750,
        date: new Date('2023-04-15T10:00:00Z'),
        notes: '50% initial payment',
      },
      {
        id: '2',
        projectId: '3',
        paymentType: 'Final Payment' as PaymentType,
        amount: 1750,
        date: new Date('2023-06-28T15:00:00Z'),
        notes: 'Final payment upon delivery',
      },
    ],
  },
  {
    id: '4',
    name: 'UI/UX Consulting',
    clientId: '4',
    status: 'In progress' as ProjectStatus,
    deadline: new Date('2023-09-15T23:59:59Z'),
    fee: 75000,
    currency: 'IDR' as Currency,
    projectType: 'Monthly Retainer' as ProjectType,
    categories: ['Dashboard Design', 'Website Design'],
    createdAt: new Date('2023-06-01T09:00:00Z'),
    payments: [
      {
        id: '1',
        projectId: '4',
        paymentType: 'Down Payment' as PaymentType,
        amount: 25000,
        date: new Date('2023-06-05T10:30:00Z'),
        notes: 'First month retainer',
      },
    ],
  },
  {
    id: '5',
    name: 'Marketing Materials',
    clientId: '5',
    status: 'Paused' as ProjectStatus,
    deadline: new Date('2023-08-10T23:59:59Z'),
    fee: 2000,
    currency: 'USD' as Currency,
    projectType: 'Project Based' as ProjectType,
    categories: ['2D Illustrations', 'Branding Design'],
    createdAt: new Date('2023-05-15T11:30:00Z'),
    payments: [
      {
        id: '1',
        projectId: '5',
        paymentType: 'Down Payment' as PaymentType,
        amount: 1000,
        date: new Date('2023-05-20T13:00:00Z'),
        notes: '50% down payment',
      },
    ],
  },
  {
    id: '6',
    name: 'Logo Design',
    clientId: '2',
    status: 'Completed' as ProjectStatus,
    deadline: new Date('2023-07-30T23:59:59Z'),
    fee: 1500,
    currency: 'USD' as Currency,
    projectType: 'Project Based' as ProjectType,
    categories: ['Logo Design'],
    createdAt: new Date(new Date().getFullYear(), new Date().getMonth(), 5),
    payments: [
      {
        id: '1',
        projectId: '6',
        paymentType: 'Full Payment' as PaymentType,
        amount: 1500,
        date: new Date(new Date().getFullYear(), new Date().getMonth(), 5),
        notes: 'Payment in full',
      },
    ],
  },
];

// Stats for dashboard
export const stats = {
  totalClients: clients.length,
  totalProjects: projects.length,
  totalEarnings: projects.reduce((sum, project) => {
    // Convert IDR to USD at a simple ratio for this example (1 USD = 15000 IDR)
    const amountInUSD = project.currency === 'IDR' ? project.fee / 15000 : project.fee;
    return sum + amountInUSD;
  }, 0),
  activeProjects: projects.filter(p => p.status === 'In progress' || p.status === 'Planning').length,
};

// Recent clients (for dashboard)
export const recentClients = clients.sort((a, b) => 
  b.createdAt.getTime() - a.createdAt.getTime()
).slice(0, 5);

// Active projects (for dashboard)
export const activeProjects = projects
  .filter(p => p.status === 'In progress' || p.status === 'Planning')
  .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
  .slice(0, 5);

// Helper function to get client name by ID
export const getClientById = (clientId: string) => {
  const client = clients.find(c => c.id === clientId);
  return client ? client.name : 'Unknown Client';
};
