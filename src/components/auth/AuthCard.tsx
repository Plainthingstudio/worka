import React, { memo } from "react";
import LoginForm from "./LoginForm";
import DemoLogin from "./DemoLogin";
import { isDemoLoginEnabled } from "@/config/runtime";

interface AuthCardProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  isLoading: boolean;
  handleLogin: (e: React.FormEvent<HTMLFormElement>) => void;
  handleDummyLogin: () => void;
  handleSignup: (e: React.FormEvent<HTMLFormElement>) => void;
}

// Use memo to prevent unnecessary re-renders
const AuthCard = memo(({
  email,
  setEmail,
  password,
  setPassword,
  isLoading,
  handleLogin,
  handleDummyLogin,
  handleSignup: _handleSignup,
}: AuthCardProps) => {
  return (
    <div className="glass-card mx-auto w-full max-w-md overflow-hidden rounded-xl border border-border shadow-sm">
      <div className="p-8">
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <div className="h-6 w-6 rounded-full bg-primary" />
        </div>
        <h1 className="text-center text-xl font-semibold tracking-tight">
          Welcome to Worka
        </h1>
        <p className="mt-1.5 text-center text-sm text-muted-foreground">
          Manage your clients and projects easily
        </p>
        {isDemoLoginEnabled && (
          <DemoLogin isLoading={isLoading} onDemoLogin={handleDummyLogin} />
        )}
        
        <div className="mt-4">
          <LoginForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            isLoading={isLoading}
            onSubmit={handleLogin}
          />
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-medium text-sm mb-2">Need to join a team?</h3>
          <p className="text-xs text-muted-foreground">
            Registration is by invitation only. If you've been invited to join a team, 
            please use the invitation link provided to you.
          </p>
        </div>

        {isDemoLoginEnabled && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Demo credentials:</p>
            <p>Email: demo@example.com</p>
            <p>Password: password123</p>
          </div>
        )}
      </div>
    </div>
  );
});

AuthCard.displayName = "AuthCard";

export default AuthCard;
