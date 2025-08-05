
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/Layout';

// Import your pages
import Index from '@/pages/Index';
import Projects from '@/pages/Projects';
import ProjectDetails from '@/pages/ProjectDetails';
import Clients from '@/pages/Clients';
import Invoices from '@/pages/Invoices';
import InvoiceForm from '@/pages/InvoiceForm';
import InvoiceDetails from '@/pages/InvoiceDetails';
import Statistics from '@/pages/Statistics';
import Briefs from '@/pages/Briefs';
import Team from '@/pages/Team';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import GraphicDesignBrief from '@/pages/GraphicDesignBrief';
import UIDesignBrief from '@/pages/UIDesignBrief';
import IllustrationsBrief from '@/pages/IllustrationsBrief';
import ThankYou from '@/pages/ThankYou';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';
import Leads from '@/pages/Leads';
import Tasks from '@/pages/Tasks';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="/dashboard" element={<Layout title="Dashboard"><Dashboard /></Layout>} />
            <Route path="/projects" element={<Layout title="Projects"><Projects /></Layout>} />
            <Route path="/projects/:projectId" element={<ProjectDetails />} />
            <Route path="/tasks" element={<Layout title="Tasks"><Tasks /></Layout>} />
            <Route path="/clients" element={<Layout title="Clients"><Clients /></Layout>} />
            <Route path="/leads" element={<Layout title="Leads & Pipeline"><Leads /></Layout>} />
            <Route path="/invoices" element={<Layout title="Invoices"><Invoices /></Layout>} />
            <Route path="/invoices/new" element={<Layout title="Create Invoice"><InvoiceForm /></Layout>} />
            <Route path="/invoices/edit/:invoiceId" element={<Layout title="Edit Invoice"><InvoiceForm /></Layout>} />
            <Route path="/invoices/:invoiceId" element={<Layout title="Invoice Details"><InvoiceDetails /></Layout>} />
            <Route path="/statistics" element={<Layout title="Statistics"><Statistics /></Layout>} />
            <Route path="/briefs" element={<Layout title="Briefs"><Briefs /></Layout>} />
            <Route path="/team" element={<Layout title="Team"><Team /></Layout>} />
            <Route path="/settings" element={<Layout title="Settings"><Settings /></Layout>} />
            <Route path="/brief/graphic" element={<GraphicDesignBrief />} />
            <Route path="/brief/ui" element={<UIDesignBrief />} />
            <Route path="/brief/illustration" element={<IllustrationsBrief />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Navigate to="/auth" replace />} />
            <Route path="*" element={<Navigate to="/404" />} />
          </Routes>
        </Router>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
