import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyRequests, getTeachingReqs, offerTeach, selectTeacher } from '../api';

export default function Requests() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('learning');
  const [myRequests, setMyRequests] = useState([]);
  const [teachingReqs, setTeachingReqs] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [toast, setToast] = useState('');
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    getMyRequests().then((r) => setMyRequests(r.data)).catch(() => {});
    getTeachingReqs().then((r) => setTeachingReqs(r.data)).catch(() => {});
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleOffer = async (reqId) => {
    setLoadingId(reqId);
    try {
      await offerTeach(reqId);
      setTeachingReqs((prev) => prev.filter((r) => r._id !== reqId));
      showToast('Offer submitted! The student will be notified. 🔔');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit offer.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleSelect = async (reqId, teacherId) => {
    setLoadingId(teacherId);
    try {
      const { data } = await selectTeacher(reqId, teacherId);
      setMyRequests((prev) => prev.map((r) => (r._id === reqId ? data : r)));
      showToast('Teacher selected! 1-on-1 Chat room is now active. 🎉');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to select teacher.');
    } finally {
      setLoadingId(null);
    }
  };

  const statusBadge = (status) => {
    const map = {
      open:     { cls: 'badge-pending',  text: '⏳ Open for Offers' },
      selected: { cls: 'badge-verified', text: '✅ Teacher Assigned' },
      active:   { cls: 'badge-verified', text: '✅ Learning Active' },
      closed:   { cls: 'badge-purple',   text: '🔒 Closed' },
    };
    const b = map[status] || map.open;
    return <span className={`badge ${b.cls}`}>{b.text}</span>;
  };

  return (
    <div className="page-body page-enter">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <h1>Requests 🤝</h1>
          <p>Coordinate learning offers, review applications, and launch direct sessions.</p>
        </div>

        {/* Tabs */}
        <div className="tabs-wrapper">
          <button
            className={`tab-btn ${activeTab === 'learning' ? 'active' : ''}`}
            onClick={() => setActiveTab('learning')}
          >
            My Learning Requests ({myRequests.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'teaching' ? 'active' : ''}`}
            onClick={() => setActiveTab('teaching')}
          >
            Open Teaching Feed ({teachingReqs.length})
          </button>
        </div>

        {/* ── Tab 1: My Learning Requests ── */}
        {activeTab === 'learning' && (
          <div>
            {myRequests.length === 0 ? (
              <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
                <p style={{ marginBottom: 16, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                  You haven&apos;t posted any learning requests yet.
                </p>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/learn')}>
                  + Post a Learning Request
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {myRequests.map((req) => (
                  <div className="card card-3d request-card" key={req._id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
                      <div>
                        <div className="request-card-question">&ldquo;{req.question}&rdquo;</div>
                        {req.skill && <div className="request-card-meta">📌 Topic: {req.skill}</div>}
                      </div>
                      <div>{statusBadge(req.status)}</div>
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: 16 }}>
                      {req.description || 'No additional notes.'}
                    </p>

                    {/* Teacher Responses */}
                    {req.teacherResponses?.length > 0 && req.status === 'open' && (
                      <div style={{ background: 'var(--surface-inset)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 18, marginTop: 14 }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                          Interested Teachers ({req.teacherResponses.length}):
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {req.teacherResponses.map((item, idx) => {
                            const teacherUser = item.teacher && typeof item.teacher === 'object' ? item.teacher : { _id: item.teacher, name: 'Teacher', username: 'peer' };
                            const teacherId = teacherUser._id || item.teacher || item._id;
                            const teacherName = teacherUser.name || 'Peer Teacher';
                            const teacherUsername = teacherUser.username || 'expert';

                            return (
                              <div
                                key={item._id || idx}
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                              >
                                <div>
                                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{teacherName}</div>
                                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>@{teacherUsername}</div>
                                </div>
                                <button
                                  className="btn btn-primary btn-sm"
                                  disabled={loadingId === teacherId}
                                  onClick={() => handleSelect(req._id, teacherId)}
                                >
                                  {loadingId === teacherId ? 'Connecting…' : '✓ Accept & Open Chat 💬'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {req.selectedTeacher && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                          Assigned Teacher: <strong>{req.selectedTeacher.name}</strong>
                        </span>
                        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/learn')}>
                          Go to Session →
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tab 2: Teaching Requests Feed ── */}
        {activeTab === 'teaching' && (
          <div>
            {teachingReqs.length === 0 ? (
              <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
                <p style={{ marginBottom: 16, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                  No open student requests matching your skills right now.
                </p>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/teach')}>
                  + Add More Teaching Skills
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {teachingReqs.map((req) => (
                  <div className="card card-3d request-card" key={req._id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
                      <div>
                        <div className="request-card-question">&ldquo;{req.question}&rdquo;</div>
                        <div className="request-card-meta">
                          Student: <strong>{req.student?.name || 'Anonymous'}</strong> • Topic: {req.skill}
                        </div>
                      </div>
                      <span className="badge badge-indigo">Seeking Teacher</span>
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: 18 }}>
                      {req.description || 'No detailed description provided.'}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={loadingId === req._id}
                        onClick={() => handleOffer(req._id)}
                      >
                        {loadingId === req._id ? 'Sending…' : '✋ Offer to Teach This Student'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Toast */}
        {toast && <div className="toast-notification">{toast}</div>}
      </div>
    </div>
  );
}
