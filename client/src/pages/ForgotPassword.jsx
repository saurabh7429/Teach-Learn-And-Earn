import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api';
import AuthTopBar from '../components/AuthTopBar';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const errorId = 'forgot-error';
  const successId = 'forgot-success';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await forgotPassword({ email: email.trim() });
      setSubmitted(true);
      setSuccessMessage(data.message || 'If an account exists with that email, password reset instructions have been sent.');
    } catch (err) {
      // In case of network failure or server error
      setError(err.response?.data?.message || 'Unable to process your request. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-neo-wrapper page-enter">
      <AuthTopBar />
      <div className="neo-disc-card">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <div className="logo-badge" style={{ fontSize: '1rem', padding: '8px 16px' }}>TL&amp;E</div>
        </div>

        <h1 className="neo-auth-title">Reset Password</h1>
        <p className="neo-auth-subtitle">
          Enter your registered email address to receive password reset instructions.
        </p>

        {submitted ? (
          <div style={{ width: '100%', marginTop: 8 }}>
            <div
              id={successId}
              className="neo-success-badge"
              role="status"
              aria-live="polite"
            >
              <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>📬</div>
              <strong>Instructions Sent!</strong>
              <p style={{ marginTop: 6, fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                {successMessage}
              </p>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20, textAlign: 'center' }}>
              Check your inbox (and spam folder). The reset link will expire in 1 hour.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="button"
                className="btn btn-secondary btn-md"
                onClick={() => {
                  setSubmitted(false);
                  setEmail('');
                  setSuccessMessage('');
                }}
                style={{ width: '100%' }}
              >
                Send Another Request
              </button>

              <Link to="/login" className="neo-btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Back to Sign In 🚀
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            {/* Email Field */}
            <div className="neo-input-group">
              <span className="neo-input-icon">✉️</span>
              <label htmlFor="forgot-email" className="sr-only">Email Address</label>
              <input
                id="forgot-email"
                type="email"
                name="email"
                className="neo-input-field"
                placeholder="Your registered email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? errorId : undefined}
                required
              />
            </div>

            {error && (
              <div id={errorId} className="neo-error-badge" role="alert" aria-live="assertive">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button type="submit" className="neo-btn-primary" disabled={loading}>
              {loading ? 'SENDING INSTRUCTIONS…' : 'SEND RESET LINK 📨'}
            </button>

            {/* Links back */}
            <p className="neo-auth-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link to="/login" className="neo-auth-link" style={{ marginLeft: 0 }}>
                ← Back to Sign In
              </Link>
              <Link to="/signup" className="neo-auth-link">
                Create Account
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
