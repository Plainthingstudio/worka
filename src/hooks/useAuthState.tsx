
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useAuthState() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // One-time auth check on mount with reduced timeout
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          setIsAuthenticated(true);
          localStorage.setItem("isLoggedIn", "true");
          navigate("/dashboard", { replace: true });
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem("isLoggedIn");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
        localStorage.removeItem("isLoggedIn");
      } finally {
        // Reduced timeout for faster UI response
        setTimeout(() => {
          setIsCheckingAuth(false);
        }, 100);
      }
    };
    
    checkUser();
    
    // Set up auth state listener with cleanup
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event);
        
        if (event === 'SIGNED_IN' && session) {
          setIsAuthenticated(true);
          localStorage.setItem("isLoggedIn", "true");
          navigate("/dashboard", { replace: true });
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          localStorage.removeItem("isLoggedIn");
        }
      }
    );
    
    return () => {
      // Proper cleanup to avoid memory leaks
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [navigate]);
  
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Set localStorage immediately for faster UI feedback
      localStorage.setItem("isLoggedIn", "true");
      
      // Success is handled by the auth listener
      toast.success("Successfully logged in");
      
      // Navigate immediately for faster response
      navigate("/dashboard", { replace: true });
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
      
      const { error } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      });
      
      if (error) {
        // If the demo account doesn't exist yet, create it
        if (error.message.includes("Invalid login credentials")) {
          const { error: signUpError } = await supabase.auth.signUp({
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
          
          // Set localStorage immediately
          localStorage.setItem("isLoggedIn", "true");
          
          toast.success("Created and logged in with demo account");
          
          // Navigate immediately
          navigate("/dashboard", { replace: true });
          
          // Try to sign in again after creating the account
          const { error: retryError } = await supabase.auth.signInWithPassword({
            email: demoEmail,
            password: demoPassword,
          });
          
          if (retryError) throw retryError;
        } else {
          throw error;
        }
      } else {
        // Set localStorage immediately
        localStorage.setItem("isLoggedIn", "true");
        
        toast.success("Successfully logged in with demo account");
        
        // Navigate immediately
        navigate("/dashboard", { replace: true });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to login with demo account");
      setIsLoading(false); // Only set loading to false on error
    }
  };
  
  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Authentication is handled in the SignupForm component
  };

  return {
    isLoading,
    setIsLoading,
    email,
    setEmail,
    password,
    setPassword,
    isCheckingAuth,
    isAuthenticated,
    handleLogin,
    handleDummyLogin,
    handleSignup
  };
}
