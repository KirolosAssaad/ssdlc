import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    
    try {
      const { authService } = await import('../../api');
      await authService.forgotPassword({ email });
      setIsSubmitted(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="container" style={{ maxWidth: '400px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <CheckCircle 
            size={64} 
            color="var(--color-medium-brown)" 
            style={{ marginBottom: '1rem' }}
          />
          
          <h1 style={{ 
            color: 'var(--color-dark-brown)',
            marginBottom: '1rem'
          }}>
            Check Your Email
          </h1>
          
          <p style={{ 
            color: '#666',
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}>
            We've sent a password reset link to <strong>{email}</strong>. 
            Please check your inbox and follow the instructions to reset your password.
          </p>
          
          <div style={{ marginBottom: '1rem' }}>
            <button
              onClick={() => {
                setIsSubmitted(false);
                setEmail('');
              }}
              className="btn btn-secondary"
              style={{ marginRight: '1rem' }}
            >
              Try Another Email
            </button>
          </div>
          
          <Link 
            to="/login" 
            style={{ 
              color: 'var(--color-medium-brown)',
              textDecoration: 'none',
              fontSize: '0.9rem'
            }}
          >
            <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} />
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '400px' }}>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ 
            color: 'var(--color-dark-brown)',
            marginBottom: '0.5rem'
          }}>
            Forgot Password?
          </h1>
          <p style={{ color: '#666' }}>
            No worries! Enter your email address and we'll send you a link to reset your password.
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
              placeholder="Enter your email address"
              required
            />
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
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <Link 
            to="/login" 
            style={{ 
              color: 'var(--color-medium-brown)',
              textDecoration: 'none',
              fontSize: '0.9rem'
            }}
          >
            <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;