import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api';
import { useAuth } from '../context/AuthContext';
import AuthTopBar from '../components/AuthTopBar';

// Must match CURRENT_CONSENT_VERSION in server/routes/auth.js
const CONSENT_VERSION = '1.0';

export default function Signup() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', confirm: '' });
  const [agreed, setAgreed] = useState(false); // Must default to false — user must explicitly consent
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const errorId = 'signup-error';

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      return setError('Passwords do not match.');
    }

    if (!agreed) {
      return setError('Please accept the Terms of Service and Privacy Policy to continue.');
    }

    setLoading(true);
    try {
      const { data } = await register({
        name: form.name,
        username: form.username,
        email: form.email,
        password: form.password,
        // Server-side consent enforcement fields
        consentGiven: true,
        consentVersion: CONSENT_VERSION,
      });
      loginUser(data, data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-neo-wrapper page-enter">
      <AuthTopBar />
      <div className="neo-disc-card neo-disc-lg">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <div className="logo-badge" style={{ fontSize: '1rem', padding: '8px 16px' }}>TL&amp;E</div>
        </div>

        <h1 className="neo-auth-title">Create Account</h1>
        <p className="neo-auth-subtitle">Join the peer-to-peer skill exchange platform</p>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          {/* Name */}
          <div className="neo-input-group">
            <span className="neo-input-icon">👤</span>
            <label htmlFor="signup-name" className="sr-only">Full name</label>
            <input
              id="signup-name"
              type="text"
              name="name"
              className="neo-input-field"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId : undefined}
              required
            />
          </div>

          {/* Username */}
          <div className="neo-input-group">
            <span className="neo-input-icon">🆔</span>
            <label htmlFor="signup-username" className="sr-only">Username</label>
            <input
              id="signup-username"
              type="text"
              name="username"
              className="neo-input-field"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId : undefined}
              required
            />
          </div>

          {/* Email */}
          <div className="neo-input-group">
            <span className="neo-input-icon">✉️</span>
            <label htmlFor="signup-email" className="sr-only">Email address</label>
            <input
              id="signup-email"
              type="email"
              name="email"
              className="neo-input-field"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId : undefined}
              required
            />
          </div>

          {/* Password */}
          <div className="neo-input-group">
            <span className="neo-input-icon">🔒</span>
            <label htmlFor="signup-password" className="sr-only">Password</label>
            <input
              id="signup-password"
              type="password"
              name="password"
              className="neo-input-field"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId : undefined}
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="neo-input-group">
            <span className="neo-input-icon">🛡️</span>
            <label htmlFor="signup-confirm-password" className="sr-only">Confirm password</label>
            <input
              id="signup-confirm-password"
              type="password"
              name="confirm"
              className="neo-input-field"
              placeholder="Confirm Password"
              value={form.confirm}
              onChange={handleChange}
              autoComplete="new-password"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId : undefined}
              required
            />
          </div>

          {/* Consent checkbox — MUST default unchecked, user must explicitly consent */}
          <div className="neo-auth-row" style={{ justifyContent: 'flex-start' }}>
            <label className="neo-toggle-wrap" htmlFor="signup-terms">
              <input
                id="signup-terms"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="neo-toggle-checkbox"
                aria-required="true"
                aria-describedby={error ? errorId : undefined}
              />
              <span className="neo-toggle-label">
                I accept the{' '}
                {/* Opens in new tab to preserve form state without any global state library */}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--primary)', fontWeight: 600 }}
                  aria-label="Terms of Service (opens in a new tab)"
                >
                  Terms of Service
                </a>
                {' '}&amp;{' '}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--primary)', fontWeight: 600 }}
                  aria-label="Privacy Policy (opens in a new tab)"
                >
                  Privacy Policy
                </a>
              </span>
            </label>
          </div>

          {error && <div id={errorId} className="neo-error-badge" role="alert" aria-live="assertive">{error}</div>}

          {/* Submit */}
          <button type="submit" className="neo-btn-primary" disabled={loading || !agreed}>
            {loading ? 'CREATING ACCOUNT…' : 'START LEARNING & TEACHING 🚀'}
          </button>

          {/* Sign In Link */}
          <p className="neo-auth-footer">
            Already have an account?
            <Link to="/login" className="neo-auth-link">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
