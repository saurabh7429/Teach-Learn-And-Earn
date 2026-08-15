import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', confirm: '' });
  const [showPw,    setShowPw]    = useState(false);
  const [showConfPw,setShowConfPw]= useState(false);
  const [agreed,    setAgreed]    = useState(false);
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm)
      return setError('Passwords do not match.');
    if (!agreed)
      return setError('Please agree to the Terms & Privacy Policy.');
    setLoading(true);
    try {
      const { data } = await register({
        name: form.name, username: form.username, email: form.email, password: form.password,
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
    <div className="auth-layout">
      {/* ── LEFT: Branding ── */}
      <div className="auth-left">
        <div className="auth-logo-wrap">
          <div className="auth-logo-badge">TL&amp;E</div>
          <span className="auth-logo-text">Teach, Learn &amp; Earn</span>
        </div>
        <h1 className="auth-heading">
          Start Your<br />
          <span className="gradient-text">Learning Journey.</span>
        </h1>
        <p className="auth-tagline">
          Join thousands of people learning new skills and sharing their knowledge every day.
        </p>
        <div className="auth-features">
          {[
            { icon: '📚', title: 'Learn New Skills',      desc: 'Find teachers for exactly what you want to learn.' },
            { icon: '🎓', title: 'Share Your Knowledge',  desc: 'Get verified and start teaching others.' },
            { icon: '🚀', title: 'Grow Together',         desc: 'One account — learn and teach simultaneously.' },
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
          {[{ icon: '👤', label: 'You' }, { icon: '💡', label: 'Skill' }, { icon: '👥', label: 'Community' }].map((n, i, arr) => (
            <span key={n.label} style={{ display: 'contents' }}>
              <div className="flow-node">
                <div className="flow-icon">{n.icon}</div>
                <span className="flow-label">{n.label}</span>
              </div>
              {i < arr.length - 1 && <span className="flow-arrow">⇄</span>}
            </span>
          ))}
        </div>
      </div>

      {/* ── RIGHT: Signup Form ── */}
      <div className="auth-right">
        <div className="auth-form-container">
          <h2 className="auth-form-title">Create your account 🚀</h2>
          <p className="auth-form-subtitle">Start your journey to learn, teach and grow.</p>

          <form onSubmit={handleSubmit}>
            {[
              { id: 'name',     label: 'Full Name', type: 'text',  placeholder: 'Enter your full name' },
              { id: 'username', label: 'Username',  type: 'text',  placeholder: 'Choose a username' },
              { id: 'email',    label: 'Email',     type: 'email', placeholder: 'Enter your email' },
            ].map(({ id, label, type, placeholder }) => (
              <div className="form-group" key={id}>
                <label className="form-label" htmlFor={id}>{label}</label>
                <input
                  className="form-input" id={id} name={id} type={type}
                  placeholder={placeholder} value={form[id]}
                  onChange={handleChange} required
                />
              </div>
            ))}

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input className="form-input" id="password" name="password"
                  type={showPw ? 'text' : 'password'} placeholder="Create a password"
                  value={form.password} onChange={handleChange} required />
                <button type="button" className="input-eye" onClick={() => setShowPw((v) => !v)}>
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirm">Confirm Password</label>
              <div className="input-wrapper">
                <input className="form-input" id="confirm" name="confirm"
                  type={showConfPw ? 'text' : 'password'} placeholder="Confirm your password"
                  value={form.confirm} onChange={handleChange} required />
                <button type="button" className="input-eye" onClick={() => setShowConfPw((v) => !v)}>
                  {showConfPw ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <div className="checkbox-group">
              <input type="checkbox" id="agree" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              <label htmlFor="agree">
                I agree to the <a href="#" style={{ color: 'var(--primary-light)' }}>Terms of Service</a>{' '}
                &amp; <a href="#" style={{ color: 'var(--primary-light)' }}>Privacy Policy</a>
              </label>
            </div>

            {error && <p className="form-error" style={{ marginBottom: 12 }}>{error}</p>}

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? 'Creating Account…' : 'Create Account'}
            </button>

            <p className="auth-switch" style={{ marginTop: 16 }}>
              Already have an account?{' '}
              <a onClick={() => navigate('/login')}>Login</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
