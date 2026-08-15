import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <div className="navbar-logo" onClick={() => navigate('/')}>
          <div className="logo-badge">TL&amp;E</div>
          <span className="logo-text">Teach, Learn &amp; Earn</span>
        </div>

        {/* Nav links */}
        <div className="navbar-nav">
          {[
            { to: '/',         label: 'Home'     },
            { to: '/learn',    label: 'Learn'    },
            { to: '/teach',    label: 'Teach'    },
            ...(user ? [
              { to: '/progress', label: 'Progress' },
              { to: '/requests', label: 'Requests' },
            ] : []),
          ].map(({ to, label }) => (
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
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/login')}>
                Login
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/signup')}>
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
