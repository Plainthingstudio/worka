
import React, { Suspense } from "react";

interface AuthCardSuspenseProps {
  children: React.ReactNode;
}

const LoadingFallback = () => (
  <div className="animate-pulse text-center">
    <div className="h-12 w-12 mx-auto rounded-full bg-primary/10">
      <div className="h-6 w-6 mx-auto rounded-full bg-primary" />
    </div>
    <p className="mt-4 text-muted-foreground">Loading authentication...</p>
  </div>
);

const AuthCardSuspense: React.FC<AuthCardSuspenseProps> = ({ children }) => (
  <Suspense fallback={<LoadingFallback />}>
    {children}
  </Suspense>
);

export default AuthCardSuspense;
