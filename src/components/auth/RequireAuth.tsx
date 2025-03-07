
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface RequireAuthProps {
  children: React.ReactNode;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // If we're still checking the auth state, show a loading indicator
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // If the user is not authenticated, redirect to the login page
  if (!user) {
    // Save the location they were trying to go to for a redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If they are authenticated, show the protected content
  return <>{children}</>;
};

export default RequireAuth;
