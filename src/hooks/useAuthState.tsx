
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

export function useAuthState() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  
  useEffect(() => {
    let mounted = true;

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        
        if (!mounted) return;

        if (event === 'SIGNED_IN' && session) {
          setSession(session);
          setIsAuthenticated(true);
          localStorage.setItem("isLoggedIn", "true");
          
          // Only navigate if not already on dashboard
          const currentPath = window.location.pathname;
          if (currentPath === '/auth' || currentPath === '/login') {
            navigate("/dashboard", { replace: true });
          }
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setIsAuthenticated(false);
          localStorage.removeItem("isLoggedIn");
          navigate("/auth", { replace: true });
        }
        
        if (mounted) {
          setIsCheckingAuth(false);
        }
      }
    );

    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          if (mounted) {
            setIsAuthenticated(false);
            setSession(null);
            localStorage.removeItem("isLoggedIn");
            setIsCheckingAuth(false);
          }
          return;
        }

        if (mounted) {
          if (session) {
            setSession(session);
            setIsAuthenticated(true);
            localStorage.setItem("isLoggedIn", "true");
            
            // Navigate to dashboard if on auth page
            const currentPath = window.location.pathname;
            if (currentPath === '/auth' || currentPath === '/login') {
              navigate("/dashboard", { replace: true });
            }
          } else {
            setSession(null);
            setIsAuthenticated(false);
            localStorage.removeItem("isLoggedIn");
          }
          setIsCheckingAuth(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        if (mounted) {
          setIsAuthenticated(false);
          setSession(null);
          localStorage.removeItem("isLoggedIn");
          setIsCheckingAuth(false);
        }
      }
    };

    checkSession();
    
    return () => {
      mounted = false;
      subscription.unsubscribe();
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
      
      if (data.user) {
        toast.success("Successfully logged in");
        // Navigation will be handled by onAuthStateChange
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDummyLogin = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "demo@example.com",
        password: "password123",
      });
      
      if (error) throw error;
      
      if (data.user) {
        toast.success("Successfully logged in with demo account");
        // Navigation will be handled by onAuthStateChange
      }
    } catch (error: any) {
      console.error("Demo login error:", error);
      toast.error(error.message || "Failed to login with demo account");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        toast.success("Check your email for the confirmation link");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Failed to sign up");
    } finally {
      setIsLoading(false);
    }
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
    session,
    handleLogin,
    handleDummyLogin,
    handleSignup
  };
}
