import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyRequests, getChats, createRequest } from '../api';
import Modal from '../components/Modal';

export default function Learn() {
  const navigate = useNavigate();
  const [myRequests, setMyRequests] = useState([]);
  const [myChats, setMyChats] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDevtaModal, setShowDevtaModal] = useState(false);
  const [devtaQuestion, setDevtaQuestion] = useState('');
  const [devtaAnswer, setDevtaAnswer] = useState('');
  const [devtaLoading, setDevtaLoading] = useState(false);
  const [form, setForm] = useState({ question: '', description: '', skill: '' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    getMyRequests().then((r) => setMyRequests(r.data)).catch(() => {});
    getChats().then((r) => setMyChats(r.data)).catch(() => {});
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
      showToast('Learning request posted! Teachers will respond soon. 🎉');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create request.');
    } finally {
      setLoading(false);
    }
  };

  const handleAskDevta = (e) => {
    e.preventDefault();
    if (!devtaQuestion.trim()) return;
    setDevtaLoading(true);
    setDevtaAnswer('');

    setTimeout(() => {
      setDevtaAnswer(
        `🤖 Teach Devta AI Answer:\nGreat question regarding "${devtaQuestion}"! In programming, breaking complex logic into step-by-step modular blocks is key. Connect with an expert teacher on TL&E for 1-on-1 code reviews!`
      );
      setDevtaLoading(false);
    }, 1200);
  };

  const activeRequests = myRequests.filter((r) =>
    ['selected', 'active'].includes(r.status)
  );

  return (
    <div className="page-body page-enter">
      <div className="container">
        <div className="page-header">
          <h1>Learn 📚</h1>
          <p>Find skills, connect with teachers and continue your learning journey.</p>
        </div>

        {/* Search */}
        <div className="search-bar-wrapper">
          <span className="search-icon">🔍</span>
          <input
            className="search-bar"
            type="text"
            placeholder="Search skills, topics, teachers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* My Learning */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">My Learning</h2>
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
              + Create Learning Request
            </button>
          </div>

          {activeRequests.length === 0 && (
            <div className="card" style={{ padding: 36, textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ marginBottom: 16, fontSize: '1rem' }}>No active learning sessions yet.</p>
              <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
                + Create your first learning request
              </button>
            </div>
          )}

          {activeRequests.map((req) => {
            const chat = myChats.find((c) => c.request === req._id);
            return (
              <div className="card" key={req._id} style={{ marginBottom: 16 }}>
                <div className="learning-card-top">
                  <div>
                    <div className="learning-card-title">{req.skill || req.question}</div>
                    <div className="learning-card-teacher">
                      👤 Teacher: {req.selectedTeacher?.name ?? 'Assigned'}
                    </div>
                  </div>
                  <span className="status-badge active">Active</span>
                </div>
                <div className="progress-bar-wrapper">
                  <div className="progress-bar-label">
                    <span>Session Progress</span>
                    <span>In Progress</span>
                  </div>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{ width: '40%' }} />
                  </div>
                </div>
                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                  {chat && (
                    <button className="btn btn-primary btn-sm" onClick={() => navigate(`/chat/${chat._id}`)}>
                      💬 Open Chat Room
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Teach Devta — Interactive AI Assistant */}
        <div className="teach-devta-widget">
          <div className="teach-devta-avatar">🤖</div>
          <div className="teach-devta-info">
            <div className="teach-devta-name">Teach Devta AI Assistant</div>
            <div className="teach-devta-desc">
              Your personal learning assistant — ask instant questions, get code explanations, and practice concepts.
            </div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowDevtaModal(true)}>
            Ask Teach Devta 🤖
          </button>
        </div>
      </div>

      {/* Create Request Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)} title="Create Learning Request">
        <form onSubmit={handleCreateRequest}>
          <div className="form-group">
            <label className="form-label">What do you want to learn?</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. How do pointers work in C?"
              value={form.question}
              onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Details & Context</label>
            <textarea
              className="form-textarea"
              placeholder="Describe in detail what you want help with…"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Skill / Category</label>
            <select
              className="form-select"
              value={form.skill}
              onChange={(e) => setForm((f) => ({ ...f, skill: e.target.value }))}
            >
              <option value="">Select a skill…</option>
              {['C Programming', 'HTML & CSS', 'JavaScript', 'React.js', 'Python', 'Data Structures'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Posting…' : 'Post Request'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Teach Devta AI Modal */}
      <Modal show={showDevtaModal} onClose={() => setShowDevtaModal(false)} title="Ask Teach Devta AI 🤖">
        <form onSubmit={handleAskDevta}>
          <div className="form-group">
            <label className="form-label">Ask any technical question or topic:</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Explain stack vs heap memory in C"
              value={devtaQuestion}
              onChange={(e) => setDevtaQuestion(e.target.value)}
              required
            />
          </div>

          {devtaLoading && (
            <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--primary)' }}>
              🤖 Teach Devta is thinking…
            </div>
          )}

          {devtaAnswer && (
            <div className="info-box" style={{ marginBottom: 18, whiteSpace: 'pre-line' }}>
              {devtaAnswer}
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowDevtaModal(false)}>Close</button>
            <button type="submit" className="btn btn-primary" disabled={devtaLoading}>
              Ask AI
            </button>
          </div>
        </form>
      </Modal>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
