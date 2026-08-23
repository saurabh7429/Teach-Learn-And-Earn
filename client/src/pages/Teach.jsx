import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMySkills, addSkill, verifySkill, deleteSkill, generateDevtaQuiz } from '../api';
import Modal from '../components/Modal';

export default function Teach({ onOpenAI }) {
  const navigate = useNavigate();
  const [mySkills, setMySkills] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [selectedSkillForEval, setSelectedSkillForEval] = useState(null);
  
  // Dynamic Groq AI Quiz State
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [score, setScore] = useState(0);

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
      showToast('Skill added! Start Teach Devta Assessment to earn verified status. 🎓');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add skill.');
    } finally {
      setLoading(false);
    }
  };

  const startAssessmentForSkill = async (skill) => {
    setSelectedSkillForEval(skill);
    setCurrentStep(0);
    setUserAnswers({});
    setQuizFinished(false);
    setScore(0);
    setShowAssessment(true);
    setQuizLoading(true);

    try {
      // Call real Groq AI backend to generate 3 dynamic questions
      const res = await generateDevtaQuiz({ 
        skillName: skill.name, 
        skillDescription: skill.description 
      });
      setQuizQuestions(res.data.questions || []);
    } catch (err) {
      console.warn('Failed to load dynamic Groq quiz, using fallback');
      setQuizQuestions([
        {
          id: 1,
          question: `What is a primary architectural principle when building systems with ${skill.name}?`,
          options: ['Clean separation of concerns and modularity', 'Writing monolithic 5000-line scripts', 'Omitting error handling'],
          correctIndex: 0,
        },
        {
          id: 2,
          question: `How do you explain complex ${skill.name} concepts to a beginner student?`,
          options: ['Using real-world analogies and live code exercises', 'Overwhelming them with obscure trivia', 'Skipping fundamentals'],
          correctIndex: 0,
        },
        {
          id: 3,
          question: `How do you ensure reliability and bug resilience in ${skill.name}?`,
          options: ['Comprehensive testing, validation, and structured error logs', 'Ignoring exceptions', 'Hardcoding secrets in repository'],
          correctIndex: 0,
        },
      ]);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleSelectOption = (questionIdx, optionIdx) => {
    setUserAnswers((prev) => ({ ...prev, [questionIdx]: optionIdx }));
  };

  const handleNextQuestion = async () => {
    if (currentStep < quizQuestions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Evaluate score
      let correctCount = 0;
      quizQuestions.forEach((q, idx) => {
        if (userAnswers[idx] === q.correctIndex) {
          correctCount++;
        }
      });
      setScore(correctCount);
      setQuizFinished(true);

      // If passed (at least 2/3 correct), verify skill
      if (correctCount >= 2 && selectedSkillForEval) {
        try {
          const { data } = await verifySkill(selectedSkillForEval._id);
          setMySkills((prev) => prev.map((s) => (s._id === selectedSkillForEval._id ? data : s)));
          showToast(`🎉 Congratulations! "${selectedSkillForEval.name}" is now verified by Teach Devta AI!`);
        } catch (err) {
          showToast(err.response?.data?.message || 'Verification update failed.');
        }
      }
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
        {/* Header */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1>Teach 🎓</h1>
            <p>Share your expertise with learners and build your teaching portfolio.</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/requests')}>
              View Open Learning Requests 🤝
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
              + Add Teaching Skill
            </button>
          </div>
        </div>

        {/* Verification Info Banner */}
        <div className="card card-3d" style={{ padding: 24, marginBottom: 36, background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)', borderColor: 'var(--primary-glow)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ fontSize: '2.4rem' }}>🛡️</div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Teach Devta AI Verification Engine
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                  Verified teachers earn verified badges and receive priority placement when responding to student learning requests.
                </p>
              </div>
            </div>
            <button className="btn btn-gradient btn-sm" onClick={() => onOpenAI?.('How does the Teach Devta assessment scoring work?')}>
              ⚡ Verification Guide
            </button>
          </div>
        </div>

        {/* My Teaching Skills Grid */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">My Teaching Skills</h2>
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
              ＋ Add New Skill
            </button>
          </div>

          {mySkills.length === 0 ? (
            <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎓</div>
              <p style={{ marginBottom: 18, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                You haven&apos;t added any teaching skills yet.
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: 20 }}>
                Add subjects you are proficient in and complete the quick 3-question AI assessment to get verified.
              </p>
              <button className="btn btn-primary btn-md" onClick={() => setShowModal(true)}>
                + Add Your First Skill
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
              {mySkills.map((skill) => (
                <div className="card card-3d" key={skill._id}>
                  <div className="card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                      <span className={`badge ${skill.verified ? 'badge-verified' : 'badge-pending'}`}>
                        {skill.verified ? '✓ Verified Teacher' : '⏳ Pending Assessment'}
                      </span>
                      <button
                        onClick={() => handleDelete(skill._id)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}
                        title="Remove skill"
                      >
                        ✕
                      </button>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
                      {skill.name}
                    </h3>
                    <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 20, minHeight: 42 }}>
                      {skill.description || 'No specific description provided.'}
                    </p>

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                      {skill.verified ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 700 }}>
                            ✅ Qualified by Teach Devta
                          </span>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => navigate('/requests')}
                          >
                            Find Students →
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn btn-gradient btn-sm"
                          style={{ width: '100%' }}
                          onClick={() => startAssessmentForSkill(skill)}
                        >
                          ⚡ Take AI Verification Quiz
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Modal: Add New Skill ── */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Teaching Skill 🎓">
          <form onSubmit={handleAddSkill}>
            <div className="form-group">
              <label className="form-label">Skill Name *</label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g. React & Next.js, Node.js, Python, UI/UX"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Experience &amp; What You Can Teach</label>
              <textarea
                className="form-textarea"
                placeholder="Describe your background and what topics you specialize in…"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-md" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Adding Skill…' : '＋ Add Skill & Take Assessment'}
            </button>
          </form>
        </Modal>

        {/* ── Modal: Dynamic Groq AI Skill Assessment ── */}
        <Modal
          isOpen={showAssessment}
          onClose={() => setShowAssessment(false)}
          title={`Teach Devta Verification: ${selectedSkillForEval?.name || 'Skill'}`}
        >
          {quizLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div className="spinner" style={{ margin: '0 auto 16px' }} />
              <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                Generating dynamic assessment questions with Groq Llama 3.3…
              </p>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Analyzing {selectedSkillForEval?.name} topics
              </span>
            </div>
          ) : quizFinished ? (
            <div style={{ textAlign: 'center', padding: '24px 10px' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>
                {score >= 2 ? '🏆' : '📚'}
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
                {score >= 2 ? 'Assessment Passed!' : 'Needs Further Review'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: 20 }}>
                You scored <strong>{score} / {quizQuestions.length}</strong> on the {selectedSkillForEval?.name} examination.
                {score >= 2 
                  ? ' You are now a Verified Teacher on TL&E!' 
                  : ' Review the core fundamentals and retry the assessment anytime.'}
              </p>
              <button
                className="btn btn-primary btn-md"
                onClick={() => setShowAssessment(false)}
              >
                {score >= 2 ? 'Done & Return to Teaching' : 'Close & Try Again Later'}
              </button>
            </div>
          ) : (
            quizQuestions.length > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span className="badge badge-indigo">
                    Question {currentStep + 1} of {quizQuestions.length}
                  </span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Groq AI Evaluation
                  </span>
                </div>

                <div className="progress-bar-track" style={{ marginBottom: 20 }}>
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${((currentStep + 1) / quizQuestions.length) * 100}%` }}
                  />
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
                  {quizQuestions[currentStep]?.question}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                  {quizQuestions[currentStep]?.options.map((opt, optIdx) => {
                    const isSelected = userAnswers[currentStep] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(currentStep, optIdx)}
                        className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                        style={{
                          textAlign: 'left',
                          justifyContent: 'flex-start',
                          padding: '12px 18px',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.92rem',
                        }}
                      >
                        <span style={{ fontWeight: 800, marginRight: 8 }}>
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>

                <button
                  className="btn btn-gradient btn-md"
                  style={{ width: '100%' }}
                  disabled={userAnswers[currentStep] === undefined}
                  onClick={handleNextQuestion}
                >
                  {currentStep < quizQuestions.length - 1 ? 'Next Question →' : 'Submit Assessment 🏁'}
                </button>
              </div>
            )
          )}
        </Modal>

        {/* Toast */}
        {toast && <div className="toast-notification">{toast}</div>}
      </div>
    </div>
  );
}
