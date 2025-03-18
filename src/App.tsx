
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';

// Import your pages
import Index from '@/pages/Index';
import Projects from '@/pages/Projects';
import ProjectDetails from '@/pages/ProjectDetails';
import Clients from '@/pages/Clients';
import Invoices from '@/pages/Invoices';
import InvoiceForm from '@/pages/InvoiceForm';
import InvoiceDetails from '@/pages/InvoiceDetails';
import InvoiceEditor from '@/pages/InvoiceEditor';
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

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:projectId" element={<ProjectDetails />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/invoices/new" element={<InvoiceForm />} />
          <Route path="/invoices/edit/:invoiceId" element={<InvoiceForm />} />
          <Route path="/invoices/:invoiceId" element={<InvoiceDetails />} />
          <Route path="/invoice-editor" element={<InvoiceEditor />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/briefs" element={<Briefs />} />
          <Route path="/team" element={<Team />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/graphic-design-brief" element={<GraphicDesignBrief />} />
          <Route path="/ui-design-brief" element={<UIDesignBrief />} />
          <Route path="/illustrations-brief" element={<IllustrationsBrief />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" />} />
        </Routes>
      </Router>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
