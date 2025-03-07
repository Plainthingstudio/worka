
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthRedirecting: React.FC = () => {
  const navigate = useNavigate();
  
  // Use effect to immediately redirect
  useEffect(() => {
    navigate("/dashboard", { replace: true });
  }, [navigate]);
  
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse mb-4">
          <div className="h-10 w-10 mx-auto rounded-full bg-primary/10">
            <div className="h-5 w-5 mx-auto rounded-full bg-primary" />
          </div>
        </div>
        <p>Already authenticated. Redirecting...</p>
      </div>
    </div>
  );
};

export default AuthRedirecting;
