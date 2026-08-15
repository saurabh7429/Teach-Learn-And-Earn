import { useEffect, useState } from 'react';
import { getMyRequests, getTeachingReqs, offerTeach, selectTeacher } from '../api';

export default function Requests() {
  const [activeTab,     setActiveTab]     = useState('learning');
  const [myRequests,    setMyRequests]    = useState([]);
  const [teachingReqs,  setTeachingReqs]  = useState([]);
  const [expandedId,    setExpandedId]    = useState(null);
  const [toast,         setToast]         = useState('');
  const [loadingId,     setLoadingId]     = useState(null);

  useEffect(() => {
    getMyRequests()   .then((r) => setMyRequests(r.data))   .catch(() => {});
    getTeachingReqs() .then((r) => setTeachingReqs(r.data)) .catch(() => {});
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const handleOffer = async (reqId) => {
    setLoadingId(reqId);
    try {
      await offerTeach(reqId);
      setTeachingReqs((prev) => prev.filter((r) => r._id !== reqId));
      showToast('Offer sent! The student will be notified. 🔔');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send offer.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleSelect = async (reqId, teacherId) => {
    setLoadingId(teacherId);
    try {
      const { data } = await selectTeacher(reqId, teacherId);
      setMyRequests((prev) => prev.map((r) => (r._id === reqId ? data : r)));
      showToast('Teacher selected! Chat has been opened. 🎉');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to select teacher.');
    } finally {
      setLoadingId(null);
    }
  };

  const statusBadge = (status) => {
    const map = {
      open:     { cls: 'badge-pending',  text: '⏳ Waiting for teacher selection' },
      selected: { cls: 'badge-verified', text: '✅ Teacher selected' },
      active:   { cls: 'badge-verified', text: '✅ Learning active' },
      closed:   { cls: 'badge-purple',   text: '🔒 Closed' },
    };
    const b = map[status] || map.open;
    return <span className={`badge ${b.cls}`}>{b.text}</span>;
  };

  return (
    <div className="page-body page-enter">
      <div className="container">
        <div className="page-header">
          <h1>Requests 🤝</h1>
          <p>Manage your learning requests and teaching offers.</p>
        </div>

        {/* Tabs */}
        <div className="tabs-wrapper">
          <button
            className={`tab-btn ${activeTab === 'learning' ? 'active' : ''}`}
            onClick={() => setActiveTab('learning')}
          >
            My Learning Requests
          </button>
          <button
            className={`tab-btn ${activeTab === 'teaching' ? 'active' : ''}`}
            onClick={() => setActiveTab('teaching')}
          >
            Teaching Requests
          </button>
        </div>

        {/* ── My Learning Requests ── */}
        {activeTab === 'learning' && (
          <div>
            {myRequests.length === 0 && (
              <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
                No learning requests yet. Go to <strong>Learn</strong> and create one!
              </div>
            )}
            {myRequests.map((req) => (
              <div className="card request-card" key={req._id}>
                <div className="request-card-question">&ldquo;{req.question}&rdquo;</div>
                {req.skill && <div className="request-card-meta">📌 {req.skill}</div>}

                {req.teacherResponses?.length > 0 && (
                  <span className="badge badge-purple" style={{ marginBottom: 10 }}>
                    👥 {req.teacherResponses.length} teacher{req.teacherResponses.length > 1 ? 's' : ''} interested
                  </span>
                )}

                <div style={{ marginBottom: 12 }}>{statusBadge(req.status)}</div>

                {req.status === 'open' && req.teacherResponses?.length > 0 && (
                  <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setExpandedId(expandedId === req._id ? null : req._id)}
                    >
                      {expandedId === req._id ? 'Hide Responses' : 'View Responses'}
                    </button>
                  </div>
                )}

                {/* Teacher responses */}
                {expandedId === req._id && (
                  <div className="teacher-responses">
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                      {req.teacherResponses.length} teacher{req.teacherResponses.length > 1 ? 's' : ''} willing to teach you:
                    </p>
                    {req.teacherResponses.map((resp) => (
                      <div className="teacher-response-item" key={resp.teacher?._id || resp._id}>
                        <div className="teacher-avatar">
                          {resp.teacher?.name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div className="teacher-info">
                          <div className="teacher-info-name">{resp.teacher?.name ?? 'Teacher'}</div>
                          <div className="teacher-info-skill">@{resp.teacher?.username} · {req.skill || 'General'} ✓</div>
                        </div>
                        <button
                          className="btn btn-primary btn-sm"
                          disabled={loadingId === resp.teacher?._id}
                          onClick={() => handleSelect(req._id, resp.teacher?._id)}
                        >
                          {loadingId === resp.teacher?._id ? '…' : 'Choose'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Teaching Requests ── */}
        {activeTab === 'teaching' && (
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
              Requests matching your verified skills
            </p>
            {teachingReqs.length === 0 && (
              <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
                No matching requests right now. Make sure your skills are verified!
              </div>
            )}
            {teachingReqs.map((req) => (
              <div className="card request-card" key={req._id}>
                <div className="request-card-question">&ldquo;{req.question}&rdquo;</div>
                <div className="request-card-meta">
                  👤 Student: {req.student?.name ?? 'Anonymous'}&nbsp;·&nbsp;
                  📌 {req.skill || 'General'}
                </div>
                <div className="request-card-meta" style={{ marginBottom: 16 }}>
                  Posted {new Date(req.createdAt).toLocaleDateString()}
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={loadingId === req._id}
                  onClick={() => handleOffer(req._id)}
                >
                  {loadingId === req._id ? 'Sending…' : 'I Can Teach This'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
