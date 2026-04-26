
import React, { lazy, useEffect, useState } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import { useSearchParams } from "react-router-dom";
import AuthLoading from "@/components/auth/AuthLoading";
import AuthRedirecting from "@/components/auth/AuthRedirecting";
import AuthBackButton from "@/components/auth/AuthBackButton";
import AuthFooter from "@/components/auth/AuthFooter";
import AuthCardSuspense from "@/components/auth/AuthCardSuspense";
import InvitationRegistration from "@/components/auth/InvitationRegistration";
import {
  account,
  appwriteConfigError,
  databases,
  DATABASE_ID,
  isAppwriteConfigured,
  Query,
} from "@/integrations/appwrite/client";
import { toast } from "sonner";
import { parseJsonField } from "@/utils/appwriteJson";

// Use lazy loading to reduce initial load
const AuthCard = lazy(() => import("@/components/auth/AuthCard"));

interface InvitationData {
  id: string;
  email: string;
  role: "owner" | "administrator" | "team";
  token: string;
  expires_at: string;
  invited_by: string;
  metadata?: {
    position?: string;
    message?: string;
  };
}

const Auth = () => {
  const [searchParams] = useSearchParams();
  const invitationToken = searchParams.get('invitation');

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
  } = useAuthState({ redirectOnAuthenticated: !invitationToken });

  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [isValidatingInvitation, setIsValidatingInvitation] = useState(false);

  useEffect(() => {
    const validateInvitation = async () => {
      if (!invitationToken) return;
      if (!isAppwriteConfigured) return;

      setIsValidatingInvitation(true);
      try {
        const invitationQueries = [
          Query.equal('token', invitationToken),
          Query.isNull('accepted_at'),
          Query.greaterThan('expires_at', new Date().toISOString())
        ];

        const fetchInvitation = () =>
          databases.listDocuments(DATABASE_ID, 'invitations', invitationQueries);

        let response;
        try {
          response = await fetchInvitation();
        } catch (error: any) {
          const isPermissionError =
            error?.code === 401 ||
            error?.code === 403 ||
            /missing scope|not authorized|unauthorized/i.test(error?.message || "");

          if (!isPermissionError) {
            throw error;
          }

          await account.createAnonymousSession();
          try {
            response = await fetchInvitation();
          } finally {
            await account.deleteSession("current").catch(() => undefined);
            localStorage.removeItem("isLoggedIn");
          }
        }

        const data = response.documents[0] ?? null;

        if (!data) {
          toast.error("Invalid or expired invitation link");
          return;
        }

        setInvitation({
          id: data.$id,
          email: data.email,
          role: data.role,
          token: data.token,
          expires_at: data.expires_at,
          invited_by: data.invited_by,
          metadata: parseJsonField(data.metadata, {}),
        } as InvitationData);
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
  if (isAuthenticated && !invitationToken) {
    return <AuthRedirecting />;
  }

  const configNotice = !isAppwriteConfigured ? (
    <div className="mx-auto mb-6 w-full max-w-md rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
      {appwriteConfigError}
    </div>
  ) : null;

  // If there's an invitation token, show the invitation registration form
  if (invitationToken) {
    if (!isAppwriteConfigured) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-blue-50 p-6">
          <AuthBackButton />
          {configNotice}
          <AuthFooter />
        </div>
      );
    }

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
      {configNotice}

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
