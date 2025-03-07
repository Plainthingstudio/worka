
import React from "react";

const AuthFooter: React.FC = () => (
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
);

export default AuthFooter;
