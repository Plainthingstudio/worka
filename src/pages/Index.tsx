
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-blue-50 p-8 text-center animate-fade-in">
      <div className="max-w-md space-y-4">
        <div className="mx-auto mb-8 h-20 w-20 rounded-xl bg-primary"></div>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Studio Management Platform
        </h1>
        <p className="text-lg text-gray-600">
          Seamlessly manage your clients, projects, and payments with our minimalist and intuitive interface.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button 
            onClick={() => navigate("/auth")}
            variant="default" 
            size="lg" 
            className="rounded-full px-8"
          >
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button 
            onClick={() => navigate("/dashboard")}
            variant="outline" 
            size="lg" 
            className="rounded-full px-8"
          >
            Explore Dashboard
          </Button>
        </div>
      </div>
      
      <div className="mt-24 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
        <div className="glass-card rounded-xl p-6">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 8C17 10.7614 14.7614 13 12 13C9.23858 13 7 10.7614 7 8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8Z" stroke="currentColor" strokeWidth="2" />
              <path d="M3 21C3 17.134 7.02944 14 12 14C16.9706 14 21 17.134 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h3 className="text-lg font-medium">Client Management</h3>
          <p className="mt-2 text-sm text-gray-600">
            Track client details and manage relationships in one place.
          </p>
        </div>
        
        <div className="glass-card rounded-xl p-6">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3 className="text-lg font-medium">Project Tracking</h3>
          <p className="mt-2 text-sm text-gray-600">
            Monitor project status, deadlines, and details effortlessly.
          </p>
        </div>
        
        <div className="glass-card rounded-xl p-6">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" stroke="currentColor" strokeWidth="2" />
              <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h3 className="text-lg font-medium">Payment Management</h3>
          <p className="mt-2 text-sm text-gray-600">
            Track payments, record transactions, and manage financials.
          </p>
        </div>
      </div>
      
      <div className="mt-16 text-sm text-gray-500">
        Studio Management Platform © {new Date().getFullYear()}
      </div>
    </div>
  );
};

export default Index;
