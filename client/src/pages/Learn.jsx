import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyRequests, getChats, createRequest } from '../api';
import Modal from '../components/Modal';

export default function Learn() {
  const navigate = useNavigate();
  const [myRequests,  setMyRequests]  = useState([]);
  const [myChats,     setMyChats]     = useState([]);
  const [search,      setSearch]      = useState('');
  const [showModal,   setShowModal]   = useState(false);
  const [form,        setForm]        = useState({ question: '', description: '', skill: '' });
  const [loading,     setLoading]     = useState(false);
  const [toast,       setToast]       = useState('');

  useEffect(() => {
    getMyRequests().then((r) => setMyRequests(r.data)).catch(() => {});
    getChats()     .then((r) => setMyChats(r.data))  .catch(() => {});
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
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

  const activeRequests = myRequests.filter((r) => ['selected', 'active'].includes(r.status));

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
            className="search-bar" type="text" placeholder="Search skills, topics, teachers…"
            value={search} onChange={(e) => setSearch(e.target.value)}
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
            <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ marginBottom: 12 }}>No active learning sessions yet.</p>
              <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
                + Create your first learning request
              </button>
            </div>
          )}

          {activeRequests.map((req) => {
            const chat = myChats.find((c) => c.request === req._id);
            return (
              <div className="card" key={req._id} style={{ marginBottom: 16 }}>
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
                    <div className="progress-bar-label"><span>Progress</span><span>In Progress</span></div>
                    <div className="progress-bar-track">
                      <div className="progress-bar-fill" style={{ width: '35%' }} />
                    </div>
                  </div>
                  <div className="learning-card-actions">
                    {chat && (
                      <button className="btn btn-primary btn-sm" onClick={() => navigate(`/chat/${chat._id}`)}>
                        💬 Chat with Teacher
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Teach Devta — Learn Side */}
        <div className="teach-devta-widget">
          <div className="teach-devta-avatar">🤖</div>
          <div className="teach-devta-info">
            <div className="teach-devta-name">Teach Devta</div>
            <div className="teach-devta-desc">
              Your personal learning assistant — ask questions, get explanations, and practice concepts.
            </div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => showToast('Teach Devta AI is coming soon! 🤖')}>
            Ask Teach Devta
          </button>
        </div>
      </div>

      {/* Create Request Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)} title="Create Learning Request">
        <form onSubmit={handleCreateRequest}>
          <div className="form-group">
            <label className="form-label">What do you want to learn?</label>
            <input
              className="form-input" type="text"
              placeholder="e.g. How do loops work in C?"
              value={form.question}
              onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Tell teachers what you want to understand</label>
            <textarea
              className="form-textarea"
              placeholder="Describe in detail what you're struggling with or what you'd like to learn…"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              Skill / Technology{' '}
              <span style={{ color: 'var(--text-muted)', textTransform: 'none', fontWeight: 400 }}>(optional)</span>
            </label>
            <select
              className="form-select"
              value={form.skill}
              onChange={(e) => setForm((f) => ({ ...f, skill: e.target.value }))}
            >
              <option value="">Select a skill…</option>
              {['C Programming','HTML','JavaScript','React','Python','Data Structures','Other'].map((s) => (
                <option key={s} value={s} style={{ background: 'var(--surface-1)' }}>{s}</option>
              ))}
            </select>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting…' : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
