import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', confirm: '' });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
        <h1 className="neo-auth-title">Sign Up</h1>
        <p className="neo-auth-subtitle">Create your new account</p>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          {/* Name */}
          <div className="neo-input-group">
            <span className="neo-input-icon">👤</span>
            <input
              type="text"
              name="name"
              className="neo-input-field"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Username */}
          <div className="neo-input-group">
            <span className="neo-input-icon">🆔</span>
            <input
              type="text"
              name="username"
              className="neo-input-field"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div className="neo-input-group">
            <span className="neo-input-icon">✉️</span>
            <input
              type="email"
              name="email"
              className="neo-input-field"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
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

          {/* Confirm Password */}
          <div className="neo-input-group">
            <span className="neo-input-icon">🔑</span>
            <input
              type="password"
              name="confirm"
              className="neo-input-field"
              placeholder="Confirm Password"
              value={form.confirm}
              onChange={handleChange}
              required
            />
          </div>

          {/* Terms Checkbox */}
          <div className="neo-auth-row" style={{ justifyContent: 'center', margin: '14px 0' }}>
            <label className="neo-toggle-wrap">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="neo-toggle-checkbox"
              />
              <span className="neo-toggle-slider" />
              <span className="neo-toggle-label">I agree to Terms &amp; Privacy</span>
            </label>
          </div>

          {error && <div className="neo-error-badge">{error}</div>}

          {/* Submit Button */}
          <button type="submit" className="neo-btn-primary" disabled={loading}>
            {loading ? 'REGISTERING…' : 'SIGN UP'}
          </button>

          {/* Login Footer */}
          <p className="neo-auth-footer">
            Already have an account?{' '}
            <span className="neo-link-red" onClick={() => navigate('/login')}>
              Log in
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
