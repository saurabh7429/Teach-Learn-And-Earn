import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
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
            { to: '/progress', label: 'Progress' },
            { to: '/requests', label: 'Requests' },
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
          <button className="notif-btn" title="Notifications">
            🔔
            <span className="notif-badge">3</span>
          </button>
          <div className="profile-btn" onClick={handleLogout} title="Logout">
            <div className="profile-avatar">{initials}</div>
            <span className="profile-name">{user?.name?.split(' ')[0] ?? 'User'} ▾</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
