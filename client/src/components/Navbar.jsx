import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyRequests } from '../api';

export default function Navbar({ onOpenAI }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('tle_theme') || 'dark');
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tle_theme', theme);
  }, [theme]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Fetch real notification / pending offers count when logged in
  useEffect(() => {
    if (user) {
      getMyRequests()
        .then((res) => {
          const requests = res.data || [];
          const pendingOffers = requests.filter(
            (r) => r.status === 'open' && r.teacherResponses && r.teacherResponses.length > 0
          ).length;
          setUnreadNotifCount(pendingOffers);
        })
        .catch(() => {
          setUnreadNotifCount(0);
        });
    } else {
      setUnreadNotifCount(0);
    }
  }, [user, location.pathname]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Hide Navbar on standalone auth and legal pages (they have their own AuthTopBar)
  if (
    ['/login', '/signup', '/forgot-password', '/terms', '/privacy'].includes(location.pathname) ||
    location.pathname.startsWith('/reset-password')
  ) {
    return null;
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const navItems = [
    { to: '/',         label: 'Home'     },
    { to: '/learn',    label: 'Learn'    },
    { to: '/teach',    label: 'Teach'    },
    ...(user ? [
      { to: '/progress', label: 'Progress' },
      { to: '/requests', label: 'Requests' },
      { to: '/settings', label: 'Settings' },
    ] : []),
  ];

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <NavLink to="/" end className="navbar-logo" aria-label="Go to home page">
          <div className="logo-badge">TL&amp;E</div>
          <span className="logo-text">Teach, Learn &amp; Earn</span>
        </NavLink>

        {/* Desktop Nav links */}
        <div className="navbar-nav desktop-only">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* Right actions */}
        <div className="navbar-actions">
          {/* AI Quick Launcher Button */}
          <button
            className="ai-launcher-btn"
            onClick={onOpenAI}
            title="Ask Teach Devta AI (Groq)"
            aria-label="Open Teach Devta AI"
          >
            🤖
          </button>

          {/* Theme Toggle Button */}
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {user ? (
            <>
              <button 
                className="notif-btn" 
                title={unreadNotifCount > 0 ? `${unreadNotifCount} pending offer${unreadNotifCount > 1 ? 's' : ''}` : 'Notifications'}
                onClick={() => navigate('/requests')}
                aria-label={unreadNotifCount > 0 ? `View notifications (${unreadNotifCount} pending offers)` : 'View notifications'}
              >
                🔔
                {unreadNotifCount > 0 && (
                  <span className="notif-badge">{unreadNotifCount}</span>
                )}
              </button>
              <button
                type="button"
                className="profile-btn"
                onClick={() => navigate('/profile')}
                title="View Profile"
                aria-label="Open profile menu"
              >
                <div className="profile-avatar">{initials}</div>
                <span className="profile-name">{user?.name?.split(' ')[0] ?? 'User'} ▾</span>
              </button>
            </>
          ) : (
            <div className="auth-btn-group">
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/login')}>
                Login
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/signup')}>
                Sign Up
              </button>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-drawer"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer page-enter" id="mobile-nav-drawer">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`}
            >
              {label}
            </NavLink>
          ))}
          <button
            type="button"
            className="mobile-nav-link"
            style={{ textAlign: 'left', background: 'none', border: 'none', width: '100%', cursor: 'pointer', fontFamily: 'inherit' }}
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenAI();
            }}
            aria-label="Open Teach Devta AI"
          >
            🤖 Ask Teach Devta
          </button>
        </div>
      )}
    </nav>
  );
}
