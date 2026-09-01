import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMySkills, addSkill, verifySkill, deleteSkill, generateDevtaQuiz, getRequestsBySkill, getChats, offerTeach } from '../api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

export default function Teach({ onOpenAI }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mySkills, setMySkills]             = useState([]);
  const [myChats, setMyChats]               = useState([]);
  const [pageLoading, setPageLoading]       = useState(true);
  const [loadError, setLoadError]           = useState(null);
  const [showModal, setShowModal]           = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [selectedSkillForEval, setSelectedSkillForEval] = useState(null);

  // Students-for-skill modal
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [studentsSkill, setStudentsSkill]         = useState(null);
  const [activeSkillStudents, setActiveSkillStudents] = useState([]);
  const [openSkillRequests, setOpenSkillRequests]     = useState([]);
  const [studentsLoading, setStudentsLoading]     = useState(false);
  const [offerLoadingId, setOfferLoadingId]       = useState(null);

  // Dynamic AI Quiz State
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizLoading, setQuizLoading]     = useState(false);
  const [currentStep, setCurrentStep]     = useState(0);
  const [userAnswers, setUserAnswers]     = useState({});
  const [quizFinished, setQuizFinished]   = useState(false);
  const [score, setScore]                 = useState(0);

  const [form, setForm]     = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast]   = useState('');

  const fetchData = async () => {
    setPageLoading(true);
    setLoadError(null);
    try {
      const [skillsRes, chatsRes] = await Promise.all([
        getMySkills(),
        getChats(),
      ]);
      setMySkills(skillsRes.data || []);
      setMyChats(chatsRes.data || []);
    } catch (err) {
      setLoadError(
        err.response?.data?.message ||
        'Unable to connect to the teaching service. Please check your network and try again.'
      );
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
      showToast('Skill added! Complete the Teach Devta assessment to get verified. 🎓');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add skill.');
    } finally {
      setLoading(false);
    }
  };

  // ── Open students-for-skill modal ──
  const handleViewStudents = async (skill) => {
    setStudentsSkill(skill);
    setActiveSkillStudents([]);
    setOpenSkillRequests([]);
    setShowStudentsModal(true);
    setStudentsLoading(true);
    try {
      const { data } = await getRequestsBySkill(skill.name);
      setActiveSkillStudents(data.activeStudents || []);
      setOpenSkillRequests(data.openRequests || []);
    } catch {
      showToast('Could not load student requests.');
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleOfferFromSkill = async (reqId) => {
    setOfferLoadingId(reqId);
    try {
      await offerTeach(reqId);
      setOpenSkillRequests((prev) => prev.filter((r) => r._id !== reqId));
      showToast('Offer submitted! The student will be notified. 🔔');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit offer.');
    } finally {
      setOfferLoadingId(null);
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
      const res = await generateDevtaQuiz({ skillName: skill.name, skillDescription: skill.description });
      setQuizQuestions(res.data.questions || []);
    } catch {
      setQuizQuestions([
        {
          id: 1,
          question: `What is a primary architectural principle when building systems with ${skill.name}?`,
          options: ['Clean separation of concerns and modularity', 'Writing monolithic 5000-line scripts', 'Omitting error handling'],
          correctIndex: 0,
        },
        {
          id: 2,
          question: `How do you explain complex ${skill.name} concepts to a beginner?`,
          options: ['Using real-world analogies and live exercises', 'Overwhelming them with obscure trivia', 'Skipping fundamentals'],
          correctIndex: 0,
        },
        {
          id: 3,
          question: `How do you ensure reliability in ${skill.name}?`,
          options: ['Comprehensive testing and structured error logs', 'Ignoring exceptions', 'Hardcoding secrets'],
          correctIndex: 0,
        },
      ]);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleSelectOption = (qIdx, oIdx) => {
    setUserAnswers((prev) => ({ ...prev, [qIdx]: oIdx }));
  };

  const handleNextQuestion = async () => {
    if (currentStep < quizQuestions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      let correctCount = 0;
      quizQuestions.forEach((q, idx) => {
        if (userAnswers[idx] === q.correctIndex) correctCount++;
      });
      setScore(correctCount);
      setQuizFinished(true);

      if (correctCount >= 2 && selectedSkillForEval) {
        try {
          const { data } = await verifySkill(selectedSkillForEval._id);
          setMySkills((prev) => prev.map((s) => (s._id === selectedSkillForEval._id ? data : s)));
          showToast(`🎉 "${selectedSkillForEval.name}" is now Verified by Teach Devta!`);
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

  // Filter active teaching sessions (where logged in user is the teacher)
  const activeTeachingSessions = myChats.filter((c) => {
    const isTeacher =
      c.request?.selectedTeacher?._id === user?._id ||
      c.request?.selectedTeacher === user?._id;
    return isTeacher;
  });

  return (
    <div className="page-body page-enter">
      <div className="container">
        {/* Header */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1>Teach 🎓</h1>
            <p>Manage your students, teaching skills, and 1-on-1 learning chats.</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/requests')}>
              View Open Requests Feed 🤝
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
                  Skill Verification by Teach Devta
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                  Tap any skill to view enrolled students and open learning requests matching that subject.
                </p>
              </div>
            </div>
            <button className="btn btn-gradient btn-sm" onClick={() => onOpenAI?.('How does the Teach Devta assessment scoring work?')}>
              ⚡ Verification Guide
            </button>
          </div>
        </div>

        {/* API Error State Banner with Retry */}
        {loadError && (
          <div className="api-state-card api-error-card" role="alert" aria-live="assertive">
            <div className="api-error-icon">⚠️</div>
            <h2 className="api-error-title">Unable to Load Teaching Data</h2>
            <p className="api-error-desc">{loadError}</p>
            <button type="button" className="btn btn-primary btn-sm" onClick={fetchData}>
              🔄 Retry Connection
            </button>
          </div>
        )}

        {/* Loading Indicator */}
        {pageLoading && (
          <div className="card api-loading-card" role="status" aria-live="polite">
            <div className="spinner" />
            <span className="api-loading-text">Loading your teaching skills and active students…</span>
          </div>
        )}

        {!pageLoading && !loadError && (
          <>
            {/* ── Active Students & 1-on-1 Sessions ── */}
            <div className="dashboard-section">
              <div className="section-header">
                <h2 className="section-title">My Active Students &amp; Sessions</h2>
                <span className="badge badge-verified">{activeTeachingSessions.length} Active</span>
              </div>

              {activeTeachingSessions.length === 0 ? (
                <div className="card empty-state-card">
                  <div className="empty-state-icon">👥</div>
                  <div className="empty-state-title">No active students assigned yet</div>
                  <p className="empty-state-desc">
                    Browse the requests feed and offer to teach students to start 1-on-1 learning sessions.
                  </p>
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate('/requests')}>
                    Browse Student Requests →
                  </button>
                </div>
              ) : (
                <div className="grid-auto">
                  {activeTeachingSessions.map((chatItem) => {
                    const studentUser = chatItem.participants?.find((p) => p._id !== user?._id);
                    const isCompleted = chatItem.status === 'completed';
                    return (
                      <div className="card card-3d" key={chatItem._id}>
                        <div className="card-body">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <span className={`badge ${isCompleted ? 'badge-purple' : 'badge-verified'}`}>
                              {isCompleted ? '✓ Completed' : '🎓 Active Student'}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              {new Date(chatItem.updatedAt || chatItem.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)' }}>
                            {chatItem.skill || 'Peer Learning Session'}
                          </h3>
                          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                            Student: <strong>{studentUser?.name || 'Enrolled Student'}</strong> (@{studentUser?.username || 'student'})
                          </p>
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ width: '100%' }}
                            onClick={() => navigate(`/chat/${chatItem._id}`)}
                          >
                            💬 Open Chat with {studentUser?.name?.split(' ')[0] || 'Student'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── My Teaching Skills Grid ── */}
            <div className="dashboard-section">
              <div className="section-header">
                <h2 className="section-title">My Teaching Skills</h2>
                <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
                  ＋ Add New Skill
                </button>
              </div>

              {mySkills.length === 0 ? (
                <div className="card empty-state-card">
                  <div className="empty-state-icon">🎓</div>
                  <div className="empty-state-title">You haven&apos;t added any teaching skills yet</div>
                  <p className="empty-state-desc">
                    Add subjects you are proficient in and complete a quick 3-question assessment to get verified.
                  </p>
                  <button className="btn btn-primary btn-md" onClick={() => setShowModal(true)}>
                    + Add Your First Skill
                  </button>
                </div>
              ) : (
                <div className="grid-auto">
                  {mySkills.map((skill) => (
                    <div className="card card-3d" key={skill._id} style={{ cursor: 'pointer' }} onClick={() => handleViewStudents(skill)}>
                      <div className="card-body">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                          <span className={`badge ${skill.verified ? 'badge-verified' : 'badge-pending'}`}>
                            {skill.verified ? '✓ Verified Teacher' : '⏳ Pending Assessment'}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(skill._id); }}
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
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--accent-indigo)', fontWeight: 700 }}>
                              👥 View Students →
                            </span>
                            {!skill.verified && (
                              <button
                                className="btn btn-gradient btn-xs"
                                onClick={(e) => { e.stopPropagation(); startAssessmentForSkill(skill); }}
                              >
                                ⚡ Take Quiz
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Modal: Add New Skill ── */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Teaching Skill 🎓">
          <form onSubmit={handleAddSkill}>
            <div className="form-group">
              <label className="form-label" htmlFor="teach-skill-name">Skill Name *</label>
              <input
                id="teach-skill-name"
                className="form-input"
                type="text"
                placeholder="e.g. C++, React, Node.js, Python, DSA"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="teach-skill-description">Experience &amp; What You Can Teach</label>
              <textarea
                id="teach-skill-description"
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

        {/* ── Modal: Students for this skill (Active & Open) ── */}
        <Modal
          isOpen={showStudentsModal}
          onClose={() => setShowStudentsModal(false)}
          title={`Students for ${studentsSkill?.name || 'Skill'} 👥`}
        >
          {studentsLoading ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div className="spinner" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--text-secondary)' }}>Loading student requests…</p>
            </div>
          ) : (activeSkillStudents.length === 0 && openSkillRequests.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📚</div>
              <p>No active students or open requests for <strong>{studentsSkill?.name}</strong> right now.</p>
              <p style={{ fontSize: '0.88rem', marginTop: 8 }}>Browse all requests in the feed to find learners.</p>
              <button className="btn btn-secondary btn-sm" style={{ marginTop: 16 }} onClick={() => { setShowStudentsModal(false); navigate('/requests'); }}>
                Browse All Requests →
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Section 1: Active Enrolled Students */}
              {activeSkillStudents.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--success)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>✅</span> Active Enrolled Students ({activeSkillStudents.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {activeSkillStudents.map((req) => (
                      <div
                        key={req._id}
                        style={{
                          background: 'var(--surface)',
                          border: '1px solid var(--success)',
                          borderRadius: 'var(--radius-md)',
                          padding: '14px 16px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: 10,
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            🎓 {req.student?.name || 'Student'} (@{req.student?.username || 'user'})
                          </div>
                          <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                            &ldquo;{req.question}&rdquo;
                          </div>
                        </div>
                        {req.chatId ? (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              setShowStudentsModal(false);
                              navigate(`/chat/${req.chatId}`);
                            }}
                          >
                            💬 Open Chat
                          </button>
                        ) : (
                          <span className="badge badge-verified">Assigned</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 2: Open Requests Seeking Teachers */}
              {openSkillRequests.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-indigo)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>⏳</span> Open Requests Seeking Teacher ({openSkillRequests.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {openSkillRequests.map((req) => (
                      <div
                        key={req._id}
                        style={{
                          background: 'var(--surface-inset)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-md)',
                          padding: 14,
                        }}
                      >
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                          &ldquo;{req.question}&rdquo;
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 10 }}>
                          Student: <strong>{req.student?.name || 'Anonymous'}</strong>
                          {req.description && ` • ${req.description.slice(0, 70)}…`}
                        </div>
                        <button
                          className="btn btn-primary btn-sm"
                          disabled={offerLoadingId === req._id}
                          onClick={() => handleOfferFromSkill(req._id)}
                        >
                          {offerLoadingId === req._id ? 'Sending…' : '✋ Offer to Teach'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* ── Modal: AI Skill Assessment ── */}
        <Modal
          isOpen={showAssessment}
          onClose={() => setShowAssessment(false)}
          title={`Teach Devta Verification: ${selectedSkillForEval?.name || 'Skill'}`}
        >
          {quizLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div className="spinner" style={{ margin: '0 auto 16px' }} />
              <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                Generating your skill assessment questions…
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
                  : ' Review the core fundamentals and retry anytime.'}
              </p>
              <button className="btn btn-primary btn-md" onClick={() => setShowAssessment(false)}>
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
                    Teach Devta Assessment
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
                        style={{ textAlign: 'left', justifyContent: 'flex-start', padding: '12px 18px', borderRadius: 'var(--radius-md)', fontSize: '0.92rem' }}
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
