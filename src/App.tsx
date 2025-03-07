
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import Invoices from './pages/Invoices';
import InvoiceForm from './pages/InvoiceForm';
import InvoiceDetails from './pages/InvoiceDetails';
import NotFound from './pages/NotFound';
import Auth from './pages/Auth';
import Clients from './pages/Clients';
import Settings from './pages/Settings';
import RequireAuth from './components/auth/RequireAuth';
import { AuthProvider } from './hooks/useAuth';

function App() {
  return (
    <Router>
      <ThemeProvider defaultTheme="dark" storageKey="vite-react-theme">
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Auth />} />
            <Route path="/register" element={<Auth />} />

            {/* Protected Routes */}
            <Route path="/" element={<RequireAuth><Invoices /></RequireAuth>} />
            <Route path="/invoices" element={<RequireAuth><Invoices /></RequireAuth>} />
            <Route path="/invoices/new" element={<RequireAuth><InvoiceForm /></RequireAuth>} />
            <Route path="/invoices/:invoiceId" element={<RequireAuth><InvoiceDetails /></RequireAuth>} />
            <Route path="/invoices/:invoiceId/edit" element={<RequireAuth><InvoiceForm /></RequireAuth>} />
            <Route path="/clients" element={<RequireAuth><Clients /></RequireAuth>} />
            <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
