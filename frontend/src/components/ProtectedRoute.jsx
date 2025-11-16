import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-cream/30 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 text-brown animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-dark-brown mb-2">
            Loading...
          </h2>
          <p className="text-dark-brown/70">
            Please wait while we verify your authentication
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;