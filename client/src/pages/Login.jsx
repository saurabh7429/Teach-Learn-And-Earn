import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [showPw,  setShowPw]  = useState(false);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await login(form);
      loginUser(data, data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* ── LEFT: Branding ── */}
      <div className="auth-left">
        <div className="auth-logo-wrap">
          <div className="auth-logo-badge">TL&amp;E</div>
          <span className="auth-logo-text">Teach, Learn &amp; Earn</span>
        </div>
        <h1 className="auth-heading">
          Learn what you love.<br />
          <span className="gradient-text">Teach what you know.</span>
        </h1>
        <p className="auth-tagline">
          A peer-to-peer skill exchange platform where anyone can learn and teach simultaneously.
        </p>
        <div className="auth-features">
          {[
            { icon: '📚', title: 'Learn from Real People',  desc: 'Connect with verified teachers with real-world skills.' },
            { icon: '🎓', title: 'Share Your Knowledge',    desc: 'Become a teacher. Help others grow with your expertise.' },
            { icon: '🚀', title: 'Grow Together',           desc: 'Build skills, earn recognition and grow your career.' },
          ].map((f) => (
            <div className="auth-feature" key={f.title}>
              <div className="auth-feature-icon">{f.icon}</div>
              <div className="auth-feature-text">
                <strong>{f.title}</strong>
                {f.desc}
              </div>
            </div>
          ))}
        </div>
        <div className="skill-flow">
          {[{ icon: '👨‍🎓', label: 'Learn' }, { icon: '💡', label: 'Skill' }, { icon: '🎓', label: 'Teach' }, { icon: '🚀', label: 'Grow' }].map((n, i, arr) => (
            <span key={n.label} style={{ display: 'contents' }}>
              <div className="flow-node">
                <div className="flow-icon">{n.icon}</div>
                <span className="flow-label">{n.label}</span>
              </div>
              {i < arr.length - 1 && <span className="flow-arrow">→</span>}
            </span>
          ))}
        </div>
      </div>

      {/* ── RIGHT: Form ── */}
      <div className="auth-right">
        <div className="auth-form-container">
          <h2 className="auth-form-title">Welcome Back 👋</h2>
          <p className="auth-form-subtitle">Login to continue your learning journey.</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                className="form-input" id="email" name="email" type="email"
                placeholder="Enter your email" value={form.email}
                onChange={handleChange} required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
                <a className="forgot-link" onClick={() => alert('Password reset coming soon!')}>Forgot password?</a>
              </label>
              <div className="input-wrapper">
                <input
                  className="form-input" id="password" name="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password} onChange={handleChange} required
                />
                <button type="button" className="input-eye" onClick={() => setShowPw((v) => !v)}>
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? 'Logging in…' : 'Login'}
            </button>

            <div className="divider">OR</div>
            <p className="auth-switch">
              Don&apos;t have an account?{' '}
              <a onClick={() => navigate('/signup')}>Create Account</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
