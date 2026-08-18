import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('tle_theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tle_theme', theme);
  }, [theme]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Hide Navbar on standalone auth pages
  if (['/login', '/signup'].includes(location.pathname)) {
    return null;
  }

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

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
    ] : []),
  ];

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <div className="navbar-logo" onClick={() => navigate('/')}>
          <div className="logo-badge">TL&amp;E</div>
          <span className="logo-text">Teach, Learn &amp; Earn</span>
        </div>

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
              <button className="notif-btn" title="Notifications">
                🔔
                <span className="notif-badge">3</span>
              </button>
              <div className="profile-btn" onClick={handleLogout} title="Click to logout">
                <div className="profile-avatar">{initials}</div>
                <span className="profile-name">{user?.name?.split(' ')[0] ?? 'User'} ▾</span>
              </div>
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
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer page-enter">
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
        </div>
      )}
    </nav>
  );
}
