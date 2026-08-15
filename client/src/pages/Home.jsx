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
    if (user) {
      getMySkills()   .then((r) => setMySkills(r.data))   .catch(() => {});
      getMyRequests() .then((r) => setMyRequests(r.data)) .catch(() => {});
      getChats()      .then((r) => setMyChats(r.data))    .catch(() => {});
    }
  }, [user]);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const firstName = user?.name?.split(' ')[0] ?? 'Guest';
  const activeRequests = myRequests.filter((r) => ['selected', 'active'].includes(r.status));

  // ══════════════════════════════════════════════════════════════════
  // GUEST LANDING PAGE (Without Log-in Dashboard)
  // ══════════════════════════════════════════════════════════════════
  if (!user) {
    return (
      <div className="page-body page-enter">
        <div className="container">
          {/* Hero Banner */}
          <div className="hero-section" style={{ textAlign: 'center', padding: '60px 0 40px' }}>
            <div className="badge badge-purple" style={{ marginBottom: 16, fontSize: 13, padding: '6px 16px' }}>
              🚀 Peer-to-Peer Skill Exchange Platform
            </div>
            <h1 className="hero-greeting" style={{ fontSize: 44, fontWeight: 800, marginBottom: 16 }}>
              Teach, Learn &amp; <span className="gradient-text">Earn</span>
            </h1>
            <p className="hero-subtitle" style={{ fontSize: 18, maxWidth: 640, margin: '0 auto 36px' }}>
              Learn what you love. Teach what you know.<br />
              One single account allows you to learn new skills and share your expertise simultaneously.
            </p>

            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/signup')}>
                Get Started Free 🚀
              </button>
              <button className="btn btn-secondary btn-lg" onClick={() => navigate('/login')}>
                Login to Workspace 👋
              </button>
            </div>
          </div>

          {/* Core Action Cards (Learn vs Teach) */}
          <div className="dashboard-section">
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <h2 className="section-title" style={{ fontSize: 24, marginBottom: 6 }}>
                What do you want to do today?
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                Choose your path or do both with a single account!
              </p>
            </div>

            <div className="action-cards-grid">
              <div className="action-card action-card-learn" onClick={() => navigate('/signup')}>
                <div className="action-deco" />
                <span className="action-card-icon">📚</span>
                <h2 className="action-card-title">LEARN</h2>
                <p className="action-card-desc">
                  Find teachers and learn new skills. Post specific learning requests like &ldquo;How do loops work in C?&rdquo; and get real responses.
                </p>
                <button className="btn btn-primary btn-sm">Explore Skills →</button>
              </div>

              <div className="action-card action-card-teach" onClick={() => navigate('/signup')}>
                <div className="action-deco" />
                <span className="action-card-icon">🎓</span>
                <h2 className="action-card-title">TEACH</h2>
                <p className="action-card-desc">
                  Share your knowledge with others. Pass the Teach Devta assessment to verify your skills and start teaching active learners.
                </p>
                <button className="btn btn-sm" style={{ background: 'linear-gradient(135deg,#10B981,#059669)', color: 'white' }}>
                  Teaching →
                </button>
              </div>
            </div>
          </div>

          {/* Teach Devta AI Showcase */}
          <div className="dashboard-section" style={{ marginTop: 40 }}>
            <div className="teach-devta-widget" style={{ padding: 36 }}>
              <div className="teach-devta-avatar" style={{ width: 64, height: 64, fontSize: 32 }}>🤖</div>
              <div className="teach-devta-info">
                <div className="teach-devta-name" style={{ fontSize: 20 }}>Teach Devta AI Engine</div>
                <div className="teach-devta-desc" style={{ fontSize: 15, marginTop: 4, lineHeight: 1.6 }}>
                  Our double-duty AI assistant acts as your <strong>Personal Learning Assistant</strong> when you learn,
                  and as a <strong>Skill Qualification Examiner</strong> to verify teachers before they teach!
                </div>
              </div>
              <button className="btn btn-primary" onClick={() => navigate('/signup')}>
                Try Teach Devta 🤖
              </button>
            </div>
          </div>

          {/* Popular Categories Preview */}
          <div className="dashboard-section" style={{ marginTop: 48, marginBottom: 60 }}>
            <div className="section-header">
              <h2 className="section-title">Popular Skills Available</h2>
              <span className="section-link" onClick={() => navigate('/signup')}>View All →</span>
            </div>
            <div className="teaching-skills-grid">
              {[
                { name: 'JavaScript', category: 'Web Development', students: 18 },
                { name: 'C Programming', category: 'Systems & Code', students: 24 },
                { name: 'React.js', category: 'Frontend UI', students: 15 },
                { name: 'HTML & CSS', category: 'Web Design', students: 30 },
              ].map((s) => (
                <div className="card skill-card" key={s.name} onClick={() => navigate('/signup')} style={{ cursor: 'pointer' }}>
                  <div className="skill-card-name" style={{ fontSize: 16 }}>{s.name}</div>
                  <div className="skill-students" style={{ marginTop: 4 }}>📌 {s.category}</div>
                  <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="badge badge-verified">✓ Verified</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>👥 {s.students} learners</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // LOGGED-IN DASHBOARD
  // ══════════════════════════════════════════════════════════════════
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
                Teaching →
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

        {/* Recent Activity */}
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
