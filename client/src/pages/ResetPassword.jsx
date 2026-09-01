import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { verifyResetToken, resetPassword } from '../api';
import AuthTopBar from '../components/AuthTopBar';

export default function ResetPassword() {
  const { token } = useParams();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const errorId = 'reset-error';

  useEffect(() => {
    let isMounted = true;
    const checkToken = async () => {
      try {
        await verifyResetToken(token);
        if (isMounted) {
          setTokenValid(true);
          setValidating(false);
        }
      } catch (err) {
        if (isMounted) {
          setTokenValid(false);
          setTokenError(
            err.response?.data?.message ||
            'This password reset link is invalid or has expired. Please request a new one.'
          );
          setValidating(false);
        }
      }
    };

    if (token) {
      checkToken();
    } else {
      setTokenValid(false);
      setTokenError('No password reset token provided.');
      setValidating(false);
    }

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, {
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Password reset failed. The link may have expired or already been used.'
      );
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

        <h1 className="neo-auth-title">Set New Password</h1>
        <p className="neo-auth-subtitle">
          Create a strong, secure password for your account.
        </p>

        {validating ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '30px 0', gap: 14 }}>
            <div className="spinner" role="status" aria-label="Verifying reset link" />
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Verifying your reset link…</p>
          </div>
        ) : !tokenValid ? (
          <div style={{ width: '100%', marginTop: 8 }}>
            <div className="neo-error-badge" role="alert" aria-live="assertive">
              <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>⚠️</div>
              <strong>Link Expired or Invalid</strong>
              <p style={{ marginTop: 6, fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                {tokenError}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
              <Link to="/forgot-password" className="neo-btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Request New Reset Link 🔄
              </Link>
              <Link to="/login" className="btn btn-secondary btn-md" style={{ textDecoration: 'none', width: '100%', textAlign: 'center' }}>
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : success ? (
          <div style={{ width: '100%', marginTop: 8 }}>
            <div className="neo-success-badge" role="status" aria-live="polite">
              <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>🎉</div>
              <strong>Password Reset Successful!</strong>
              <p style={{ marginTop: 6, fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                Your password has been securely updated. You can now sign in with your new credentials.
              </p>
            </div>

            <div style={{ marginTop: 20 }}>
              <Link to="/login" className="neo-btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Sign In with New Password 🚀
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            {/* New Password */}
            <div className="neo-input-group">
              <span className="neo-input-icon">🔒</span>
              <label htmlFor="reset-password" className="sr-only">New Password</label>
              <input
                id="reset-password"
                type="password"
                name="password"
                className="neo-input-field"
                placeholder="New Password (min 6 characters)"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                minLength={6}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? errorId : undefined}
                required
              />
            </div>

            {/* Confirm Password */}
            <div className="neo-input-group">
              <span className="neo-input-icon">🛡️</span>
              <label htmlFor="reset-confirm" className="sr-only">Confirm New Password</label>
              <input
                id="reset-confirm"
                type="password"
                name="confirmPassword"
                className="neo-input-field"
                placeholder="Confirm New Password"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                minLength={6}
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
              {loading ? 'UPDATING PASSWORD…' : 'RESET PASSWORD 🔒'}
            </button>

            {/* Link back */}
            <p className="neo-auth-footer" style={{ textAlign: 'center' }}>
              Remember your password?
              <Link to="/login" className="neo-auth-link">
                Sign In
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
