import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import GoogleSignInButton from '../../components/GoogleSignInButton/GoogleSignInButton';
import { GoogleAuthService } from '../../services/googleAuth';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Handle redirect result for mobile Google sign-in
    const handleRedirectResult = async () => {
      try {
        const result = await GoogleAuthService.getRedirectResult();
        if (result) {
          const userData = GoogleAuthService.extractUserData(result.user);
          await handleGoogleSuccess({
            ...userData,
            isNewUser: result.isNewUser
          });
        }
      } catch (error) {
        setError('Google sign-in failed. Please try again.');
      }
    };

    handleRedirectResult();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  const handleGoogleSuccess = async (userData: any) => {
    try {
      const { googleSignIn } = useAuth();
      if (googleSignIn) {
        await googleSignIn(userData);
        navigate('/');
      } else {
        throw new Error('Google sign-in not available');
      }
    } catch (err) {
      setError('Failed to sign in with Google. Please try again.');
    }
  };

  const handleGoogleError = (error: string) => {
    setError(error);
  };

  return (
    <div className="container" style={{ maxWidth: '400px' }}>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ 
            color: 'var(--color-dark-brown)',
            marginBottom: '0.5rem'
          }}>
            Welcome Back
          </h1>
          <p style={{ color: '#666' }}>
            Sign in to access your digital library
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              <Mail size={16} style={{ marginRight: '0.5rem' }} />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Lock size={16} style={{ marginRight: '0.5rem' }} />
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="Enter your password"
                style={{ paddingRight: '2.5rem' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message" style={{ marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
            style={{ width: '100%', marginBottom: '1rem' }}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>

          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <Link 
              to="/forgot-password" 
              style={{ 
                color: 'var(--color-medium-brown)',
                textDecoration: 'none',
                fontSize: '0.9rem'
              }}
            >
              Forgot your password?
            </Link>
          </div>

          {/* Divider */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            margin: '1.5rem 0',
            color: '#666'
          }}>
            <div style={{ 
              flex: 1, 
              height: '1px', 
              backgroundColor: '#e0e0e0' 
            }} />
            <span style={{ 
              padding: '0 1rem', 
              fontSize: '0.9rem',
              backgroundColor: 'white'
            }}>
              or
            </span>
            <div style={{ 
              flex: 1, 
              height: '1px', 
              backgroundColor: '#e0e0e0' 
            }} />
          </div>

          {/* Google Sign-In Button */}
          <GoogleSignInButton
            mode="signin"
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            disabled={isLoading}
          />
        </form>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '2rem',
          paddingTop: '1rem',
          borderTop: '1px solid #eee'
        }}>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>
            Don't have an account?{' '}
            <Link 
              to="/signup" 
              style={{ 
                color: 'var(--color-medium-brown)',
                textDecoration: 'none',
                fontWeight: '600'
              }}
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;