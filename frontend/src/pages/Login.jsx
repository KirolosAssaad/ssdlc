import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Shield, Lock, ArrowRight, Loader } from 'lucide-react';

const Login = () => {
  const { login, handleAuthCallback, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const handleCallback = useCallback(async (code) => {
    const key = `oauth_handled_${code}`;
    try {
      setIsProcessing(true);
      setError('');

      await handleAuthCallback(code);
      // mark handled (in case navigate doesn't prevent a second Strict Mode mount)
      try {
        sessionStorage.setItem(key, '1');
      } catch (_) {
        // sessionStorage might be unavailable in some environments; ignore safely
      }
      navigate('/');
    } catch (error) {
      console.error('Auth callback failed:', error);
      setError('Authentication failed. Please try again.');
      // if processing failed, clear the flag so retry is possible
      try {
        sessionStorage.removeItem(key);
      } catch (_) {}
    } finally {
      setIsProcessing(false);
    }
  }, [handleAuthCallback, navigate]);

  useEffect(() => {
    // If already authenticated, redirect to home
    if (isAuthenticated) {
      navigate('/');
      return;
    }

    // Handle OAuth callback once. In React 18 Strict Mode the effect may run twice
    // during development (mount -> unmount -> mount). Use sessionStorage to
    // mark a code as handled so we don't process it twice.
    const code = searchParams.get('code');
    if (!code) return;

    const key = `oauth_handled_${code}`;
    let handled = false;
    try {
      handled = !!sessionStorage.getItem(key);
    } catch (_) {
      // sessionStorage might be unavailable in some environments; fall back to
      // optimistic processing (we still keep handler idempotent in backend).
      handled = false;
    }

    if (!handled) {
      // mark optimistically so a second Strict Mode mount doesn't re-run the flow
      try {
        sessionStorage.setItem(key, '1');
      } catch (_) {}
      handleCallback(code);
    }
  }, [isAuthenticated, navigate, searchParams, handleCallback]);



  const handleLogin = async () => {
    try {
      setIsProcessing(true);
      setError('');
      await login();
    } catch (error) {
      console.error('Login failed:', error);
      setError('Failed to initiate login. Please try again.');
      setIsProcessing(false);
    }
  };

  if (loading || isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-cream to-brown/10 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 text-brown animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-dark-brown mb-2">
            {isProcessing ? 'Authenticating...' : 'Loading...'}
          </h2>
          <p className="text-dark-brown/70">
            Please wait while we process your request
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-cream to-brown/10">
      <div className="flex min-h-screen">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-dark-brown text-cream p-12 flex-col justify-center">
          <div className="max-w-md">
            <div className="flex items-center space-x-3 mb-8">
              <BookOpen className="h-12 w-12 text-brown" />
              <span className="text-3xl font-bold">BookVault</span>
            </div>
            
            <h1 className="text-4xl font-bold mb-6">
              Secure Digital Reading
            </h1>
            
            <p className="text-cream/80 text-lg mb-8">
              Access your personal library with advanced DRM protection. 
              Your books, your security, your peace of mind.
            </p>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Shield className="h-6 w-6 text-brown" />
                <span>Advanced DRM Protection</span>
              </div>
              <div className="flex items-center space-x-3">
                <Lock className="h-6 w-6 text-brown" />
                <span>Secure Authentication</span>
              </div>
              <div className="flex items-center space-x-3">
                <BookOpen className="h-6 w-6 text-brown" />
                <span>Instant Access to Library</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="max-w-md w-full">
            {/* Mobile Branding */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <BookOpen className="h-10 w-10 text-brown" />
                <span className="text-2xl font-bold text-dark-brown">BookVault</span>
              </div>
              <p className="text-dark-brown/70">
                Secure access to your digital library
              </p>
            </div>

            <div className="card p-8">
              <h2 className="text-2xl font-bold text-dark-brown mb-6 text-center">
                Welcome Back
              </h2>
              
              <p className="text-dark-brown/70 text-center mb-8">
                Sign in to access your secure digital library and continue reading your favorite books.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={isProcessing}
                className="w-full btn-primary flex items-center justify-center space-x-2 text-lg py-4"
              >
                {isProcessing ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <span>Sign In with Auth0</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>

              <div className="mt-6 text-center">
                <p className="text-sm text-dark-brown/60">
                  Secure authentication powered by Auth0
                </p>
              </div>

              {/* Security Features */}
              <div className="mt-8 pt-6 border-t border-brown/10">
                <h3 className="text-sm font-semibold text-dark-brown mb-3">
                  Security Features:
                </h3>
                <div className="space-y-2 text-sm text-dark-brown/70">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-brown" />
                    <span>OAuth2 with PKCE</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Lock className="h-4 w-4 text-brown" />
                    <span>JWT Token Security</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-brown" />
                    <span>DRM Protected Content</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="text-center mt-6">
              <p className="text-sm text-dark-brown/60">
                New to BookVault? Your account will be created automatically upon first sign-in.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;