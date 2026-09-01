import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProgress } from '../api';

export default function Progress() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const fetchProgress = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await getProgress();
      setData(res.data);
    } catch (err) {
      setLoadError(
        err.response?.data?.message ||
        'Unable to load your progress and analytics. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const teaching = data?.teaching ?? { skills: [], totalStudents: 0, verifiedCount: 0 };
  const learning = data?.learning ?? { activeRequests: [], skillsLearning: 0 };
  const sessions = data?.totalSessions ?? 0;

  const stats = [
    { num: learning.skillsLearning, label: 'Skills Learning', icon: '📚' },
    { num: teaching.skills.length, label: 'Skills Teaching', icon: '🎓' },
    { num: teaching.totalStudents, label: 'Active Students', icon: '👥' },
    { num: sessions, label: 'Messages Exchanged', icon: '💬' },
  ];

  return (
    <div className="page-body page-enter">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <h1>Progress &amp; Analytics 📊</h1>
          <p>Real-time analytics for your learning achievements and teaching impact.</p>
        </div>

        {/* API Error State Banner with Retry */}
        {loadError && (
          <div className="api-state-card api-error-card" role="alert" aria-live="assertive">
            <div className="api-error-icon">⚠️</div>
            <h2 className="api-error-title">Unable to Load Progress</h2>
            <p className="api-error-desc">{loadError}</p>
            <button type="button" className="btn btn-primary btn-sm" onClick={fetchProgress}>
              🔄 Retry Connection
            </button>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="card api-loading-card" role="status" aria-live="polite">
            <div className="spinner" />
            <span className="api-loading-text">Loading your learning and teaching progress…</span>
          </div>
        )}

        {!loading && !loadError && (
          <>
            {/* 3D Stats Grid */}
            <div className="stats-grid">
              {stats.map((s) => (
                <div className="card stat-card card-3d" key={s.label}>
                  <div style={{ fontSize: '2rem', marginBottom: 6 }}>{s.icon}</div>
                  <div className="stat-number">{s.num}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Learning Milestones */}
            <div className="dashboard-section">
              <div className="section-header">
                <h2 className="section-title">Learning Journey</h2>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/learn')}>
                  + New Learning Request
                </button>
              </div>

              {learning.activeRequests.length === 0 ? (
                <div className="card empty-state-card">
                  <div className="empty-state-icon">📚</div>
                  <div className="empty-state-title">No active learning sessions right now</div>
                  <p className="empty-state-desc">
                    Head over to <strong>Learn</strong> to connect with an expert peer!
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

                        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
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

            {/* Teaching Portfolio */}
            <div className="dashboard-section">
              <div className="section-header">
                <h2 className="section-title">Teaching Portfolio</h2>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/teach')}>
                  Manage Skills →
                </button>
              </div>

              {teaching.skills.length === 0 ? (
                <div className="card empty-state-card">
                  <div className="empty-state-icon">🎓</div>
                  <div className="empty-state-title">No teaching skills listed yet</div>
                  <p className="empty-state-desc">
                    Head to <strong>Teach</strong> to list your skills and pass verification!
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
                          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                            {skill.name}
                          </h3>
                          <span className={`badge ${skill.verified ? 'badge-verified' : 'badge-pending'}`}>
                            {skill.verified ? '✓ Verified' : '⏳ Pending'}
                          </span>
                        </div>

                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                          {skill.description || 'No description provided.'}
                        </p>

                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          Verification Status: <strong>{skill.verified ? 'Teach Devta Certified' : 'Requires Assessment'}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
