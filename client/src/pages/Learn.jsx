import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyRequests, getChats, createRequest, askDevtaAI, selectTeacher } from '../api';
import Modal from '../components/Modal';
import MarkdownRenderer from '../components/MarkdownRenderer';

export default function Learn({ onOpenAI }) {
  const navigate = useNavigate();
  const [myRequests, setMyRequests] = useState([]);
  const [myChats, setMyChats] = useState([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [showDevtaModal, setShowDevtaModal] = useState(false);
  
  // Real Groq AI State
  const [devtaQuestion, setDevtaQuestion] = useState('');
  const [devtaAnswer, setDevtaAnswer] = useState('');
  const [devtaLoading, setDevtaLoading] = useState(false);

  const [form, setForm] = useState({ question: '', description: '', skill: '' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const categories = ['All', 'React & Frontend', 'Backend & Node', 'AI & Groq', '3D Design & CSS', 'Data Structures'];

  useEffect(() => {
    getMyRequests().then((r) => setMyRequests(r.data)).catch(() => setMyRequests([]));
    getChats().then((r) => setMyChats(r.data)).catch(() => setMyChats([]));
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await createRequest(form);
      setMyRequests((prev) => [data, ...prev]);
      setShowModal(false);
      setForm({ question: '', description: '', skill: '' });
      showToast('Learning request posted! Qualified teachers will be notified. 🎉');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create request.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTeacher = async (reqId, teacherId) => {
    try {
      const { data } = await selectTeacher(reqId, teacherId);
      setMyRequests((prev) => prev.map((r) => (r._id === reqId ? data : r)));
      showToast('Teacher selected! 1-on-1 session activated. 🎉');
      navigate('/requests');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to select teacher.');
    }
  };

  // Real Groq AI Teach Devta Call
  const handleAskDevta = async (e) => {
    e.preventDefault();
    if (!devtaQuestion.trim()) return;
    setDevtaLoading(true);
    setDevtaAnswer('');

    try {
      const res = await askDevtaAI({ question: devtaQuestion });
      setDevtaAnswer(res.data.answer);
    } catch (err) {
      setDevtaAnswer(
        err.response?.data?.fallbackAnswer || 
        'Teach Devta AI is currently busy. Please try asking again shortly!'
      );
    } finally {
      setDevtaLoading(false);
    }
  };

  const activeRequests = myRequests.filter((r) =>
    ['selected', 'active'].includes(r.status)
  );

  const filteredRequests = myRequests.filter((req) => {
    const matchesSearch = 
      (req.question || '').toLowerCase().includes(search.toLowerCase()) ||
      (req.skill || '').toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="page-body page-enter">
      <div className="container">
        {/* Header */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1>Learn 📚</h1>
            <p>Master new skills through direct 1-on-1 peer sessions and AI guidance.</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-gradient btn-sm" onClick={() => setShowDevtaModal(true)}>
              🤖 Ask Teach Devta AI
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
              + Create Learning Request
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-bar-wrapper">
          <span className="search-icon">🔍</span>
          <input
            className="search-bar"
            type="text"
            placeholder="Search skills, learning topics, questions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Category Horizontal Scroll-Snap Filter */}
        <div className="scroll-snap-x" style={{ marginBottom: 28 }}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-chip scroll-snap-item ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Teach Devta AI Quick Banner */}
        <div className="card card-3d" style={{ padding: 24, marginBottom: 36, background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(239, 68, 68, 0.12) 100%)', borderColor: 'var(--accent-indigo)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ fontSize: '2.4rem' }}>🤖</div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Have an urgent coding or concept doubt?
                </h3>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                  Ask Teach Devta any coding or learning doubt — get instant detailed answers.
                </div>
              </div>
            </div>
            <button className="btn btn-gradient btn-sm" onClick={() => setShowDevtaModal(true)}>
              ⚡ Ask AI Now
            </button>
          </div>
        </div>

        {/* Active Learning Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Active Learning Sessions</h2>
            <span className="badge badge-verified">{activeRequests.length} Active</span>
          </div>

          {activeRequests.length === 0 ? (
            <div className="card" style={{ padding: 36, textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ marginBottom: 16, fontSize: '1rem' }}>No active 1-on-1 learning sessions yet.</p>
              <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
                + Post Your First Learning Request
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
              {activeRequests.map((req) => {
                const linkedChat = myChats.find(
                  (c) => c.request?._id === req._id || c.skill === req.skill
                );
                return (
                  <div className="card card-3d" key={req._id}>
                    <div className="card-body">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <span className="badge badge-verified">✓ Teacher Assigned</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
                        {req.skill || req.question}
                      </h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                        Teacher: <strong>{req.selectedTeacher?.name ?? 'Assigned Peer'}</strong>
                      </p>

                      <div className="progress-bar-wrapper" style={{ marginBottom: 18 }}>
                        <div className="progress-bar-label">
                          <span>Learning Progress</span>
                          <span>60%</span>
                        </div>
                        <div className="progress-bar-track">
                          <div className="progress-bar-fill" style={{ width: '60%' }} />
                        </div>
                      </div>

                      {linkedChat && (
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ width: '100%' }}
                          onClick={() => navigate(`/chat/${linkedChat._id}`)}
                        >
                          💬 Open Learning Chat
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* My Learning Requests List */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">All Learning Requests</h2>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/requests')}>
              Manage in Requests Feed →
            </button>
          </div>

          {myRequests.length === 0 ? (
            <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ marginBottom: 16, fontSize: '1rem' }}>You haven&apos;t posted any learning requests yet.</p>
              <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
                + Post Your First Request
              </button>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
              No requests found matching "{search}".
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {filteredRequests.map((req) => (
                <div className="card card-3d request-card" key={req._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                      &ldquo;{req.question}&rdquo;
                    </div>
                    <span className={`badge ${req.status === 'open' ? 'badge-pending' : 'badge-verified'}`}>
                      {req.status === 'open' ? '⏳ Open for Teachers' : '✅ Active'}
                    </span>
                  </div>

                  {req.skill && (
                    <div style={{ fontSize: '0.88rem', color: 'var(--accent-indigo)', fontWeight: 600, marginBottom: 8 }}>
                      Topic / Skill: {req.skill}
                    </div>
                  )}

                  <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                    {req.description || 'No extra notes provided.'}
                  </p>

                  {/* If offers exist, show quick accept buttons */}
                  {req.teacherResponses?.length > 0 && req.status === 'open' && (
                    <div style={{ background: 'var(--surface-inset)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 14, marginBottom: 14 }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                        👨‍🏫 {req.teacherResponses.length} Teacher{req.teacherResponses.length > 1 ? 's' : ''} Offered to Teach:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {req.teacherResponses.map((item, idx) => {
                          const teacherUser = item.teacher && typeof item.teacher === 'object' ? item.teacher : { _id: item.teacher, name: 'Teacher', username: 'peer' };
                          const teacherId = teacherUser._id || item.teacher || item._id;
                          const teacherName = teacherUser.name || 'Peer Teacher';

                          return (
                            <div key={item._id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{teacherName}</span>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleSelectTeacher(req._id, teacherId)}
                              >
                                ✓ Accept &amp; Start Chat
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {req.teacherResponses?.length || 0} teacher offer(s) received
                    </span>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate('/requests')}>
                      View Details &amp; Offers →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Modal: Create Learning Request ── */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Learning Request 📝">
          <form onSubmit={handleCreateRequest}>
            <div className="form-group">
              <label className="form-label">What do you want to learn? *</label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g. How does Redux Toolkit createSlice work?"
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Related Skill or Subject</label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g. React, JavaScript, Python"
                value={form.skill}
                onChange={(e) => setForm({ ...form, skill: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Details / Specific Obstacle</label>
              <textarea
                className="form-textarea"
                placeholder="Describe what you've tried and what you're stuck on…"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-md" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Posting Request…' : '🚀 Post Learning Request'}
            </button>
          </form>
        </Modal>

        {/* ── Modal: Ask Teach Devta AI (Groq) ── */}
        <Modal isOpen={showDevtaModal} onClose={() => setShowDevtaModal(false)} title="Teach Devta AI Assistant 🤖">
          <form onSubmit={handleAskDevta}>
            <div className="form-group">
              <label className="form-label">Ask Teach Devta your question</label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g. Explain how async/await works under the hood"
                value={devtaQuestion}
                onChange={(e) => setDevtaQuestion(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-gradient btn-md" style={{ width: '100%', marginBottom: 16 }} disabled={devtaLoading}>
              {devtaLoading ? '⚡ Thinking…' : '⚡ Ask Teach Devta'}
            </button>

            {devtaAnswer && (
              <div style={{ background: 'var(--surface-inset)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 18, maxHeight: 380, overflowY: 'auto' }}>
                <strong style={{ color: 'var(--accent-indigo)', display: 'block', marginBottom: 12 }}>
                  🤖 Teach Devta AI Answer:
                </strong>
                <MarkdownRenderer content={devtaAnswer} />
              </div>
            )}
          </form>
        </Modal>

        {/* Toast */}
        {toast && <div className="toast-notification">{toast}</div>}
      </div>
    </div>
  );
}
