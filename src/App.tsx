
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "./components/ThemeProvider";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import Invoices from "./pages/Invoices";
import InvoiceForm from "./pages/InvoiceForm";
import InvoiceDetails from "./pages/InvoiceDetails";
import Briefs from "./pages/Briefs";
import UIDesignBrief from "./pages/UIDesignBrief";
import GraphicDesignBrief from "./pages/GraphicDesignBrief";
import IllustrationsBrief from "./pages/IllustrationsBrief";
import ThankYou from "./pages/ThankYou";
import Statistics from "./pages/Statistics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Team from "./pages/Team";
import "./App.css";

const isAuthenticated = () => {
  return localStorage.getItem("isLoggedIn") === "true";
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isChecking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 w-8 mx-auto rounded-full bg-primary/10">
            <div className="h-4 w-4 mx-auto rounded-full bg-primary" />
          </div>
        </div>
      </div>
    );
  }
  
  return isAuthenticated() ? <>{children}</> : <Navigate to="/auth" replace />;
};

function App() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <ThemeProvider>
      <Router>
        {isMounted && (
          <Routes>
            <Route path="/" element={
              <>
                <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                  <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                      <h1 className="text-3xl font-bold tracking-tight">Design Brief Portal</h1>
                      <p className="mt-2 text-muted-foreground">Submit a design brief or log in to view your dashboard</p>
                    </div>
                    
                    <div className="space-y-4 mt-8">
                      <div className="grid grid-cols-1 gap-4">
                        <a href="/briefs/ui-design" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1">
                          Submit UI Design Brief
                        </a>
                        <a href="/briefs/graphic-design" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1">
                          Submit Graphic Design Brief
                        </a>
                        <a href="/briefs/illustrations" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1">
                          Submit Illustration Brief
                        </a>
                      </div>
                      
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">Or</span>
                        </div>
                      </div>
                      
                      <a href="/auth" className="inline-flex w-full items-center justify-center rounded-md border border-input bg-background px-4 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1">
                        Log in to Dashboard
                      </a>
                    </div>
                  </div>
                </div>
              </>
            } />
            <Route path="/auth" element={<Auth />} />
            
            {/* Public routes for briefs - no authentication required */}
            <Route path="/briefs/ui-design" element={<UIDesignBrief />} />
            <Route path="/briefs/graphic-design" element={<GraphicDesignBrief />} />
            <Route path="/briefs/illustrations" element={<IllustrationsBrief />} />
            <Route path="/thank-you" element={<ThankYou />} />
            
            {/* Protected routes - require authentication */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
            <Route path="/projects/:projectId" element={<ProtectedRoute><ProjectDetails /></ProtectedRoute>} />
            <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
            <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
            <Route path="/invoices/new" element={<ProtectedRoute><InvoiceForm /></ProtectedRoute>} />
            <Route path="/invoices/:invoiceId" element={<ProtectedRoute><InvoiceDetails /></ProtectedRoute>} />
            <Route path="/briefs" element={<ProtectedRoute><Briefs /></ProtectedRoute>} />
            <Route path="/statistics" element={<ProtectedRoute><Statistics /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        )}
        <Toaster />
      </Router>
    </ThemeProvider>
  );
}

export default App;
