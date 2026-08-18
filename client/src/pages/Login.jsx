import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      <div className="neo-disc-card">
        <h1 className="neo-auth-title">Login</h1>
        <p className="neo-auth-subtitle">Sign in to your account</p>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          {/* Username / Email Field */}
          <div className="neo-input-group">
            <span className="neo-input-icon">👤</span>
            <input
              type="text"
              name="email"
              className="neo-input-field"
              placeholder="Username or Email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password Field */}
          <div className="neo-input-group neo-input-focus-red">
            <span className="neo-input-icon neo-icon-red">🔒</span>
            <input
              type="password"
              name="password"
              className="neo-input-field"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Remember me & Forgot Password */}
          <div className="neo-auth-row">
            <label className="neo-toggle-wrap">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="neo-toggle-checkbox"
              />
              <span className="neo-toggle-slider" />
              <span className="neo-toggle-label">Remember me</span>
            </label>

            <a
              href="#"
              className="neo-forgot-link"
              onClick={(e) => {
                e.preventDefault();
                alert('Password reset link sent!');
              }}
            >
              Forgot password?
            </a>
          </div>

          {error && <div className="neo-error-badge">{error}</div>}

          {/* Sign In Button */}
          <button type="submit" className="neo-btn-primary" disabled={loading}>
            {loading ? 'SIGNING IN…' : 'SIGN IN'}
          </button>

          {/* Sign up Link */}
          <p className="neo-auth-footer">
            Don&apos;t have an account?{' '}
            <span className="neo-link-red" onClick={() => navigate('/signup')}>
              Sign up
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
