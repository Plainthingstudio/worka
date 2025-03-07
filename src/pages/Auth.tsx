
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import AuthCard from "@/components/auth/AuthCard";

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("password123");
  
  useEffect(() => {
    // Auto-login functionality for development
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn) {
      navigate("/dashboard");
    }
  }, [navigate]);
  
  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login with credentials
    setTimeout(() => {
      localStorage.setItem("isLoggedIn", "true");
      setIsLoading(false);
      toast.success("Successfully logged in");
      navigate("/dashboard");
    }, 500);
  };
  
  const handleDummyLogin = () => {
    setIsLoading(true);
    
    // Simulate login with dummy credentials
    setTimeout(() => {
      localStorage.setItem("isLoggedIn", "true");
      setIsLoading(false);
      toast.success("Successfully logged in with demo account");
      navigate("/dashboard");
    }, 500);
  };
  
  const handleSignup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate signup
    setTimeout(() => {
      localStorage.setItem("isLoggedIn", "true");
      setIsLoading(false);
      toast.success("Account created successfully");
      navigate("/dashboard");
    }, 500);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-blue-50 p-6 animate-fade-in">
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
