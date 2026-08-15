import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMySkills, addSkill, verifySkill, deleteSkill } from '../api';
import Modal from '../components/Modal';

export default function Teach() {
  const navigate = useNavigate();
  const [mySkills,    setMySkills]    = useState([]);
  const [showModal,   setShowModal]   = useState(false);
  const [form,        setForm]        = useState({ name: '', description: '' });
  const [loading,     setLoading]     = useState(false);
  const [toast,       setToast]       = useState('');

  useEffect(() => {
    getMySkills().then((r) => setMySkills(r.data)).catch(() => {});
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await addSkill(form);
      setMySkills((prev) => [data, ...prev]);
      setShowModal(false);
      setForm({ name: '', description: '' });
      showToast('Skill added! Complete the Teach Devta Assessment to get verified. 🤖');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add skill.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    try {
      const { data } = await verifySkill(id);
      setMySkills((prev) => prev.map((s) => (s._id === id ? data : s)));
      showToast('Skill verified by Teach Devta! ✓');
    } catch (err) {
      showToast(err.response?.data?.message || 'Verification failed.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this skill?')) return;
    try {
      await deleteSkill(id);
      setMySkills((prev) => prev.filter((s) => s._id !== id));
      showToast('Skill removed.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed.');
    }
  };

  return (
    <div className="page-body page-enter">
      <div className="container">
        <div className="page-header">
          <h1>Teach 🎓</h1>
          <p>Share your knowledge with learners and help others grow.</p>
        </div>

        {/* My Teaching Skills */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">My Teaching Skills</h2>
          </div>

          {mySkills.length === 0 && (
            <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', marginBottom: 16 }}>
              <p style={{ marginBottom: 12 }}>You haven&apos;t added any teaching skills yet.</p>
              <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
                + Add Your First Skill
              </button>
            </div>
          )}

          {mySkills.map((skill) => (
            <div className="card teach-skill-card" key={skill._id}>
              <div className="teach-skill-header">
                <span className="teach-skill-name">{skill.name}</span>
                <span className={`badge ${skill.verified ? 'badge-verified' : 'badge-pending'}`}>
                  {skill.verified ? '✓ Verified' : '⏳ Pending'}
                </span>
              </div>
              <div className="teach-skill-students">
                👥 {skill.students?.length ?? 0} Active Student{skill.students?.length !== 1 ? 's' : ''}
              </div>
              <div className="teach-skill-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/requests')}>
                  👥 Student Requests
                </button>
                {!skill.verified && (
                  <button className="btn btn-warning btn-sm" onClick={() => handleVerify(skill._id)}>
                    🤖 Get Verified
                  </button>
                )}
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(skill._id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}

          <button className="btn btn-secondary" onClick={() => setShowModal(true)} style={{ marginTop: 8 }}>
            ＋ Add Skill
          </button>
        </div>

        {/* Teach Devta — Assessment Side */}
        <div className="teach-devta-assessment">
          <div className="teach-devta-avatar">🤖</div>
          <div className="teach-devta-info">
            <div className="teach-devta-name">Teach Devta Assessment</div>
            <div className="teach-devta-desc">
              Verify your knowledge before you start teaching. Answer 5 questions — AI evaluates your expertise.
            </div>
          </div>
          <button className="btn btn-warning btn-sm" onClick={() => showToast('Skill Assessment coming soon! 🤖')}>
            Start Assessment
          </button>
        </div>
      </div>

      {/* Add Skill Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)} title="Add a Teaching Skill">
        <form onSubmit={handleAddSkill}>
          <div className="form-group">
            <label className="form-label">Skill Name</label>
            <input
              className="form-input" type="text"
              placeholder="e.g. Python, Data Structures, UI Design…"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Brief Description</label>
            <textarea
              className="form-textarea"
              placeholder="What will you teach? What&apos;s your experience?"
              style={{ minHeight: 80 }}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="info-box info-box-warn" style={{ marginBottom: 20 }}>
            🤖 <strong>Next step:</strong> After adding, complete the Teach Devta Assessment (5 questions) to get verified and start teaching.
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding…' : 'Add Skill'}
            </button>
          </div>
        </form>
      </Modal>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
