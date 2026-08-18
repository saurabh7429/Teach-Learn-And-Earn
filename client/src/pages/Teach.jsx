import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMySkills, addSkill, verifySkill, deleteSkill } from '../api';
import Modal from '../components/Modal';

export default function Teach() {
  const navigate = useNavigate();
  const [mySkills, setMySkills] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [selectedSkillForEval, setSelectedSkillForEval] = useState(null);
  const [evalStep, setEvalStep] = useState(0);
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    getMySkills().then((r) => setMySkills(r.data)).catch(() => {});
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

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

  const startAssessmentForSkill = (skill) => {
    setSelectedSkillForEval(skill);
    setEvalStep(1);
    setShowAssessment(true);
  };

  const handleCompleteAssessment = async () => {
    if (!selectedSkillForEval) return;
    try {
      const { data } = await verifySkill(selectedSkillForEval._id);
      setMySkills((prev) => prev.map((s) => (s._id === selectedSkillForEval._id ? data : s)));
      setShowAssessment(false);
      showToast(`Congratulations! Skill "${selectedSkillForEval.name}" is now verified by Teach Devta! ✓`);
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

  const evalQuestions = [
    { q: '1. What are the key core concepts of this skill?', options: ['Modularity & Clean Architecture', 'Copy-paste code', 'Ignoring error handling'] },
    { q: '2. How do you handle asynchronous or state operations efficiently?', options: ['Using proper state management & hooks', 'Infinite loops', 'Global mutation'] },
    { q: '3. How do you explain complex concepts to beginners?', options: ['Using real-world analogies & practical code examples', 'Using complex jargon', 'Skipping fundamentals'] },
  ];

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
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
              ＋ Add New Skill
            </button>
          </div>

          {mySkills.length === 0 && (
            <div className="card" style={{ padding: 36, textAlign: 'center', color: 'var(--text-muted)', marginBottom: 16 }}>
              <p style={{ marginBottom: 16, fontSize: '1rem' }}>You haven&apos;t added any teaching skills yet.</p>
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
                  {skill.verified ? '✓ Verified Teacher' : '⏳ Pending Verification'}
                </span>
              </div>
              <div className="teach-skill-students">
                👥 {skill.students?.length ?? 0} Active Student{skill.students?.length !== 1 ? 's' : ''}
              </div>
              <div className="teach-skill-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/requests')}>
                  👥 View Student Requests
                </button>
                {!skill.verified && (
                  <button className="btn btn-warning btn-sm" onClick={() => startAssessmentForSkill(skill)}>
                    🤖 Pass Assessment &amp; Get Verified
                  </button>
                )}
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(skill._id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Teach Devta — Assessment Banner */}
        <div className="teach-devta-assessment">
          <div className="teach-devta-avatar">🤖</div>
          <div className="teach-devta-info">
            <div className="teach-devta-name">Teach Devta Verification Engine</div>
            <div className="teach-devta-desc">
              Get verified before you start teaching. Answer 3 quick qualification questions — AI validates your expertise.
            </div>
          </div>
          {mySkills.filter((s) => !s.verified).length > 0 ? (
            <button
              className="btn btn-warning btn-sm"
              onClick={() => startAssessmentForSkill(mySkills.find((s) => !s.verified))}
            >
              Start Assessment 🤖
            </button>
          ) : (
            <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(true)}>
              Add Skill First
            </button>
          )}
        </div>
      </div>

      {/* Add Skill Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)} title="Add a Teaching Skill">
        <form onSubmit={handleAddSkill}>
          <div className="form-group">
            <label className="form-label">Skill Name</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. C Programming, Python, Data Structures…"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Brief Description</label>
            <textarea
              className="form-textarea"
              placeholder="What will you teach? What's your experience?"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="info-box" style={{ marginBottom: 20 }}>
            🤖 <strong>Next step:</strong> After adding, complete the Teach Devta Assessment to get verified and start receiving student requests.
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding…' : 'Add Skill'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Teach Devta Assessment Modal */}
      <Modal
        show={showAssessment}
        onClose={() => setShowAssessment(false)}
        title={`Teach Devta Assessment — ${selectedSkillForEval?.name ?? 'Skill'}`}
      >
        <div>
          {evalStep <= evalQuestions.length ? (
            <div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                Question {evalStep} of {evalQuestions.length}
              </p>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
                {evalQuestions[evalStep - 1]?.q}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {evalQuestions[evalStep - 1]?.options.map((opt, idx) => (
                  <button
                    key={opt}
                    className="btn btn-secondary"
                    style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                    onClick={() => {
                      if (evalStep < evalQuestions.length) {
                        setEvalStep((s) => s + 1);
                      } else {
                        handleCompleteAssessment();
                      }
                    }}
                  >
                    {idx === 0 ? '✓' : '•'} {opt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
              <h3>Assessment Completed!</h3>
              <p style={{ color: 'var(--text-secondary)', margin: '8px 0 20px' }}>
                You passed the Teach Devta verification test for {selectedSkillForEval?.name}.
              </p>
              <button className="btn btn-primary" onClick={handleCompleteAssessment}>
                Finish &amp; Verify Skill
              </button>
            </div>
          )}
        </div>
      </Modal>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
