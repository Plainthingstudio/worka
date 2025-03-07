
import React from "react";

const AuthLoading: React.FC = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="animate-pulse text-center">
      <div className="h-12 w-12 mx-auto rounded-full bg-primary/10">
        <div className="h-6 w-6 mx-auto rounded-full bg-primary" />
      </div>
      <p className="mt-4 text-muted-foreground">Verifying authentication...</p>
    </div>
  </div>
);

export default AuthLoading;
