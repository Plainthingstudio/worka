
import React, { lazy } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import AuthLoading from "@/components/auth/AuthLoading";
import AuthRedirecting from "@/components/auth/AuthRedirecting";
import AuthBackButton from "@/components/auth/AuthBackButton";
import AuthFooter from "@/components/auth/AuthFooter";
import AuthCardSuspense from "@/components/auth/AuthCardSuspense";

// Use lazy loading to reduce initial load
const AuthCard = lazy(() => import("@/components/auth/AuthCard"));

const Auth = () => {
  const {
    isLoading,
    email,
    setEmail,
    password, 
    setPassword,
    isCheckingAuth,
    isAuthenticated,
    handleLogin,
    handleDummyLogin,
    handleSignup
  } = useAuthState();

  // Render a lightweight loading indicator during initial check
  if (isCheckingAuth) {
    return <AuthLoading />;
  }

  // If already authenticated but still on this page (unlikely edge case), redirect
  if (isAuthenticated) {
    return <AuthRedirecting />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-blue-50 p-6">
      <AuthBackButton />
      
      <AuthCardSuspense>
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
      </AuthCardSuspense>
      
      <AuthFooter />
    </div>
  );
};

export default Auth;
