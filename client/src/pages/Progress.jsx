import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProgress } from '../api';

export default function Progress() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProgress()
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

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
            <div className="card" style={{ padding: 36, color: 'var(--text-muted)', textAlign: 'center' }}>
              No active learning sessions right now. Head over to <strong>Learn</strong> to connect with an expert!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
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
            <div className="card" style={{ padding: 36, color: 'var(--text-muted)', textAlign: 'center' }}>
              No teaching skills listed yet. Head to <strong>Teach</strong> to list your skills and pass verification!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
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
      </div>
    </div>
  );
}
