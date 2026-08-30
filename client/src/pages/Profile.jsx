import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProgress } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProgress()
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logoutUser();
      navigate('/');
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const teaching = data?.teaching ?? { skills: [], totalStudents: 0, verifiedCount: 0 };
  const learning = data?.learning ?? { activeRequests: [], skillsLearning: 0 };
  const sessions  = data?.totalSessions ?? 0;

  const stats = [
    { num: learning.skillsLearning,  label: 'Skills Learning',   icon: '📚', color: 'var(--accent-indigo)' },
    { num: teaching.skills.length,   label: 'Skills Teaching',   icon: '🎓', color: 'var(--primary)' },
    { num: teaching.totalStudents,   label: 'Active Students',   icon: '👥', color: 'var(--success)' },
    { num: sessions,                 label: 'Messages Sent',     icon: '💬', color: 'var(--warning)' },
  ];

  return (
    <div className="page-body page-enter">
      <div className="container">

        {/* ── Profile Hero Card ── */}
        <div className="profile-hero-card">
          <div className="profile-hero-bg" />
          <div className="profile-hero-content">
            <div className="profile-hero-avatar">
              {initials}
            </div>
            <div className="profile-hero-info">
              <h1 className="profile-hero-name">{user?.name || 'User'}</h1>
              <p className="profile-hero-username">@{user?.username || user?.email?.split('@')[0] || 'user'}</p>
              <p className="profile-hero-email" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
                {user?.email || ''}
              </p>
              <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                <span className="badge badge-verified">
                  ✓ Member
                </span>
                {teaching.verifiedCount > 0 && (
                  <span className="badge badge-indigo">
                    🎓 Teach Devta Certified
                  </span>
                )}
              </div>
            </div>
            <div className="profile-hero-actions">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => navigate('/teach')}
              >
                🎓 Manage Skills
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={handleLogout}
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>

        {/* ── Stats Grid ── */}
        <div className="stats-grid" style={{ marginBottom: 36 }}>
          {stats.map((s) => (
            <div className="card stat-card card-3d" key={s.label}>
              <div style={{ fontSize: '2rem', marginBottom: 6 }}>{s.icon}</div>
              <div className="stat-number" style={{ color: s.color }}>{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Learning Journey ── */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">📚 Learning Journey</h2>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/learn')}>
              + New Request
            </button>
          </div>

          {loading ? (
            <div className="card" style={{ padding: 36, display: 'flex', justifyContent: 'center' }}>
              <div className="spinner" />
            </div>
          ) : learning.activeRequests.length === 0 ? (
            <div className="card profile-empty-state">
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>🎯</div>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                No active learning sessions
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 16 }}>
                Connect with an expert to start learning!
              </p>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/learn')}>
                Find a Teacher →
              </button>
            </div>
          ) : (
            <div className="grid-auto">
              {learning.activeRequests.map((req) => (
                <div className="card card-3d" key={req._id}>
                  <div className="card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span className="badge badge-verified">In Progress</span>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {req.skill || 'Skill'}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                      {req.question}
                    </h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
                      Teacher: <strong>{req.selectedTeacher?.name ?? 'Assigned Mentor'}</strong>
                    </p>
                    <div className="progress-bar-wrapper">
                      <div className="progress-bar-label">
                        <span>Curriculum Mastery</span>
                        <span>70%</span>
                      </div>
                      <div className="progress-bar-track">
                        <div className="progress-bar-fill" style={{ width: '70%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Teaching Portfolio ── */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">🎓 Teaching Portfolio</h2>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/teach')}>
              Manage Skills →
            </button>
          </div>

          {loading ? (
            <div className="card" style={{ padding: 36, display: 'flex', justifyContent: 'center' }}>
              <div className="spinner" />
            </div>
          ) : teaching.skills.length === 0 ? (
            <div className="card profile-empty-state">
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>✨</div>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                No skills listed yet
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 16 }}>
                Share your knowledge and get Teach Devta certified!
              </p>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/teach')}>
                Add Your Skills →
              </button>
            </div>
          ) : (
            <div className="grid-auto">
              {teaching.skills.map((skill) => (
                <div className="card card-3d" key={skill._id}>
                  <div className="card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {skill.name}
                      </h3>
                      <span className={`badge ${skill.verified ? 'badge-verified' : 'badge-pending'}`}>
                        {skill.verified ? '✓ Verified' : '⏳ Pending'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                      {skill.description || 'No description provided.'}
                    </p>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      fontSize: '0.82rem', color: skill.verified ? 'var(--success)' : 'var(--text-muted)',
                      padding: '8px 12px', background: 'var(--surface-inset)',
                      borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                    }}>
                      {skill.verified ? '🏆' : '⏳'}
                      <span>
                        {skill.verified ? 'Teach Devta Certified' : 'Pending AI Assessment'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Quick Links ── */}
        <div className="dashboard-section">
          <h2 className="section-title" style={{ marginBottom: 16 }}>⚡ Quick Actions</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('/learn')}>
              📚 Find a Teacher
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/teach')}>
              🎓 Teach a Skill
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/requests')}>
              📋 My Requests
            </button>
            <button
              className="btn btn-danger"
              onClick={handleLogout}
              style={{ marginLeft: 'auto' }}
            >
              🚪 Logout
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
