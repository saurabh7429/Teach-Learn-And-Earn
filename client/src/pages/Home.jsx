import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMySkills, getMyRequests, getChats } from '../api';

export default function Home({ onOpenAI }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mySkills, setMySkills] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [myChats, setMyChats] = useState([]);

  useEffect(() => {
    if (user) {
      getMySkills().then((r) => setMySkills(r.data)).catch(() => {});
      getMyRequests().then((r) => setMyRequests(r.data)).catch(() => {});
      getChats().then((r) => setMyChats(r.data)).catch(() => {});
    }
  }, [user]);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const firstName = user?.name?.split(' ')[0] ?? 'Explorer';
  const activeRequests = myRequests.filter((r) => ['selected', 'active'].includes(r.status));

  const popularSkills = [
    '⚛️ React 19 & Next.js',
    '🐍 Python & FastMCP',
    '⚡ Groq & LLM Tuning',
    '🎨 3D CSS & UI Design',
    '🦀 Rust & WebAssembly',
    '📱 Mobile React Native',
    '☁️ Cloud & Docker',
  ];

  // ══════════════════════════════════════════════════════════════════
  // GUEST LANDING PAGE
  // ══════════════════════════════════════════════════════════════════
  if (!user) {
    return (
      <div className="page-body page-enter">
        <div className="container">
          {/* Hero Banner */}
          <div className="hero-section">
            <div className="badge badge-indigo" style={{ marginBottom: 20 }}>
              🚀 Peer-to-Peer Skill Exchange + Groq AI Assessment
            </div>
            <h1 className="hero-greeting">
              Teach, Learn &amp; Earn
            </h1>
            <p className="hero-subtitle">
              Learn what you love. Teach what you know.<br />
              One account lets you discover expert teachers and verify your own teaching skills with <strong>Teach Devta AI</strong>.
            </p>

            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/signup')}>
                Get Started Free 🚀
              </button>
              <button className="btn btn-secondary btn-lg" onClick={() => navigate('/login')}>
                Sign In to Workspace 👋
              </button>
            </div>

            {/* Popular Skills Horizontal Scroll Snap */}
            <div style={{ marginTop: 24 }}>
              <div className="scroll-snap-x">
                {popularSkills.map((sk, idx) => (
                  <button
                    key={idx}
                    className="category-chip scroll-snap-item"
                    onClick={() => navigate('/signup')}
                  >
                    {sk}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Core Action Cards (Learn vs Teach) */}
          <div className="dashboard-section">
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <h2 className="section-title" style={{ fontSize: '1.8rem', marginBottom: 8 }}>
                Choose Your Pathway
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
                Exchange knowledge directly with peers without monetary barriers.
              </p>
            </div>

            <div className="action-cards-grid">
              <div className="action-card card-3d" onClick={() => navigate('/signup')}>
                <div>
                  <span className="action-card-icon">📚</span>
                  <h2 className="action-card-title">LEARN</h2>
                  <p className="action-card-desc">
                    Connect with peer experts for 1-on-1 sessions. Ask specific questions and receive structured teaching guidance.
                  </p>
                </div>
                <button className="btn btn-primary btn-md">
                  Explore Learning →
                </button>
              </div>

              <div className="action-card card-3d" onClick={() => navigate('/signup')}>
                <div>
                  <span className="action-card-icon">🎓</span>
                  <h2 className="action-card-title">TEACH</h2>
                  <p className="action-card-desc">
                    Share your mastery. Pass the Teach Devta dynamic assessment to earn a verified teacher badge and match with eager learners.
                  </p>
                </div>
                <button className="btn btn-secondary btn-md">
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
                  Powered by <strong>Groq Llama 3.3</strong> — acts as your instant 24/7 learning tutor and verifies teacher qualification quizzes in real time!
                </div>
              </div>
              <button 
                className="btn btn-gradient btn-md"
                onClick={() => onOpenAI?.('Teach Devta, explain the TL&E learning process!')}
              >
                ⚡ Ask Teach Devta
              </button>
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
        {/* Welcome Header */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1>{greeting}, {firstName}! 👋</h1>
            <p>Welcome to your active learning &amp; teaching headquarters.</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-gradient btn-sm" onClick={() => onOpenAI?.('')}>
              🤖 Ask Teach Devta
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/learn')}>
              + Learn Skill
            </button>
          </div>
        </div>

        {/* Action Pathway Cards */}
        <div className="action-cards-grid" style={{ marginBottom: 36 }}>
          <div className="action-card card-3d" onClick={() => navigate('/learn')}>
            <div>
              <span className="action-card-icon">📚</span>
              <h2 className="action-card-title">My Learning</h2>
              <p className="action-card-desc">
                {activeRequests.length > 0
                  ? `You have ${activeRequests.length} active learning session(s) in progress.`
                  : 'Post a learning request or ask Teach Devta to resolve doubts.'}
              </p>
            </div>
            <button className="btn btn-primary btn-sm">Open Learning Room →</button>
          </div>

          <div className="action-card card-3d" onClick={() => navigate('/teach')}>
            <div>
              <span className="action-card-icon">🎓</span>
              <h2 className="action-card-title">My Teaching</h2>
              <p className="action-card-desc">
                {mySkills.length > 0
                  ? `You have ${mySkills.length} listed skill(s) (${mySkills.filter(s => s.verified).length} verified).`
                  : 'Add your skills and pass verification to start accepting student requests.'}
              </p>
            </div>
            <button className="btn btn-secondary btn-sm">Manage Teaching →</button>
          </div>
        </div>

        {/* Active Learning Feed & Chats */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Active Conversations &amp; Sessions</h2>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/requests')}>
              View All Requests
            </button>
          </div>

          {myChats.length === 0 ? (
            <div className="card" style={{ padding: 36, textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ marginBottom: 16 }}>No active chat sessions right now.</p>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/learn')}>
                + Start Learning Request
              </button>
            </div>
          ) : (
            <div className="grid-auto">
              {myChats.map((chat) => (
                <div 
                  key={chat._id} 
                  className="card card-3d" 
                  style={{ padding: 20, cursor: 'pointer' }}
                  onClick={() => navigate(`/chat/${chat._id}`)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span className="badge badge-verified">💬 Active Session</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {chat.messages?.length || 0} msgs
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                    {chat.skill || 'Learning Exchange'}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Click to enter live chat room →
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
