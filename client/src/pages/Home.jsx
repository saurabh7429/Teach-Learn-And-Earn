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
          <div className="hero-section">
            <div className="badge badge-indigo" style={{ marginBottom: 20 }}>
              🚀 Peer-to-Peer Skill Exchange Platform
            </div>
            <h1 className="hero-greeting">
              Teach, Learn &amp; Earn
            </h1>
            <p className="hero-subtitle">
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
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h2 className="section-title" style={{ fontSize: 24, marginBottom: 8 }}>
                What do you want to do today?
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
                Choose your path or do both with a single account!
              </p>
            </div>

            <div className="action-cards-grid">
              <div className="action-card" onClick={() => navigate('/signup')}>
                <span className="action-card-icon">📚</span>
                <h2 className="action-card-title">LEARN</h2>
                <p className="action-card-desc">
                  Find teachers and learn new skills. Post specific learning requests like &ldquo;How do loops work in C?&rdquo; and get real responses.
                </p>
                <button className="btn btn-primary btn-sm">Explore Skills →</button>
              </div>

              <div className="action-card" onClick={() => navigate('/signup')}>
                <span className="action-card-icon">🎓</span>
                <h2 className="action-card-title">TEACH</h2>
                <p className="action-card-desc">
                  Share your knowledge with others. Pass the Teach Devta assessment to verify your skills and start teaching active learners.
                </p>
                <button className="btn btn-secondary btn-sm">
                  Start Teaching →
                </button>
              </div>
            </div>
          </div>

          {/* Teach Devta AI Showcase */}
          <div className="dashboard-section">
            <div className="teach-devta-widget">
              <div className="teach-devta-avatar">🤖</div>
              <div className="teach-devta-info">
                <div className="teach-devta-name">Teach Devta AI Engine</div>
                <div className="teach-devta-desc">
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
          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">Popular Skills Available</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/signup')}>View All →</button>
            </div>
            <div className="skills-grid">
              {[
                { name: 'JavaScript', category: 'Web Development', students: 18 },
                { name: 'C Programming', category: 'Systems & Code', students: 24 },
                { name: 'React.js', category: 'Frontend UI', students: 15 },
                { name: 'HTML & CSS', category: 'Web Design', students: 30 },
              ].map((s) => (
                <div className="card card-hover" key={s.name} onClick={() => navigate('/signup')} style={{ cursor: 'pointer' }}>
                  <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{s.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>📌 {s.category}</div>
                  <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="badge badge-success">✓ Verified</span>
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
            <div className="action-card" onClick={() => navigate('/learn')}>
              <span className="action-card-icon">📚</span>
              <h2 className="action-card-title">LEARN</h2>
              <p className="action-card-desc">Find teachers and learn new skills from real people.</p>
              <button className="btn btn-primary btn-sm">Explore Skills →</button>
            </div>
            <div className="action-card" onClick={() => navigate('/teach')}>
              <span className="action-card-icon">🎓</span>
              <h2 className="action-card-title">TEACH</h2>
              <p className="action-card-desc">Share your knowledge and help others grow.</p>
              <button className="btn btn-secondary btn-sm">
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
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/learn')}>View All →</button>
            </div>
            {activeRequests.map((req) => (
              <div className="card" key={req._id} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{req.skill || req.question}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      👤 Teacher: {req.selectedTeacher?.name ?? 'Assigned'}
                    </div>
                  </div>
                  <span className="status-badge selected">Active</span>
                </div>
                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                  {myChats.find((c) => c.request === req._id) && (
                    <button className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/chat/${myChats.find((c) => c.request === req._id)?._id}`)}>
                      💬 Open Chat
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Your Teaching */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Your Teaching</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/teach')}>Manage →</button>
          </div>
          <div className="skills-grid">
            {mySkills.map((skill) => (
              <div className="card" key={skill._id}>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{skill.name}</div>
                <span className={`badge ${skill.verified ? 'badge-success' : 'badge-neutral'}`} style={{ marginBottom: 12 }}>
                  {skill.verified ? '✓ Verified' : '⏳ Pending'}
                </span>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>
                  👥 {skill.students?.length ?? 0} Student{skill.students?.length !== 1 ? 's' : ''}
                </div>
              </div>
            ))}
            <div className="card" onClick={() => navigate('/teach')} style={{ cursor: 'pointer', borderStyle: 'dashed', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '1.8rem', color: 'var(--primary)', marginBottom: 6 }}>＋</div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Add New Skill</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Become a teacher</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Recent Activity</h2>
          </div>
          <div className="card">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />
                <span>You have {myRequests.filter((r) => r.teacherResponses?.length > 0).length} learning requests with teacher responses</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }} />
                <span>You are teaching {mySkills.length} skill{mySkills.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
