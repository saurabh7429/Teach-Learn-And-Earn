import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', confirm: '' });
  const [agreed, setAgreed] = useState(true);
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
      return setError('Please accept the Terms & Policy.');
    }
    setLoading(true);
    try {
      const { data } = await register({
        name: form.name,
        username: form.username,
        email: form.email,
        password: form.password,
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

          {/* Agreement toggle */}
          <div className="neo-auth-row" style={{ justifyContent: 'flex-start' }}>
            <label className="neo-toggle-wrap">
              <input
                id="signup-terms"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="neo-toggle-checkbox"
              />
              <span className="neo-toggle-label">
                I accept the <a href="#" style={{ color: 'var(--primary)', fontWeight: 600 }}>Terms of Service</a> &amp; Privacy Policy
              </span>
            </label>
          </div>

          {error && <div id={errorId} className="neo-error-badge" role="alert" aria-live="assertive">{error}</div>}

          {/* Submit */}
          <button type="submit" className="neo-btn-primary" disabled={loading}>
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
