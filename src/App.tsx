
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/Layout';
import { account, isAppwriteConfigured } from '@/integrations/appwrite/client';

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
import DesignSystem from '@/pages/DesignSystem';
import Services from '@/pages/Services';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const AuthenticatedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      if (!isAppwriteConfigured) {
        localStorage.removeItem("isLoggedIn");
        if (isMounted) {
          setIsAuthenticated(false);
          setIsCheckingAuth(false);
        }
        return;
      }

      try {
        await account.getSession("current");
        localStorage.setItem("isLoggedIn", "true");
        if (isMounted) {
          setIsAuthenticated(true);
        }
      } catch {
        localStorage.removeItem("isLoggedIn");
        if (isMounted) {
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      }
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
          <p className="mt-4 text-lg text-muted-foreground">Checking session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const ProtectedLayout = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <AuthenticatedRoute>
    <Layout title={title}>{children}</Layout>
  </AuthenticatedRoute>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="/dashboard" element={<ProtectedLayout title="Dashboard"><Dashboard /></ProtectedLayout>} />
            <Route path="/projects" element={<ProtectedLayout title="Projects"><Projects /></ProtectedLayout>} />
            <Route path="/projects/:projectId" element={<AuthenticatedRoute><ProjectDetails /></AuthenticatedRoute>} />
            <Route path="/tasks" element={<ProtectedLayout title="Tasks"><Tasks /></ProtectedLayout>} />
            <Route path="/clients" element={<ProtectedLayout title="Clients"><Clients /></ProtectedLayout>} />
            <Route path="/services" element={<ProtectedLayout title="Services"><Services /></ProtectedLayout>} />
            <Route path="/leads" element={<ProtectedLayout title="Leads & Pipeline"><Leads /></ProtectedLayout>} />
            <Route path="/invoices" element={<ProtectedLayout title="Invoices"><Invoices /></ProtectedLayout>} />
            <Route path="/invoices/new" element={<ProtectedLayout title="Create Invoice"><InvoiceForm /></ProtectedLayout>} />
            <Route path="/invoices/edit/:invoiceId" element={<ProtectedLayout title="Edit Invoice"><InvoiceForm /></ProtectedLayout>} />
            <Route path="/invoices/:invoiceId" element={<ProtectedLayout title="Invoice Details"><InvoiceDetails /></ProtectedLayout>} />
            <Route path="/statistics" element={<ProtectedLayout title="Statistics"><Statistics /></ProtectedLayout>} />
            <Route path="/briefs" element={<ProtectedLayout title="Briefs"><Briefs /></ProtectedLayout>} />
            <Route path="/team" element={<ProtectedLayout title="Team"><Team /></ProtectedLayout>} />
            <Route path="/settings" element={<ProtectedLayout title="Settings"><Settings /></ProtectedLayout>} />
            <Route path="/brief/graphic" element={<GraphicDesignBrief />} />
            <Route path="/brief/ui" element={<UIDesignBrief />} />
            <Route path="/brief/illustration" element={<IllustrationsBrief />} />
            <Route path="/design-system" element={<AuthenticatedRoute><DesignSystem /></AuthenticatedRoute>} />
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
