
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  account,
  appwriteConfigError,
  client,
  isAppwriteConfigured,
} from "@/integrations/appwrite/client";
import { AppwriteException } from "appwrite";
import { isDemoLoginEnabled } from "@/config/runtime";

interface UseAuthStateOptions {
  redirectOnAuthenticated?: boolean;
}

export function useAuthState(options: UseAuthStateOptions = {}) {
  const { redirectOnAuthenticated = true } = options;
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      if (!isAppwriteConfigured) {
        setIsAuthenticated(false);
        localStorage.removeItem("isLoggedIn");
        setIsCheckingAuth(false);
        return;
      }

      try {
        await account.getSession("current");
        setIsAuthenticated(true);
        localStorage.setItem("isLoggedIn", "true");
        if (redirectOnAuthenticated) {
          navigate("/dashboard", { replace: true });
        }
      } catch {
        setIsAuthenticated(false);
        localStorage.removeItem("isLoggedIn");
      } finally {
        setTimeout(() => setIsCheckingAuth(false), 100);
      }
    };

    checkUser();

    if (!isAppwriteConfigured) {
      return;
    }

    // Subscribe to auth events via Appwrite realtime
    const unsubscribe = client.subscribe("account", (response) => {
      const events = response.events as string[];
      if (events.some((e) => e.includes("sessions.create"))) {
        setIsAuthenticated(true);
        localStorage.setItem("isLoggedIn", "true");
        if (redirectOnAuthenticated) {
          navigate("/dashboard", { replace: true });
        }
      } else if (events.some((e) => e.includes("sessions.delete"))) {
        setIsAuthenticated(false);
        localStorage.removeItem("isLoggedIn");
      }
    });

    return () => unsubscribe();
  }, [navigate, redirectOnAuthenticated]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isAppwriteConfigured) {
      toast.error(appwriteConfigError);
      return;
    }

    setIsLoading(true);
    let isSuccessful = false;

    try {
      await account.createEmailPasswordSession(email, password);
      localStorage.setItem("isLoggedIn", "true");
      toast.success("Successfully logged in");
      navigate("/dashboard", { replace: true });
      isSuccessful = true;
    } catch (error: any) {
      toast.error(error instanceof AppwriteException ? error.message : "Failed to login");
    } finally {
      if (!isSuccessful) {
        setIsLoading(false);
      }
    }
  };

  const handleDummyLogin = async () => {
    if (!isDemoLoginEnabled) {
      toast.error("Demo login is disabled in this environment");
      return;
    }

    if (!isAppwriteConfigured) {
      toast.error(appwriteConfigError);
      return;
    }

    setIsLoading(true);
    const demoEmail = "demo@example.com";
    const demoPassword = "password123";
    let isSuccessful = false;

    try {
      await account.createEmailPasswordSession(demoEmail, demoPassword);
      localStorage.setItem("isLoggedIn", "true");
      toast.success("Successfully logged in with demo account");
      navigate("/dashboard", { replace: true });
      isSuccessful = true;
    } catch (error: any) {
      if (error instanceof AppwriteException && error.type === "user_invalid_credentials") {
        // Demo account doesn't exist — create it
        try {
          await account.create("unique()", demoEmail, demoPassword, "Demo User");
          await account.createEmailPasswordSession(demoEmail, demoPassword);
          localStorage.setItem("isLoggedIn", "true");
          toast.success("Created and logged in with demo account");
          navigate("/dashboard", { replace: true });
          isSuccessful = true;
        } catch (signupError: any) {
          toast.error(signupError.message || "Failed to create demo account");
        }
      } else {
        toast.error(error.message || "Failed to login with demo account");
      }
    } finally {
      if (!isSuccessful) {
        setIsLoading(false);
      }
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
    handleSignup,
  };
}
