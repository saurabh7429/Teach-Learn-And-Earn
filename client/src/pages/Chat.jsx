import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { getChat, sendMessage as apiSendMessage, completeChat } from '../api';
import { useAuth } from '../context/AuthContext';
import MarkdownRenderer from '../components/MarkdownRenderer';

let socket;

export default function Chat() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const [chat, setChat]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [loadError, setLoadError]   = useState(null);
  const [input, setInput]           = useState('');
  const [sending, setSending]       = useState(false);
  const [sendError, setSendError]   = useState('');
  const [completing, setCompleting] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchChat = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { data } = await getChat(id);
      setChat(data);
    } catch (err) {
      if (err.response?.status === 404) {
        setLoadError('Learning chat session not found or has been removed.');
      } else if (err.response?.status === 403) {
        setLoadError('You do not have permission to access this chat session.');
      } else {
        setLoadError(
          err.response?.data?.message ||
          'Unable to load the chat room. Please check your connection and try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  // ── Socket.IO setup ──
  useEffect(() => {
    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ||
      (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : 'http://localhost:5000');
    socket = io(socketUrl, { transports: ['websocket', 'polling'] });
    socket.emit('join_chat', id);

    socket.on('new_message', (updatedChat) => {
      setChat(updatedChat);
    });

    socket.on('session_completed', (updatedChat) => {
      setChat(updatedChat);
    });

    return () => {
      socket.emit('leave_chat', id);
      socket.disconnect();
    };
  }, [id]);

  // ── Load initial chat ──
  useEffect(() => {
    fetchChat();
  }, [fetchChat]);

  // ── Auto-scroll ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  const otherParticipant = chat?.participants?.find(
    (p) => p._id !== user?._id
  );

  const isCompleted = chat?.status === 'completed';

  // Determine roles
  const teacherId =
    chat?.request?.selectedTeacher?._id || chat?.request?.selectedTeacher;

  const amITeacher =
    teacherId && user?._id && teacherId.toString() === user._id.toString();

  const myRoleBadge    = amITeacher ? '👨‍🏫 Teacher' : '🎓 Student';
  const otherRoleBadge = amITeacher ? '🎓 Student' : '👨‍🏫 Teacher';

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending || isCompleted) return;
    setSending(true);
    setSendError('');
    setInput('');
    try {
      const { data } = await apiSendMessage(id, text);
      setChat(data);
    } catch (err) {
      setInput(text);
      setSendError(err.response?.data?.message || 'Failed to send message. Please retry.');
      setTimeout(() => setSendError(''), 4000);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCompleteSession = async () => {
    if (!confirm('Mark this session as complete? Messaging will be closed.')) return;
    setCompleting(true);
    try {
      const { data } = await completeChat(id);
      setChat(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete session.');
    } finally {
      setCompleting(false);
    }
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (loadError) {
    return (
      <div className="page-body page-enter" style={{ padding: '60px 20px', maxWidth: 560, margin: '0 auto' }}>
        <div className="api-state-card api-error-card" role="alert" aria-live="assertive">
          <div className="api-error-icon">⚠️</div>
          <h2 className="api-error-title">Chat Session Error</h2>
          <p className="api-error-desc">{loadError}</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button type="button" className="btn btn-primary btn-sm" onClick={fetchChat}>
              🔄 Retry Connection
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate('/learn')}>
              ← Back to Learn
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !chat) {
    return (
      <div className="page-body" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="card api-loading-card" role="status" aria-live="polite">
          <div className="spinner" />
          <span className="api-loading-text">Connecting to learning chat room…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page-body chat-page-wrapper">
      <div className="chat-page">

        {/* ── Chat Header ── */}
        <div className="chat-header">
          <div className="chat-header-left">
            <button className="chat-back-btn" onClick={() => navigate(-1)} title="Back" aria-label="Go back">
              ←
            </button>
            <div className="chat-header-info">
              <div className="chat-header-title">
                {chat.skill || 'Peer Learning Session'}
              </div>
              <div className="chat-header-sub">
                {isCompleted ? (
                  <span style={{ color: 'var(--success)' }}>✅ Session Completed</span>
                ) : otherParticipant ? (
                  amITeacher ? (
                    <span>🎓 Student: <strong>{otherParticipant.name}</strong></span>
                  ) : (
                    <span>👨‍🏫 Teacher: <strong>{otherParticipant.name}</strong></span>
                  )
                ) : (
                  'Live Session'
                )}
              </div>
            </div>
          </div>

          <div className="chat-header-right">
            {/* Role badge */}
            <span className="badge badge-indigo chat-role-badge">
              {myRoleBadge}
            </span>

            {/* Other participant pill */}
            {otherParticipant && (
              <div className="chat-peer-pill">
                <div className="profile-avatar" style={{ width: 28, height: 28, fontSize: '0.78rem', flexShrink: 0 }}>
                  {(otherParticipant?.name?.[0] || 'P').toUpperCase()}
                </div>
                <div className="chat-peer-info">
                  <span className="chat-peer-name">
                    {otherParticipant?.name || 'Peer'}
                  </span>
                  <span className="chat-peer-role">{otherRoleBadge}</span>
                </div>
              </div>
            )}

            {/* Complete Session button — desktop only */}
            {!isCompleted && (
              <button
                className="btn btn-secondary btn-sm chat-complete-btn"
                onClick={handleCompleteSession}
                disabled={completing}
                title="Mark session as complete"
              >
                {completing ? '…' : '✔ Complete'}
              </button>
            )}
          </div>
        </div>

        {/* ── Mobile: Complete Session bar ── */}
        {!isCompleted && (
          <div className="chat-mobile-action-bar">
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleCompleteSession}
              disabled={completing}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {completing ? 'Completing…' : '✔ Mark Session Complete'}
            </button>
          </div>
        )}

        {/* Session completed banner */}
        {isCompleted && (
          <div className="chat-completed-banner">
            ✅ This session was completed on {new Date(chat.completedAt).toLocaleDateString()}.
            Thank you for learning together!
          </div>
        )}

        {/* Messages Stream */}
        <div className="chat-messages" role="log" aria-live="polite" aria-relevant="additions text">
          {chat.messages.length === 0 ? (
            <div className="chat-empty-state">
              <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>👋</div>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>No messages yet.</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {amITeacher
                  ? `Say hello to your student (${otherParticipant?.name || 'Student'}) to begin!`
                  : `Say hello to your teacher (${otherParticipant?.name || 'Teacher'}) to begin!`}
              </p>
            </div>
          ) : (
            chat.messages.map((msg) => {
              const isMe = msg.sender?._id === user?._id;
              const initial = msg.sender?.name?.[0]?.toUpperCase() ?? (isMe ? 'U' : '?');
              const senderName = isMe ? 'You' : (msg.sender?.name || otherParticipant?.name || 'Peer');
              const senderRole = isMe ? myRoleBadge : otherRoleBadge;

              return (
                <div className={`chat-msg ${isMe ? 'me' : ''}`} key={msg._id || Math.random()}>
                  <div className="chat-msg-avatar">{initial}</div>
                  <div className="chat-msg-body">
                    <div className={`chat-msg-meta ${isMe ? 'me' : ''}`}>
                      {senderName} · {senderRole}
                    </div>
                    <div className="chat-bubble">
                      <MarkdownRenderer content={msg.content} />
                    </div>
                    <span className="chat-time">{formatTime(msg.sentAt)}</span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Bar */}
        {isCompleted ? (
          <div className="chat-closed-bar">
            🔒 Session completed — messaging is closed.
          </div>
        ) : (
          <div>
            {sendError && (
              <div className="neo-error-badge" style={{ margin: '8px 16px', fontSize: '0.85rem' }} role="alert" aria-live="assertive">
                {sendError}
              </div>
            )}
            <form
              className="chat-input-bar"
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
            >
              <textarea
                id="chat-message-input"
                className="chat-input-field"
                placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={sending}
                rows={1}
                aria-label="Type a message"
                aria-describedby="chat-message-help"
                style={{ resize: 'none', overflowY: 'hidden', lineHeight: '1.5' }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
              />
              <span id="chat-message-help" className="sr-only">Press Enter to send and Shift plus Enter for a new line.</span>
              <button
                type="submit"
                className="chat-send-btn"
                disabled={!input.trim() || sending}
                title="Send message"
                aria-label="Send message"
              >
                {sending ? '…' : '➤'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
