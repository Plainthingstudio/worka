
import React, { lazy, useEffect, useState } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import { useSearchParams } from "react-router-dom";
import AuthLoading from "@/components/auth/AuthLoading";
import AuthRedirecting from "@/components/auth/AuthRedirecting";
import AuthBackButton from "@/components/auth/AuthBackButton";
import AuthFooter from "@/components/auth/AuthFooter";
import AuthCardSuspense from "@/components/auth/AuthCardSuspense";
import InvitationRegistration from "@/components/auth/InvitationRegistration";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Use lazy loading to reduce initial load
const AuthCard = lazy(() => import("@/components/auth/AuthCard"));

interface InvitationData {
  id: string;
  email: string;
  role: "owner" | "administrator" | "team";
  token: string;
  expires_at: string;
  invited_by: string;
}

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

  const [searchParams] = useSearchParams();
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [isValidatingInvitation, setIsValidatingInvitation] = useState(false);

  const invitationToken = searchParams.get('invitation');

  useEffect(() => {
    const validateInvitation = async () => {
      if (!invitationToken) return;

      setIsValidatingInvitation(true);
      try {
        const { data, error } = await supabase
          .from('invitations')
          .select('*')
          .eq('token', invitationToken)
          .is('accepted_at', null)
          .gt('expires_at', new Date().toISOString())
          .single();

        if (error || !data) {
          toast.error("Invalid or expired invitation link");
          return;
        }

        setInvitation(data as InvitationData);
      } catch (error) {
        console.error('Error validating invitation:', error);
        toast.error("Failed to validate invitation");
      } finally {
        setIsValidatingInvitation(false);
      }
    };

    validateInvitation();
  }, [invitationToken]);

  // Render a lightweight loading indicator during initial check
  if (isCheckingAuth || isValidatingInvitation) {
    return <AuthLoading />;
  }

  // If already authenticated but still on this page (unlikely edge case), redirect
  if (isAuthenticated) {
    return <AuthRedirecting />;
  }

  // If there's an invitation token, show the invitation registration form
  if (invitationToken) {
    if (!invitation) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-blue-50 p-6">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-4">Invalid Invitation</h1>
            <p className="text-muted-foreground mb-6">
              This invitation link is invalid or has expired.
            </p>
            <AuthBackButton />
          </div>
        </div>
      );
    }

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-blue-50 p-6">
        <AuthBackButton />
        <InvitationRegistration invitation={invitation} />
        <AuthFooter />
      </div>
    );
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
