import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType, SignupData } from '../types';
import { authService } from '../api';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for stored user session
    const currentUser = authService.getCurrentUser();
    if (currentUser && authService.isAuthenticated()) {
      setUser(currentUser);
    }

    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && !currentUser) {
        // Firebase user exists but no local user - handle SSO
        console.log('Firebase user detected:', firebaseUser.email);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      setUser(response.user);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: SignupData) => {
    setIsLoading(true);
    try {
      const response = await authService.signup(userData);
      setUser(response.user);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      // Also sign out from Firebase
      await auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Always clear user state even if API call fails
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const googleSignIn = async (googleUserData: any) => {
    setIsLoading(true);
    try {
      // Send Google ID token to backend for verification
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_token: googleUserData.accessToken, // This should be the ID token
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setUser(data.data.user);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        localStorage.setItem('authToken', data.data.token);
        return data.data;
      } else {
        throw new Error(data.message || 'Google authentication failed');
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Google authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
    isLoading,
    googleSignIn,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};