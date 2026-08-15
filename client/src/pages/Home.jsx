import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMySkills, getMyRequests, getChats } from '../api';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mySkills,   setMySkills]   = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [myChats,    setMyChats]    = useState([]);

  useEffect(() => {
    getMySkills()   .then((r) => setMySkills(r.data))   .catch(() => {});
    getMyRequests() .then((r) => setMyRequests(r.data)) .catch(() => {});
    getChats()      .then((r) => setMyChats(r.data))    .catch(() => {});
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const activeRequests = myRequests.filter((r) => ['selected', 'active'].includes(r.status));

  return (
    <div className="page-body page-enter">
      <div className="container">
        {/* Hero */}
        <div className="hero-section">
          <h1 className="hero-greeting">{greeting}, {firstName} 👋</h1>
          <p className="hero-subtitle">What would you like to do today?</p>

          <div className="action-cards-grid">
            <div className="action-card action-card-learn" onClick={() => navigate('/learn')}>
              <div className="action-deco" />
              <span className="action-card-icon">📚</span>
              <h2 className="action-card-title">LEARN</h2>
              <p className="action-card-desc">Find teachers and learn new skills from real people.</p>
              <button className="btn btn-primary btn-sm">Explore Skills →</button>
            </div>
            <div className="action-card action-card-teach" onClick={() => navigate('/teach')}>
              <div className="action-deco" />
              <span className="action-card-icon">🎓</span>
              <h2 className="action-card-title">TEACH</h2>
              <p className="action-card-desc">Share your knowledge and help others grow.</p>
              <button className="btn btn-sm" style={{ background: 'linear-gradient(135deg,#10B981,#059669)', color: 'white' }}>
                Start Teaching →
              </button>
            </div>
          </div>
        </div>

        {/* Continue Learning */}
        {activeRequests.length > 0 && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">Continue Learning</h2>
              <span className="section-link" onClick={() => navigate('/learn')}>View All →</span>
            </div>
            {activeRequests.map((req) => (
              <div className="card" key={req._id} style={{ marginBottom: 12 }}>
                <div className="card-body">
                  <div className="learning-card-top">
                    <div>
                      <div className="learning-card-title">{req.skill || req.question}</div>
                      <div className="learning-card-teacher">
                        👤 Teacher: {req.selectedTeacher?.name ?? 'Assigned'}
                      </div>
                    </div>
                    <span className="badge badge-verified">Active</span>
                  </div>
                  <div className="progress-bar-wrapper">
                    <div className="progress-bar-label"><span>Progress</span><span>—</span></div>
                    <div className="progress-bar-track"><div className="progress-bar-fill" style={{ width: '40%' }} /></div>
                  </div>
                  <div className="learning-card-actions">
                    {myChats.find((c) => c.request === req._id) && (
                      <button className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/chat/${myChats.find((c) => c.request === req._id)?._id}`)}>
                        💬 Chat
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Your Teaching */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Your Teaching</h2>
            <span className="section-link" onClick={() => navigate('/teach')}>Manage →</span>
          </div>
          <div className="teaching-skills-grid">
            {mySkills.map((skill) => (
              <div className="card skill-card" key={skill._id}>
                <div className="skill-card-name">{skill.name}</div>
                <span className={`badge ${skill.verified ? 'badge-verified' : 'badge-pending'}`} style={{ marginBottom: 8 }}>
                  {skill.verified ? '✓ Verified' : '⏳ Pending'}
                </span>
                <div className="skill-students">
                  👥 {skill.students?.length ?? 0} Student{skill.students?.length !== 1 ? 's' : ''}
                </div>
              </div>
            ))}
            <div className="card skill-card-add" onClick={() => navigate('/teach')}>
              <div className="skill-card-add-icon">＋</div>
              <div className="skill-card-add-text">Add New Skill</div>
              <div className="skill-card-add-sub">Become a teacher</div>
            </div>
          </div>
        </div>

        {/* Recent Activity (static demo) */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Recent Activity</h2>
          </div>
          <div className="card">
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-dot" />
                <span className="activity-text">You have {myRequests.filter((r) => r.teacherResponses.length > 0).length} learning requests with teacher responses</span>
                <span className="activity-time">now</span>
              </div>
              <div className="activity-item">
                <div className="activity-dot" style={{ background: 'var(--success)' }} />
                <span className="activity-text">You are teaching {mySkills.length} skill{mySkills.length !== 1 ? 's' : ''}</span>
                <span className="activity-time">now</span>
              </div>
              <div className="activity-item">
                <div className="activity-dot" style={{ background: 'var(--warning)' }} />
                <span className="activity-text">{mySkills.filter((s) => s.verified).length} skill{mySkills.filter((s) => s.verified).length !== 1 ? 's' : ''} verified by Teach Devta</span>
                <span className="activity-time">—</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
