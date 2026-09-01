import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api';
import { useAuth } from '../context/AuthContext';
import AuthTopBar from '../components/AuthTopBar';

export default function Login() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const errorId = 'login-error';

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await login(form);
      loginUser(data, data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
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

        <h1 className="neo-auth-title">Welcome Back</h1>
        <p className="neo-auth-subtitle">Sign in to your learning &amp; teaching workspace</p>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          {/* Username / Email Field */}
          <div className="neo-input-group">
            <span className="neo-input-icon">👤</span>
            <label htmlFor="login-email" className="sr-only">Username or Email</label>
            <input
              id="login-email"
              type="text"
              name="email"
              className="neo-input-field"
              placeholder="Username or Email"
              value={form.email}
              onChange={handleChange}
              autoComplete="username"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId : undefined}
              required
            />
          </div>

          {/* Password Field */}
          <div className="neo-input-group">
            <span className="neo-input-icon">🔒</span>
            <label htmlFor="login-password" className="sr-only">Password</label>
            <input
              id="login-password"
              type="password"
              name="password"
              className="neo-input-field"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId : undefined}
              required
            />
          </div>

          {/* Remember me & Forgot Password */}
          <div className="neo-auth-row">
            <label className="neo-toggle-wrap">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="neo-toggle-checkbox"
              />
              <span className="neo-toggle-label">Remember me</span>
            </label>

            <Link to="/forgot-password" className="neo-forgot-link">
              Forgot password?
            </Link>
          </div>

          {error && <div id={errorId} className="neo-error-badge" role="alert" aria-live="assertive">{error}</div>}

          {/* Sign In Button */}
          <button type="submit" className="neo-btn-primary" disabled={loading}>
            {loading ? 'SIGNING IN…' : 'SIGN IN 🚀'}
          </button>

          {/* Sign up Link */}
          <p className="neo-auth-footer">
            Don&apos;t have an account?
            <Link to="/signup" className="neo-auth-link">
              Create Account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
