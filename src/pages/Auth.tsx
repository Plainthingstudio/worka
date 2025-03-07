
import React, { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Use lazy loading to reduce initial load
const AuthCard = lazy(() => import("@/components/auth/AuthCard"));

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // More efficient auth check
    const checkUser = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth check error:", error);
          setIsAuthenticated(false);
        } else if (data.session) {
          setIsAuthenticated(true);
          // Only navigate if we confirmed the user is authenticated
          setTimeout(() => navigate("/dashboard"), 100);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
      } finally {
        // Always complete the auth check
        setIsCheckingAuth(false);
      }
    };
    
    checkUser();
    
    // Set up auth state listener with cleanup
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event);
        
        if (event === 'SIGNED_IN' && session) {
          setIsAuthenticated(true);
          navigate("/dashboard");
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          // Stay on auth page after sign out
        }
      }
    );
    
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [navigate]);
  
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      localStorage.setItem("isLoggedIn", "true");
      toast.success("Successfully logged in");
      // Navigation will be handled by the auth state change listener
    } catch (error: any) {
      toast.error(error.message || "Failed to login");
      setIsLoading(false); // Only set loading to false on error
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
      
      localStorage.setItem("isLoggedIn", "true");
      // Navigation will be handled by the auth state change listener
    } catch (error: any) {
      toast.error(error.message || "Failed to login with demo account");
      setIsLoading(false); // Only set loading to false on error
    }
  };
  
  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Authentication is handled in the SignupForm component
  };

  // Render a lightweight loading indicator during initial check
  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-12 w-12 mx-auto rounded-full bg-primary/10">
            <div className="h-6 w-6 mx-auto rounded-full bg-primary" />
          </div>
          <p className="mt-4 text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If authenticated but still on this page (edge case), redirect
  if (isAuthenticated) {
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-blue-50 p-6">
      <Button
        variant="ghost"
        className="absolute left-4 top-4 flex items-center text-muted-foreground"
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Button>
      
      <Suspense fallback={
        <div className="animate-pulse text-center">
          <div className="h-12 w-12 mx-auto rounded-full bg-primary/10">
            <div className="h-6 w-6 mx-auto rounded-full bg-primary" />
          </div>
          <p className="mt-4 text-muted-foreground">Loading authentication...</p>
        </div>
      }>
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
      </Suspense>
      
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
