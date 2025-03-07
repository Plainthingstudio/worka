
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import AuthCard from "@/components/auth/AuthCard";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Get the path the user was trying to access before being redirected to login
  const from = location.state?.from?.pathname || "/invoices";
  
  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate(from);
      }
    };
    
    checkUser();
    
    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          navigate(from);
        }
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, from]);
  
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast.success("Successfully logged in");
      navigate(from);
    } catch (error: any) {
      toast.error(error.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDummyLogin = async () => {
    setIsLoading(true);
    
    try {
      // For demo purposes, we'll use preset credentials
      const demoEmail = "demo@example.com";
      const demoPassword = "password123";
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      });
      
      if (error) {
        // If the demo account doesn't exist yet, create it
        if (error.message.includes("Invalid login credentials")) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: demoEmail,
            password: demoPassword,
            options: {
              data: {
                full_name: "Demo User",
              },
            },
          });
          
          if (signUpError) {
            throw signUpError;
          }
          
          toast.success("Created and logged in with demo account");
        } else {
          throw error;
        }
      } else {
        toast.success("Successfully logged in with demo account");
      }
      
      navigate(from);
    } catch (error: any) {
      toast.error(error.message || "Failed to login with demo account");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Authentication is handled in the SignupForm component
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-blue-50 p-6 animate-fade-in dark:from-gray-900 dark:to-gray-800">
      <Button
        variant="ghost"
        className="absolute left-4 top-4 flex items-center text-muted-foreground"
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Button>
      
      <AuthCard
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        isLoading={isLoading}
        handleLogin={handleLogin}
        handleDummyLogin={handleDummyLogin}
        handleSignup={handleSignup}
      />
      
      <p className="mt-6 text-center text-sm text-muted-foreground">
        By continuing, you agree to our{" "}
        <a href="#" className="underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
};

export default Auth;
