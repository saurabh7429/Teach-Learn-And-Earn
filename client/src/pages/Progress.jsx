import { useEffect, useState } from 'react';
import { getProgress } from '../api';

export default function Progress() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProgress()
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="page-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );

  const teaching  = data?.teaching  ?? { skills: [], totalStudents: 0, verifiedCount: 0 };
  const learning  = data?.learning  ?? { activeRequests: [], skillsLearning: 0 };
  const sessions  = data?.totalSessions ?? 0;

  const stats = [
    { num: learning.skillsLearning, label: 'Skills Learning' },
    { num: teaching.skills.length,  label: 'Skills Teaching' },
    { num: teaching.totalStudents,  label: 'Active Students' },
    { num: sessions,                label: 'Messages Sent'   },
  ];

  return (
    <div className="page-body page-enter">
      <div className="container">
        <div className="page-header">
          <h1>Progress 📊</h1>
          <p>Track your learning and teaching milestones.</p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {stats.map((s) => (
            <div className="card stat-card" key={s.label}>
              <div className="stat-number">{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Learning Progress */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Learning Progress</h2>
          </div>
          {learning.activeRequests.length === 0 && (
            <div className="card" style={{ padding: 24, color: 'var(--text-muted)', textAlign: 'center' }}>
              No active learning sessions. Go to Learn and create a request!
            </div>
          )}
          {learning.activeRequests.map((req) => (
            <div className="card" key={req._id} style={{ marginBottom: 16 }}>
              <div className="card-body">
                <div className="learning-card-top">
                  <div>
                    <div className="learning-card-title">{req.skill || req.question}</div>
                    <div className="learning-card-teacher">
                      👤 {req.selectedTeacher?.name ?? 'Teacher assigned'}
                    </div>
                  </div>
                </div>
                <div className="progress-bar-wrapper">
                  <div className="progress-bar-label"><span>In Progress</span><span>—</span></div>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{ width: '40%' }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Teaching Progress */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Teaching Progress</h2>
          </div>
          {teaching.skills.length === 0 && (
            <div className="card" style={{ padding: 24, color: 'var(--text-muted)', textAlign: 'center' }}>
              No teaching skills yet. Go to Teach and add a skill!
            </div>
          )}
          {teaching.skills.map((skill) => (
            <div className="card" key={skill._id} style={{ marginBottom: 16 }}>
              <div className="card-body">
                <div className="learning-card-top">
                  <div>
                    <div className="learning-card-title">{skill.name}</div>
                    <div className="learning-card-teacher">
                      {skill.verified ? '✓ Verified Skill' : '⏳ Pending Verification'}
                    </div>
                  </div>
                  <span className="badge badge-verified">{skill.students?.length ?? 0} Students</span>
                </div>
                <div className="progress-bar-wrapper">
                  <div className="progress-bar-label">
                    <span>Students enrolled</span>
                    <span>{skill.students?.length ?? 0}</span>
                  </div>
                  <div className="progress-bar-track">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${Math.min((skill.students?.length ?? 0) * 20, 100)}%`,
                        background: 'linear-gradient(135deg,#10B981,#059669)',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
