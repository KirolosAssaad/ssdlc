import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const userData = localStorage.getItem('user_data');
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        
        // Verify token is still valid
        try {
          await authAPI.getCurrentUser();
        } catch (error) {
          // Token invalid, clear auth state
          logout();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    try {
      setLoading(true);
      const response = await authAPI.initiateAuth();
      // Redirect to Auth0 login
      window.location.href = response.data.auth_url;
    } catch (error) {
      console.error('Login initiation failed:', error);
      setLoading(false);
      throw error;
    }
  };

  const handleAuthCallback = async (code) => {
    try {
      setLoading(true);
      const response = await authAPI.handleCallback(code);
      const userData = response.data;
      
      // Store tokens and user data
      localStorage.setItem('access_token', userData.access_token);
      localStorage.setItem('refresh_token', userData.refresh_token);
      localStorage.setItem('user_data', JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
      
      return userData;
    } catch (error) {
      console.error('Auth callback failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshUserData = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      const updatedUser = { ...user, ...response.data };
      
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return updatedUser;
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      throw error;
    }
  };

  const hasRole = (roleName) => {
    if (!user || !user.roles) return false;
    return user.roles.some(role => role.name === roleName);
  };

  const isAdmin = () => hasRole('admin') || hasRole('sudo_admin');
  const isSudoAdmin = () => hasRole('sudo_admin');

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    handleAuthCallback,
    refreshUserData,
    hasRole,
    isAdmin,
    isSudoAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};