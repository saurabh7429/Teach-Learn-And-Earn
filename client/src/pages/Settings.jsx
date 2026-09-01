import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem('tle_theme') || 'dark');
  const [toast, setToast] = useState('');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tle_theme', theme);
  }, [theme]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    showToast(`Theme changed to ${newTheme === 'dark' ? 'Dark' : 'Light'} Mode`);
  };

  return (
    <div className="page-body page-enter">
      <div className="container" style={{ maxWidth: 800 }}>
        {/* Header */}
        <div className="page-header">
          <h1>Settings ⚙️</h1>
          <p>Manage your interface preferences, account details, and security.</p>
        </div>

        {/* ── Section 1: Appearance & Theme ── */}
        <div className="settings-section">
          <div className="settings-section-header">
            <span style={{ fontSize: '1.5rem' }}>🎨</span>
            <h2 className="settings-section-title">Appearance &amp; Theme</h2>
          </div>

          <div className="settings-row">
            <div className="settings-info">
              <div className="settings-label">Interface Theme</div>
              <div className="settings-hint">Select your preferred color scheme for TL&amp;E.</div>
            </div>
            <div className="settings-theme-preview" role="group" aria-label="Theme selection">
              <button
                type="button"
                className={`settings-theme-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => handleThemeChange('dark')}
                aria-pressed={theme === 'dark'}
              >
                <span>🌙</span> Dark
              </button>
              <button
                type="button"
                className={`settings-theme-btn ${theme === 'light' ? 'active' : ''}`}
                onClick={() => handleThemeChange('light')}
                aria-pressed={theme === 'light'}
              >
                <span>☀️</span> Light
              </button>
            </div>
          </div>
        </div>

        {/* ── Section 2: Account Details ── */}
        <div className="settings-section">
          <div className="settings-section-header">
            <span style={{ fontSize: '1.5rem' }}>👤</span>
            <h2 className="settings-section-title">Account Information</h2>
          </div>

          <div className="settings-row">
            <div className="settings-info">
              <div className="settings-label">Full Name</div>
              <div className="settings-hint">{user?.name || 'Not provided'}</div>
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-info">
              <div className="settings-label">Username</div>
              <div className="settings-hint">@{user?.username || 'user'}</div>
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-info">
              <div className="settings-label">Email Address</div>
              <div className="settings-hint">{user?.email || 'Not provided'}</div>
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-info">
              <div className="settings-label">Profile Overview</div>
              <div className="settings-hint">View your learning stats, teaching portfolio, and verified badges.</div>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/profile')}
            >
              View Profile →
            </button>
          </div>
        </div>

        {/* ── Section 3: Security & Recovery ── */}
        <div className="settings-section">
          <div className="settings-section-header">
            <span style={{ fontSize: '1.5rem' }}>🔒</span>
            <h2 className="settings-section-title">Security &amp; Password</h2>
          </div>

          <div className="settings-row">
            <div className="settings-info">
              <div className="settings-label">Password Recovery</div>
              <div className="settings-hint">Need to change or reset your password? You can request a secure reset link.</div>
            </div>
            <Link to="/forgot-password" className="btn btn-secondary btn-sm">
              Reset Password 🔑
            </Link>
          </div>

          <div className="settings-row">
            <div className="settings-info">
              <div className="settings-label">Authentication Token</div>
              <div className="settings-hint">Signed in via secure JWT token stored in browser session storage.</div>
            </div>
            <span className="badge badge-verified">Active Session</span>
          </div>
        </div>

        {/* ── Section 4: Notifications & Preferences ── */}
        <div className="settings-section">
          <div className="settings-section-header">
            <span style={{ fontSize: '1.5rem' }}>🔔</span>
            <h2 className="settings-section-title">Notifications &amp; Alerts</h2>
          </div>

          <div className="settings-row">
            <div className="settings-info">
              <div className="settings-label">In-App Offer Alerts</div>
              <div className="settings-hint">You receive real-time offer badges in the navbar when teachers apply to your learning requests.</div>
            </div>
            <span className="badge badge-verified">Enabled</span>
          </div>

          <div className="settings-row">
            <div className="settings-info">
              <div className="settings-label">Email Digest &amp; Push Notifications</div>
              <div className="settings-hint">Additional notification preferences are coming in future platform updates.</div>
            </div>
            <span className="badge badge-pending">Planned</span>
          </div>
        </div>

        {/* ── Section 5: Legal & Compliance ── */}
        <div className="settings-section">
          <div className="settings-section-header">
            <span style={{ fontSize: '1.5rem' }}>📜</span>
            <h2 className="settings-section-title">Legal &amp; Terms</h2>
          </div>

          <div className="settings-row">
            <div className="settings-info">
              <div className="settings-label">Terms of Service &amp; Privacy Policy</div>
              <div className="settings-hint">Review the platform guidelines and data protection policies.</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/terms" className="btn btn-secondary btn-xs">Terms</Link>
              <Link to="/privacy" className="btn btn-secondary btn-xs">Privacy</Link>
            </div>
          </div>
        </div>

        {/* Toast */}
        {toast && <div className="toast-notification" role="status" aria-live="polite">{toast}</div>}
      </div>
    </div>
  );
}
