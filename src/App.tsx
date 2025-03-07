
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
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
  return !!localStorage.getItem("isLoggedIn");
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/auth" />;
};

function App() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Router>
      {isMounted && (
        <Routes>
          <Route path="/" element={isAuthenticated() ? <Navigate to="/dashboard" /> : <Navigate to="/auth" />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
          <Route path="/projects/:projectId" element={<ProtectedRoute><ProjectDetails /></ProtectedRoute>} />
          <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
          <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
          <Route path="/invoices/new" element={<ProtectedRoute><InvoiceForm /></ProtectedRoute>} />
          <Route path="/invoices/:invoiceId" element={<ProtectedRoute><InvoiceDetails /></ProtectedRoute>} />
          <Route path="/briefs" element={<ProtectedRoute><Briefs /></ProtectedRoute>} />
          <Route path="/briefs/ui" element={<ProtectedRoute><UIDesignBrief /></ProtectedRoute>} />
          <Route path="/briefs/graphic" element={<ProtectedRoute><GraphicDesignBrief /></ProtectedRoute>} />
          <Route path="/briefs/illustration" element={<ProtectedRoute><IllustrationsBrief /></ProtectedRoute>} />
          <Route path="/thank-you" element={<ProtectedRoute><ThankYou /></ProtectedRoute>} />
          <Route path="/statistics" element={<ProtectedRoute><Statistics /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      )}
      <Toaster />
    </Router>
  );
}

export default App;
