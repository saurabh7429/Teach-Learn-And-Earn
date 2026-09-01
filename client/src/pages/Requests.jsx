import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyRequests, getTeachingReqs, offerTeach, selectTeacher } from '../api';

export default function Requests() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('learning');
  const [myRequests, setMyRequests] = useState([]);
  const [teachingReqs, setTeachingReqs] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [toast, setToast] = useState('');
  const [loadingId, setLoadingId] = useState(null);

  const fetchData = async () => {
    setPageLoading(true);
    setLoadError(null);
    try {
      const [myRes, teachingRes] = await Promise.all([
        getMyRequests(),
        getTeachingReqs(),
      ]);
      setMyRequests(myRes.data || []);
      setTeachingReqs(teachingRes.data || []);
    } catch (err) {
      setLoadError(
        err.response?.data?.message ||
        'Unable to connect to the requests service. Please check your network and try again.'
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

        {/* API Error State Banner with Retry */}
        {loadError && (
          <div className="api-state-card api-error-card" role="alert" aria-live="assertive">
            <div className="api-error-icon">⚠️</div>
            <h2 className="api-error-title">Unable to Load Requests Feed</h2>
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
            <span className="api-loading-text">Loading learning requests and teaching feed…</span>
          </div>
        )}

        {!pageLoading && !loadError && (
          <>
            {/* Tabs */}
            <div className="tabs-wrapper" role="tablist" aria-label="Request categories">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'learning'}
                className={`tab-btn ${activeTab === 'learning' ? 'active' : ''}`}
                onClick={() => setActiveTab('learning')}
              >
                My Learning Requests ({myRequests.length})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'teaching'}
                className={`tab-btn ${activeTab === 'teaching' ? 'active' : ''}`}
                onClick={() => setActiveTab('teaching')}
              >
                Open Teaching Feed ({teachingReqs.length})
              </button>
            </div>

            {/* ── Tab 1: My Learning Requests ── */}
            {activeTab === 'learning' && (
              <div role="tabpanel" aria-label="My Learning Requests">
                {myRequests.length === 0 ? (
                  <div className="card empty-state-card">
                    <div className="empty-state-icon">📝</div>
                    <div className="empty-state-title">You haven&apos;t posted any learning requests yet</div>
                    <p className="empty-state-desc">
                      Create your first learning request to get matched with qualified peer mentors.
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
              <div role="tabpanel" aria-label="Open Teaching Feed">
                {teachingReqs.length === 0 ? (
                  <div className="card empty-state-card">
                    <div className="empty-state-icon">🤝</div>
                    <div className="empty-state-title">No open student requests right now</div>
                    <p className="empty-state-desc">
                      Check back soon or add more teaching skills to get notified when students seek help.
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
          </>
        )}

        {/* Toast */}
        {toast && <div className="toast-notification" role="status" aria-live="polite">{toast}</div>}
      </div>
    </div>
  );
}
